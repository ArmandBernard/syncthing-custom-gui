import { type ReactNode, useRef, useState } from 'react'
import { useDeviceID } from '../device-id/useDeviceID.ts'
import type { DeviceID } from '@lib/syncthing/types/common.ts'
import type { SystemConnections } from '@lib/syncthing/types/system.ts'
import { useBeforeUnload } from '@hooks/useBeforeUnload.ts'
import { useOnSyncthingQuerySuccess } from '@hooks/useOnSyncthingQuerySuccess.ts'
import { TransferHistoryContext } from './TransferHistoryContext.ts'
import type { TransferHistoryPoint } from './useDeviceTransferHistory.ts'
import { getEnumEntries } from '@lib/getEnumEntries.ts'

const HISTORY_LENGTH = 60
const STORAGE_KEY = 'syncthing-transfer-history'
interface Sample {
  at: number
  inBytesTotal: number
  outBytesTotal: number
}

interface Rates {
  inBytesTotal: number
  outBytesTotal: number
}

/**
 * Syncthing's API only reports cumulative transfer totals, not instantaneous
 * speed, so this derives a rolling in/out bytes-per-second history by diffing
 * successive `/system/connections` polls.
 *
 * Samples are taken from the query cache as each poll lands, rather than from
 * the latest value in render, so every poll is sampled exactly once.
 */
export function TransferHistoryContextProvider({ children }: { children: ReactNode }) {
  const myId = useDeviceID()
  const lastSamples = useRef<Record<DeviceID, Sample>>({})
  const [history, setHistory] =
    useState<Record<DeviceID, TransferHistoryPoint[]>>(loadStoredHistory)

  // save the history to local storage as the window is closed
  useBeforeUnload(() => sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history)))

  function recordSample(connections: SystemConnections) {
    // `Connection.at` doesn't advance for idle connections, so the poll's
    // receipt time is used as the sample timestamp instead.
    const sampleTime = Date.now()
    const newPoints: Record<DeviceID, TransferHistoryPoint> = {}
    const connectionsAndMe: [DeviceID, Rates][] = [
      ...getEnumEntries(connections.connections),
      [myId, connections.total],
    ]

    for (const [deviceID, connection] of connectionsAndMe) {
      const rates = captureRates(lastSamples.current, deviceID, connection, sampleTime)

      if (!rates) {
        continue
      }

      newPoints[deviceID] = { time: sampleTime, ...rates }
    }

    if (Object.keys(newPoints).length === 0) {
      return
    }

    setHistory((prevHistory) => {
      const nextHistory = { ...prevHistory }
      for (const [deviceID, point] of getEnumEntries(newPoints)) {
        nextHistory[deviceID] = [...(nextHistory[deviceID] ?? []), point].slice(-HISTORY_LENGTH)
      }
      return nextHistory
    })
  }

  useOnSyncthingQuerySuccess('GET /system/connections', recordSample)

  return (
    <TransferHistoryContext.Provider value={history}>{children}</TransferHistoryContext.Provider>
  )
}

/** Records the new baseline for `deviceID` and returns its rate since the previous one, if any. */
function captureRates(
  lastSamples: Record<DeviceID, Sample>,
  deviceID: DeviceID,
  bytesTotal: Rates,
  sampleTime: number,
) {
  const previous = lastSamples[deviceID]
  lastSamples[deviceID] = {
    at: sampleTime,
    inBytesTotal: bytesTotal.inBytesTotal,
    outBytesTotal: bytesTotal.outBytesTotal,
  }

  // No baseline yet, or a stale/duplicate sample (e.g. `at` didn't advance).
  if (!previous || sampleTime <= previous.at) {
    return null
  }

  const deltaSeconds = (sampleTime - previous.at) / 1000
  // Byte counters can reset on reconnect; clamp negative deltas to 0.
  const inRate = Math.max(0, bytesTotal.inBytesTotal - previous.inBytesTotal) / deltaSeconds
  const outRate = Math.max(0, bytesTotal.outBytesTotal - previous.outBytesTotal) / deltaSeconds

  return {
    inRate,
    outRate,
  }
}

function loadStoredHistory(): Record<DeviceID, TransferHistoryPoint[]> {
  const stored = sessionStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : {}
}

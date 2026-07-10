import { type ReactNode, useEffect, useRef, useState } from 'react'
import { useConnections } from '../connections/useConnections.ts'
import { useDeviceID } from '../device-id/useDeviceID.ts'
import type { DeviceID } from '../../lib/syncthing/types/common.ts'
import { useBeforeUnload } from '../../hooks/useBeforeUnload.ts'
import { TransferHistoryContext } from './TransferHistoryContext.ts'

const HISTORY_LENGTH = 60
const STORAGE_KEY = 'syncthing-transfer-history'

export interface TransferHistoryPoint {
  time: number
  inRate: number
  outRate: number
}

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
 */
export function TransferHistoryContextProvider({ children }: { children: ReactNode }) {
  const connections = useConnections()
  const myId = useDeviceID()
  const lastSamples = useRef<Record<DeviceID, Sample>>({})
  const [history, setHistory] =
    useState<Record<DeviceID, TransferHistoryPoint[]>>(loadStoredHistory)

  useBeforeUnload(() => sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history)))

  useEffect(() => {
    if (!connections) {
      return
    }

    // `Connection.at` doesn't advance for idle connections, so the poll's
    // receipt time is used as the sample timestamp instead.
    const sampleTime = Date.now()
    const newPoints: Record<DeviceID, TransferHistoryPoint> = {}
    const connectionsAndMe: [DeviceID, Rates][] = [
      ...Object.entries(connections.connections),
      [myId, connections.total],
    ]

    for (const [deviceID, connection] of connectionsAndMe) {
      const rates = captureRates(deviceID, connection, sampleTime)

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
      for (const [deviceID, point] of Object.entries(newPoints)) {
        nextHistory[deviceID] = [...(nextHistory[deviceID] ?? []), point].slice(-HISTORY_LENGTH)
      }
      return nextHistory
    })
  }, [connections, myId])

  function captureRates(deviceID: DeviceID, bytesTotal: Rates, sampleTime: number) {
    const previous = lastSamples.current[deviceID]
    lastSamples.current[deviceID] = {
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

  return (
    <TransferHistoryContext.Provider value={history}>{children}</TransferHistoryContext.Provider>
  )
}

function loadStoredHistory(): Record<DeviceID, TransferHistoryPoint[]> {
  const stored = sessionStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : {}
}

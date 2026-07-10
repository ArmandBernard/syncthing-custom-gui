import { useEffect, useRef, useState } from 'react'
import type { DeviceID } from '../lib/syncthing/types/common'
import type { Connection, SystemConnections } from '../lib/syncthing/types/system'

export interface TransferHistoryPoint {
  time: number
  inRate: number
  outRate: number
}

const HISTORY_LENGTH = 60

interface Sample {
  at: number
  inBytesTotal: number
  outBytesTotal: number
}

/**
 * Syncthing's API only reports cumulative transfer totals, not instantaneous
 * speed, so this derives a rolling in/out bytes-per-second history by diffing
 * successive `/system/connections` polls.
 */
export function useDeviceTransferHistory(
  connections: SystemConnections | undefined,
): Record<DeviceID, TransferHistoryPoint[]> {
  const lastSamples = useRef<Record<DeviceID, Sample>>({})
  const [history, setHistory] = useState<Record<DeviceID, TransferHistoryPoint[]>>({})

  useEffect(() => {
    if (!connections) {
      return
    }

    // `Connection.at` doesn't advance for idle connections, so the poll's
    // receipt time is used as the sample timestamp instead.
    const sampleTime = Date.now()
    const newPoints: Record<DeviceID, TransferHistoryPoint> = {}

    for (const [deviceID, connection] of Object.entries(connections.connections)) {
      const sample = captureRates(deviceID, connection, sampleTime)

      if (!sample) {
        continue
      }

      newPoints[deviceID] = { time: sampleTime, ...sample }
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
  }, [connections])

  function captureRates(deviceID: DeviceID, connection: Connection, sampleTime: number) {
    const previous = lastSamples.current[deviceID]
    lastSamples.current[deviceID] = {
      at: sampleTime,
      inBytesTotal: connection.inBytesTotal,
      outBytesTotal: connection.outBytesTotal,
    }

    // No baseline yet, or a stale/duplicate sample (e.g. `at` didn't advance).
    if (!previous || sampleTime <= previous.at) {
      return null
    }

    const deltaSeconds = (sampleTime - previous.at) / 1000
    // Byte counters can reset on reconnect; clamp negative deltas to 0.
    const inRate = Math.max(0, connection.inBytesTotal - previous.inBytesTotal) / deltaSeconds
    const outRate = Math.max(0, connection.outBytesTotal - previous.outBytesTotal) / deltaSeconds

    return {
      inRate,
      outRate,
    }
  }

  return history
}

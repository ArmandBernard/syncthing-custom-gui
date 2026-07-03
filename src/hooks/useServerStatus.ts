import { useEffect, useState } from 'react'
import { pingSyncthing, type ServerStatus } from '../lib/syncthingClient'

const POLL_INTERVAL_MS = 5000

export function useServerStatus(apiKey: string | null): ServerStatus {
  const [status, setStatus] = useState<ServerStatus>('checking')

  useEffect(() => {
    if (!apiKey) {
      setStatus('checking')
      return
    }

    let cancelled = false

    const poll = async () => {
      const result = await pingSyncthing(apiKey)
      if (!cancelled) setStatus(result)
    }

    poll()
    const intervalId = setInterval(poll, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      clearInterval(intervalId)
    }
  }, [apiKey])

  return status
}

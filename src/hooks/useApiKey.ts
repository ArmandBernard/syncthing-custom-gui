import { useCallback, useState } from 'react'
import { clearStoredApiKey, getStoredApiKey, setStoredApiKey } from '../lib/apiKey'

export function useApiKey() {
  const [apiKey, setApiKeyState] = useState(() => getStoredApiKey())

  const setApiKey = useCallback((key: string) => {
    setStoredApiKey(key)
    setApiKeyState(key)
  }, [])

  const clearApiKey = useCallback(() => {
    clearStoredApiKey()
    setApiKeyState(null)
  }, [])

  return { apiKey, setApiKey, clearApiKey }
}

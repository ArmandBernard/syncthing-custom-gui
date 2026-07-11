import { useCallback, useState, type ReactNode } from 'react'
import { clearStoredApiKey, getStoredApiKey, setStoredApiKey } from '@lib/apiKey'
import { ApiKeyContext } from './ApiKeyContext'

export function ApiKeyProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKeyState] = useState(() => getStoredApiKey())

  const setApiKey = useCallback((key: string) => {
    setStoredApiKey(key)
    setApiKeyState(key)
  }, [])

  const clearApiKey = useCallback(() => {
    clearStoredApiKey()
    setApiKeyState(null)
  }, [])

  return (
    <ApiKeyContext.Provider value={{ apiKey, setApiKey, clearApiKey }}>
      {children}
    </ApiKeyContext.Provider>
  )
}

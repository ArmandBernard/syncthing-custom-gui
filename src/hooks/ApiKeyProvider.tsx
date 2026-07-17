import { useCallback, useState, type ReactNode } from 'react'
import { clearStoredApiKey, getStoredApiKey, setStoredApiKey } from '@lib/apiKey'
import { ApiKeyContext } from './ApiKeyContext'
import { ApiKeyForm } from '../views/ApiKeyForm.tsx'

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

  if (!apiKey) {
    return (
      <main className="flex flex-1 flex-col min-h-screen">
        <ApiKeyForm onSubmit={setApiKey} />
      </main>
    )
  }

  return (
    <ApiKeyContext.Provider value={{ apiKey, setApiKey, clearApiKey }}>
      {children}
    </ApiKeyContext.Provider>
  )
}

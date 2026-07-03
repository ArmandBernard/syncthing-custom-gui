import { createContext } from 'react'

export interface ApiKeyContextValue {
  apiKey: string | null
  setApiKey: (key: string) => void
  clearApiKey: () => void
}

export const ApiKeyContext = createContext<ApiKeyContextValue | null>(null)

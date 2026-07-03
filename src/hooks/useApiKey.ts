import { useContext } from 'react'
import { ApiKeyContext, type ApiKeyContextValue } from './ApiKeyContext'

export function useApiKey(): ApiKeyContextValue {
  const context = useContext(ApiKeyContext)
  if (!context) throw new Error('useApiKey must be used within an ApiKeyProvider')
  return context
}

import { createContext } from 'react'

export interface SnackbarOptions {
  actionLabel?: string
  onAction?: () => void
  durationMs?: number
}

export interface SnackbarContextValue {
  show: (message: string, options?: SnackbarOptions) => void
}

export const SnackbarContext = createContext<SnackbarContextValue | null>(null)

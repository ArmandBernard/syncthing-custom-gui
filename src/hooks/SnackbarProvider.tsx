import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { SnackbarContext, type SnackbarOptions } from './SnackbarContext'

interface SnackbarEntry {
  id: number
  message: string
  actionLabel?: string
  onAction?: () => void
  durationMs: number
}

const DEFAULT_DURATION_MS = 4000
const EXIT_TRANSITION_MS = 200

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<SnackbarEntry[]>([])
  const [visible, setVisible] = useState(false)
  const nextId = useRef(0)

  const current = queue[0] ?? null

  const show = useCallback((message: string, options?: SnackbarOptions) => {
    const entry: SnackbarEntry = {
      id: nextId.current++,
      message,
      actionLabel: options?.actionLabel,
      onAction: options?.onAction,
      durationMs: options?.durationMs ?? DEFAULT_DURATION_MS,
    }
    setQueue((prev) => [...prev, entry])
  }, [])

  // Show the current entry and auto-dismiss it after its duration.
  useEffect(() => {
    if (!current) return
    setVisible(true)
    const timeout = setTimeout(() => setVisible(false), current.durationMs)
    return () => clearTimeout(timeout)
  }, [current])

  // Once the exit transition has finished, drop the entry so the next one can show.
  useEffect(() => {
    if (visible || !current) return
    const timeout = setTimeout(() => setQueue((prev) => prev.slice(1)), EXIT_TRANSITION_MS)
    return () => clearTimeout(timeout)
  }, [visible, current])

  const handleAction = useCallback(() => {
    current?.onAction?.()
    setVisible(false)
  }, [current])

  return (
    <SnackbarContext.Provider value={{ show }}>
      {children}
      {current &&
        createPortal(
          <div
            role="status"
            aria-live="polite"
            className={`fixed bottom-4 left-1/2 z-50 flex min-w-70 max-w-140 -translate-x-1/2 
              items-center gap-4 rounded-xs bg-surface-high px-4 py-3 text-on-surface shadow-lg 
              transition-all duration-200 ease-out ${visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}
          >
            <span className="flex-1 text-sm">{current.message}</span>
            {current.actionLabel && (
              <button
                type="button"
                onClick={handleAction}
                className="rounded-xs text-sm font-medium text-on-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-primary"
              >
                {current.actionLabel}
              </button>
            )}
          </div>,
          document.body,
        )}
    </SnackbarContext.Provider>
  )
}

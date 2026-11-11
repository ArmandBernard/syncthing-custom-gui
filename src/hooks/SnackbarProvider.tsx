import { type ComponentChildren, createPortal } from 'preact'
import { useCallback, useEffect, useRef, useState } from 'preact/hooks'
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

export function SnackbarProvider({ children }: { children: ComponentChildren }) {
  const [queue, setQueue] = useState<SnackbarEntry[]>([])
  // Id of the entry that has started its exit; it is removed once the exit transition finishes.
  const [dismissedId, setDismissedId] = useState<number | null>(null)
  const nextId = useRef(0)

  const current = queue[0] ?? null
  const visible = current !== null && current.id !== dismissedId

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

  // Auto-dismiss the current entry after its duration.
  useEffect(() => {
    if (!current) return
    const timeout = setTimeout(() => setDismissedId(current.id), current.durationMs)
    return () => clearTimeout(timeout)
  }, [current])

  // Once the exit transition has finished, drop the entry so the next one can show.
  useEffect(() => {
    if (!current || current.id !== dismissedId) return
    const timeout = setTimeout(() => setQueue((prev) => prev.slice(1)), EXIT_TRANSITION_MS)
    return () => clearTimeout(timeout)
  }, [current, dismissedId])

  const handleAction = useCallback(() => {
    if (!current) return
    current.onAction?.()
    setDismissedId(current.id)
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
              transition-all duration-200 ease-out starting:translate-y-2 starting:opacity-0
              ${visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}
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

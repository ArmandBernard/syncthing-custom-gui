import { useEffect, useId, useRef, type ReactNode } from 'react'

export interface DialogProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  actions?: ReactNode
}

export function Dialog({ open, onClose, title, children, actions }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialogElement = dialogRef.current
    if (!dialogElement) return

    if (open) {
      if (!dialogElement.open) dialogElement.showModal()
    } else if (dialogElement.open) {
      dialogElement.close()
    }

    dialogElement.addEventListener('close', onClose)
    return () => {
      dialogElement.removeEventListener('close', onClose)
    }
  }, [open, onClose])

  return (
    <dialog
      ref={dialogRef}
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          onClose()
        }
      }}
      className="hidden h-full w-full items-center justify-center bg-transparent open:flex backdrop:bg-scrim/30"
    >
      <div className="min-w-70 max-w-140 rounded-xl bg-surface-high p-6 shadow-lg">
        {title && (
          <h2 id={titleId} className="mb-4 text-xl font-medium text-on-surface">
            {title}
          </h2>
        )}
        {children}
        {actions && <div className="mt-6 flex justify-end gap-2">{actions}</div>}
      </div>
    </dialog>
  )
}

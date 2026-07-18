import { useEffect, useId, useRef, type ReactNode } from 'react'

export interface DialogProps {
  open: boolean
  onClose: () => void
  title: ReactNode
  children: ReactNode
  actions?: ReactNode
  centred?: boolean
  className?: string
}

export function Dialog({
  open,
  onClose,
  title,
  children,
  actions,
  className,
  centred = true,
}: DialogProps) {
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
      aria-labelledby={titleId}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          onClose()
        }
      }}
      // Chromium and Firefox sets max-width to calc(100% - 38px) on dialogs. These have to be overridden
      className={
        'hidden h-full w-full max-w-none max-h-none open:flex flex-col items-center bg-transparent  backdrop:bg-scrim/30' +
        (centred ? ' justify-center' : ' pt-12')
      }
    >
      <div
        className={`min-w-70 rounded-xl bg-surface-high text-on-surface m-6 p-6 shadow-lg ${className ?? ''}`}
      >
        <h2 id={titleId} className="mb-4 text-xl font-medium text-on-surface">
          {title}
        </h2>
        {children}
        {actions && <div className="mt-6 flex justify-end gap-2">{actions}</div>}
      </div>
    </dialog>
  )
}

import { type AuthStatus } from '@hooks/AuthContext'
import { useAuth } from '@hooks/useAuth'

const STATUS_CONFIG: Record<AuthStatus, { label: string; dotColor: string }> = {
  checking: { label: 'Checking...', dotColor: 'bg-on-surface-variant' },
  authed: { label: 'Online', dotColor: 'bg-connected' },
  unauthorized: { label: 'Unauthorized — please log in', dotColor: 'bg-error' },
  offline: { label: "Offline — can't reach Syncthing", dotColor: 'bg-error' },
}

export function StatusIndicator() {
  const { status } = useAuth()
  const { label, dotColor } = STATUS_CONFIG[status]

  return (
    <div className="flex items-center gap-2">
      <span className={`h-3 w-3 rounded-full ${dotColor}`} />
      <span className="text-sm font-medium text-on-surface">{label}</span>
    </div>
  )
}

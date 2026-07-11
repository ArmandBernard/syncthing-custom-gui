import { type ServerStatus, useServerStatus } from '@hooks/useServerStatus'

const STATUS_CONFIG: Record<ServerStatus, { label: string; dotColor: string }> = {
  checking: { label: 'Checking...', dotColor: 'bg-on-surface-variant' },
  online: { label: 'Online', dotColor: 'bg-connected' },
  unauthorized: { label: 'Unauthorized — check your API key', dotColor: 'bg-error' },
  offline: { label: "Offline — can't reach Syncthing", dotColor: 'bg-error' },
}

export function StatusIndicator() {
  const status = useServerStatus()
  const { label, dotColor } = STATUS_CONFIG[status]

  return (
    <div className="flex items-center gap-2">
      <span className={`h-3 w-3 rounded-full ${dotColor}`} />
      <span className="text-sm font-medium text-on-surface">{label}</span>
    </div>
  )
}

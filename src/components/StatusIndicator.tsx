import { type ServerStatus, useServerStatus } from '../hooks/useServerStatus'
import { Card } from './ui/Card'
import { Button } from './ui/Button'

type StatusIndicatorProps = {
  onChangeKey: () => void
}

const STATUS_CONFIG: Record<ServerStatus, { label: string; dotColor: string }> = {
  checking: { label: 'Checking...', dotColor: 'bg-on-surface-variant' },
  online: { label: 'Online', dotColor: 'bg-success' },
  unauthorized: { label: 'Unauthorized — check your API key', dotColor: 'bg-error' },
  offline: { label: "Offline — can't reach Syncthing", dotColor: 'bg-error' },
}

export function StatusIndicator({ onChangeKey }: StatusIndicatorProps) {
  const status = useServerStatus()
  const { label, dotColor } = STATUS_CONFIG[status]

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <Card variant="outlined" className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <span className={`h-3 w-3 rounded-full ${dotColor}`} />
          <span className="text-sm font-medium text-on-surface">{label}</span>
        </div>
        <Button type="button" variant="text" onClick={onChangeKey}>
          Change API key
        </Button>
      </Card>
    </div>
  )
}

import type { ServerStatus } from '../lib/syncthingClient'

type StatusIndicatorProps = {
  status: ServerStatus
  onChangeKey: () => void
}

const STATUS_CONFIG: Record<ServerStatus, { label: string; dotColor: string }> = {
  checking: { label: 'Checking...', dotColor: 'bg-gray-400' },
  online: { label: 'Online', dotColor: 'bg-green-500' },
  unauthorized: { label: 'Unauthorized — check your API key', dotColor: 'bg-red-500' },
  offline: { label: "Offline — can't reach Syncthing", dotColor: 'bg-red-500' },
}

export function StatusIndicator({ status, onChangeKey }: StatusIndicatorProps) {
  const { label, dotColor } = STATUS_CONFIG[status]

  return (
    <div className="mx-auto mt-24 flex w-full max-w-sm flex-col items-center gap-4 rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <span className={`h-3 w-3 rounded-full ${dotColor}`} />
        <span className="text-sm font-medium text-gray-900">{label}</span>
      </div>
      <button
        type="button"
        onClick={onChangeKey}
        className="text-sm text-blue-600 hover:underline"
      >
        Change API key
      </button>
    </div>
  )
}

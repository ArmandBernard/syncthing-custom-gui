import { type ServerStatus, useServerStatus } from '../hooks/useServerStatus'

type StatusIndicatorProps = {
  onChangeKey: () => void
}

const STATUS_CONFIG: Record<ServerStatus, { label: string; dotColor: string }> = {
  checking: { label: 'Checking...', dotColor: 'bg-gray-400' },
  online: { label: 'Online', dotColor: 'bg-green-500' },
  unauthorized: { label: 'Unauthorized — check your API key', dotColor: 'bg-red-500' },
  offline: { label: "Offline — can't reach Syncthing", dotColor: 'bg-red-500' },
}

export function StatusIndicator({ onChangeKey }: StatusIndicatorProps) {
  const status = useServerStatus()
  const { label, dotColor } = STATUS_CONFIG[status]

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <div className="rounded-lg border border-gray-200 p-6 shadow-sm gap-4 ">
        <div className="flex items-center gap-2">
          <span className={`h-3 w-3 rounded-full ${dotColor}`} />
          <span className="text-sm font-medium text-gray-900">{label}</span>
        </div>
        <button
          type="button"
          onClick={onChangeKey}
          className="text-sm text-blue-600 hover:underline hover:cursor-pointer"
        >
          Change API key
        </button>
      </div>
    </div>
  )
}

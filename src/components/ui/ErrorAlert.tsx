import { SyncthingApiError } from '@lib/syncthing/SyncthingApiError.ts'

export function ErrorAlert({ error }: { error: SyncthingApiError | string }) {
  if (error instanceof SyncthingApiError) {
    return (
      <div className="text-on-error-container bg-error-container rounded-sm p-2">
        <div className="text">{error.status} Error</div>
        <div className="text-sm">{error.message}</div>
      </div>
    )
  }

  return (
    <div className="text-on-error-container bg-error-container rounded-sm p-2">Error: {error}</div>
  )
}

import { useSyncthingQuery } from './hooks/useSyncthingQuery.ts'
import { CircularProgress } from './components/ui/Progress.tsx'
import { Folder } from './Folder.tsx'

export function Folders() {
  const { data: config, isLoading: configLoading } = useSyncthingQuery('GET /config')

  if (configLoading || !config) {
    return <CircularProgress aria-label="Loading" />
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl">Folders</h2>
      <ul className="flex flex-col gap-2">
        {config.folders.map((folder) => (
          <li key={folder.id}>
            <Folder folder={folder} devices={config.devices} />
          </li>
        ))}
      </ul>
    </div>
  )
}

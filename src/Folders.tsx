import { useSyncthingQuery } from './hooks/useSyncthingQuery.ts'
import { Folder } from './Folder.tsx'
import { CircularProgressCentred } from './components/CircularProgressCentred.tsx'

export function Folders() {
  const { data: config, isLoading: configLoading } = useSyncthingQuery('GET /config')

  if (configLoading || !config) {
    return <CircularProgressCentred name="folders" />
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

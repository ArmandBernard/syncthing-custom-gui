import { useSyncthingQuery } from './hooks/useSyncthingQuery.ts'
import { Folder } from './components/Folder.tsx'
import { CircularProgressCentred } from './components/CircularProgressCentred.tsx'

export function Folders() {
  const { data: config, isLoading: configLoading } = useSyncthingQuery('GET /config')

  if (configLoading || !config) {
    return <CircularProgressCentred name="folders" />
  }

  const grouped = Object.groupBy(config.folders, (folder) => folder.group)

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl">Folders</h2>
      {Object.entries(grouped).map(([group, value]) => (
        <>
          {group && <h3 className="text-xl">{group}</h3>}
          <ul className="flex flex-col gap-2">
            {value!.map((folder) => (
              <li key={folder.id}>
                <Folder folder={folder} devices={config.devices} />
              </li>
            ))}
          </ul>
        </>
      ))}
    </div>
  )
}

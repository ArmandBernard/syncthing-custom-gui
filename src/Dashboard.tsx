import { ThisDevice } from './ThisDevice.tsx'
import { RemoteDevices } from './components/RemoteDevices.tsx'
import { Folders } from './Folders.tsx'

export function Dashboard() {
  return (
    <div className="self-center pt-4 flex flex-col gap-4">
      <h1 className="text-2xl">Dashboard</h1>
      <div className="flex flex-col lg:flex-row gap-x-8 gap-y-4">
        <div className="w-md">
          <Folders />
        </div>
        <div className="w-md flex flex-col gap-4">
          <ThisDevice />
          <RemoteDevices />
        </div>
      </div>
    </div>
  )
}

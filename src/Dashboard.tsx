import { ThisDevice } from './ThisDevice.tsx'
import { RemoteDevices } from './components/RemoteDevices.tsx'

export function Dashboard() {
  return (
    <div className="w-lg self-center pt-4 flex flex-col gap-4">
      <h1 className="text-2xl">Dashboard</h1>
      <ThisDevice />
      <RemoteDevices />
    </div>
  )
}

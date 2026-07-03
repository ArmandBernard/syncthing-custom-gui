import { DeviceInfo } from './DeviceInfo.tsx'
import { ConnectedDevices } from './components/ConnectedDevices.tsx'

export function Dashboard() {
  return (
    <div className="w-xl self-center pt-4 flex flex-col gap-4">
      <h1 className="text-2xl">Dashboard</h1>
      <DeviceInfo />
      <ConnectedDevices />
    </div>
  )
}

import { Dialog } from '@components/ui/Dialog.tsx'
import type { DeviceConfiguration } from '@lib/syncthing/types/config'
import DeviceQRCode from '@components/ui/DeviceQRCode.tsx'

export default function ShareDeviceDialog({
  isOpen,
  onClose,
  device,
}: {
  isOpen: boolean
  onClose: () => void
  device: DeviceConfiguration
}) {
  return (
    <Dialog open={isOpen} onClose={onClose} title={`Device Identification - ${device.name}`}>
      <div className="flex flex-col items-center">
        <DeviceQRCode deviceId={device.deviceID} enabled={isOpen} className="h-96 w-96" />
      </div>
    </Dialog>
  )
}

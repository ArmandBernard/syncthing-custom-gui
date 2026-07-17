import { Dialog } from '@components/ui/Dialog.tsx'
import type { DeviceConfiguration } from '@lib/syncthing/types/config'
import DeviceQRCode from '@components/ui/DeviceQRCode.tsx'
import { DeviceIDText } from '@components/DeviceIDText.tsx'

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
    <Dialog
      open={isOpen}
      onClose={onClose}
      title={`Device identification - ${device.name}`}
      className="w-full max-w-xl"
    >
      <div className="flex flex-col gap-4">
        <DeviceIDText deviceID={device.deviceID} />
        <div className="flex flex-col items-center">
          <DeviceQRCode
            deviceId={device.deviceID}
            enabled={isOpen}
            className="aspect-square w-full"
          />
        </div>
      </div>
    </Dialog>
  )
}

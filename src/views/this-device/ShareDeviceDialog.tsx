import { Dialog } from '@components/ui/Dialog.tsx'
import type { DeviceConfiguration } from '@lib/syncthing/types/config'
import DeviceQRCode from '@components/ui/DeviceQRCode.tsx'
import { IconButton } from '@components/ui/IconButton.tsx'
import { CopyIcon } from '@components/icons/CopyIcon.tsx'
import copyToClipboard from '@lib/copyToClipboard.ts'
import { useSnackbar } from '@hooks/useSnackbar.ts'

export default function ShareDeviceDialog({
  isOpen,
  onClose,
  device,
}: {
  isOpen: boolean
  onClose: () => void
  device: DeviceConfiguration
}) {
  const snackbar = useSnackbar()
  async function onCopyClick() {
    await copyToClipboard(device.deviceID)
    snackbar.show('Device id copied to clipboard')
  }

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title={`Device identification - ${device.name}`}
      className="w-full max-w-xl"
    >
      <div className="flex flex-col gap-4">
        <div className="flex gap-2 items-center">
          <div className="text flex-1 truncate">ID: {device.deviceID}</div>
          <IconButton aria-label="Copy ID" onClick={onCopyClick}>
            <CopyIcon />
          </IconButton>
        </div>
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

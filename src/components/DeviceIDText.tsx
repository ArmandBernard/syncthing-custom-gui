import type { DeviceID } from '@lib/syncthing/types/common.ts'
import { IconButton } from '@components/ui/IconButton.tsx'
import { CopyIcon } from '@components/icons/CopyIcon.tsx'
import copyToClipboard from '@lib/copyToClipboard.ts'
import { useSnackbar } from '@hooks/useSnackbar.ts'
import { TextField } from '@components/ui/TextField.tsx'

export function DeviceIDText({ deviceID }: { deviceID: DeviceID }) {
  const snackbar = useSnackbar()

  async function onCopyClick() {
    await copyToClipboard(deviceID)
    snackbar.show('Device id copied to clipboard')
  }

  return (
    <TextField
      label="Device ID"
      variant="filled"
      disabled
      value={deviceID}
      endAdornment={
        <IconButton aria-label="Copy ID" onClick={onCopyClick}>
          <CopyIcon />
        </IconButton>
      }
    />
  )
}

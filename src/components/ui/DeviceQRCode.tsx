import { useQuery } from '@tanstack/react-query'
import type { DeviceID } from '@lib/syncthing/types/common.ts'
import { fetchQrCode } from '@lib/syncthing/fetchQrCode.ts'

export default function DeviceQRCode({
  deviceId,
  enabled,
  className,
}: {
  deviceId: DeviceID
  enabled: boolean
  className?: string
}) {
  const { data: qrBlob } = useQuery({
    queryKey: ['syncthing-qr', deviceId],
    queryFn: () => fetchQrCode(deviceId),
    enabled: enabled,
  })

  return (
    <img
      className={className}
      src={qrBlob ? URL.createObjectURL(qrBlob) : undefined}
      alt="QR code"
    />
  )
}

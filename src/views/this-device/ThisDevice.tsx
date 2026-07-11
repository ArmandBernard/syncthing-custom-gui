import { useSyncthingQuery } from '@hooks/useSyncthingQuery.ts'
import { TimeSpan } from '@components/TimeSpan.tsx'
import { CardAccordion } from '@components/ui/CardAccordion.tsx'
import { useState } from 'react'
import { Identicon } from '@components/ui/Identicon.tsx'
import { CircularProgressCentred } from '@components/CircularProgressCentred.tsx'
import { formatBytes } from '@lib/formatBytes.ts'
import { formatTransferRate } from '@lib/formatTransferRate.ts'
import { useDeviceTransferHistory } from '@context/transfer-history/useDeviceTransferHistory.ts'
import { useConnections } from '@context/connections/useConnections.ts'

import { useDeviceID } from '@context/device-id/useDeviceID.ts'
import { SpeedInline } from '@components/SpeedInline.tsx'
import { Button } from '@components/ui/Button.tsx'
import ShareDeviceDialog from './ShareDeviceDialog.tsx'
import ListItem from '@components/ui/ListItem.tsx'

export function ThisDevice() {
  const [expanded, setExpanded] = useState(false)
  const [sharingDevice, setSharingDevice] = useState<boolean>(false)
  const connections = useConnections()
  const myId = useDeviceID()
  const transferHistory = useDeviceTransferHistory(myId)
  const { data: status, isLoading: statusIsLoading } = useSyncthingQuery('GET /system/status', {
    refetchInterval: 10000,
  })
  const { data: config, isLoading: configIsLoading } = useSyncthingQuery('GET /config')

  if (statusIsLoading || !status || configIsLoading || !config || !connections) {
    return <CircularProgressCentred name="device information" />
  }

  function handleShareClick() {
    setSharingDevice(true)
  }

  function handleCancelShare() {
    setSharingDevice(false)
  }

  const myDeviceConfigInfo = config.devices.find((d) => d.deviceID === myId)!
  const latestRates = transferHistory?.slice(-1).at(0)

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl">This device</h2>
      <CardAccordion
        expanded={expanded}
        setExpanded={setExpanded}
        buttonBody={
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Identicon id={myDeviceConfigInfo.deviceID} />
              <div className="text-xl">{myDeviceConfigInfo.name}</div>
            </div>
            <div className="flex items-baseline gap-2">
              <SpeedInline rates={latestRates} />
            </div>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <ul>
            <ListItem leftSlot="Uptime" rightSlot={<TimeSpan seconds={status.uptime} />} />
            <ListItem
              leftSlot="Upload"
              rightSlot={
                <>
                  {latestRates && <>{formatTransferRate(latestRates?.outRate)} </>}(
                  {formatBytes(connections.total.outBytesTotal)} total)
                </>
              }
            />
            <ListItem
              leftSlot="Download"
              rightSlot={
                <>
                  {latestRates && <>{formatTransferRate(latestRates?.inRate)} </>}(
                  {formatBytes(connections.total.inBytesTotal)} total)
                </>
              }
            />
          </ul>
          <div className="flex gap-4 justify-end">
            <Button variant="outlined" onClick={handleShareClick}>
              Share
            </Button>
            <ShareDeviceDialog
              isOpen={sharingDevice}
              onClose={handleCancelShare}
              device={myDeviceConfigInfo}
            />
          </div>
        </div>
      </CardAccordion>
    </div>
  )
}

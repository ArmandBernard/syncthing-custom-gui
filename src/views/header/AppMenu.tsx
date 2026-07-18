import { Menu } from '@components/ui/menu/Menu.tsx'
import { SegmentedButtons } from '@components/ui/SegmentedButtons.tsx'
import { useTheme } from '@hooks/useTheme.ts'
import type { Theme } from '@lib/theme.ts'
import { useAuth } from '@hooks/useAuth.ts'
import { IconButton } from '@components/ui/IconButton.tsx'
import { SettingsIcon } from '@components/icons/SettingsIcon.tsx'
import { useSyncthingQuery } from '@hooks/useSyncthingQuery.ts'
import ShareDeviceDialog from '../this-device/ShareDeviceDialog.tsx'
import { useState } from 'react'

const THEME_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'system', label: 'System' },
  { value: 'dark', label: 'Dark' },
]

/**
 * The app's general dropdown menu. Currently just holds the theme toggle,
 * but is meant to grow more items above/below it over time.
 */
export function AppMenu() {
  const [showShare, setShowShare] = useState(false)
  const { theme, setTheme } = useTheme()
  const { logout } = useAuth()

  const { data: status } = useSyncthingQuery('GET /system/status')
  const { data: device } = useSyncthingQuery('GET /config/devices/:id', {
    enabled: !!status,
    // @ts-ignore
    params: { id: status?.myID },
  })

  function handleCloseShare() {
    setShowShare(false)
  }

  function handleItemClick() {
    setShowShare(true)
  }

  return (
    <>
      <Menu
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        button={
          <IconButton aria-label="Settings">
            <SettingsIcon />
          </IconButton>
        }
      >
        <Menu.Toggle>
          <SegmentedButtons
            aria-label="Theme"
            options={THEME_OPTIONS}
            value={theme}
            onChange={(value) => setTheme(value as Theme)}
            asMenuItems
          />
        </Menu.Toggle>
        {status && device && <Menu.Item onClick={handleItemClick}>Share device ID</Menu.Item>}
        <Menu.Item
          href="https://github.com/ArmandBernard/syncthing-custom-gui"
          target="_blank"
          rel="noopener"
          onClick={() => {}}
        >
          View code on GitHub
        </Menu.Item>
        <Menu.Item onClick={logout.mutateAsync}>Log out</Menu.Item>
      </Menu>
      {device && (
        <ShareDeviceDialog isOpen={showShare} onClose={handleCloseShare} device={device} />
      )}
    </>
  )
}

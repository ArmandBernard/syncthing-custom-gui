import { Menu } from './ui/Menu'
import { SegmentedButtons } from './ui/SegmentedButtons'
import { useTheme } from '../hooks/useTheme'
import type { Theme } from '../lib/theme'
import { useApiKey } from '../hooks/useApiKey.ts'

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
  const { theme, setTheme } = useTheme()
  const { apiKey, clearApiKey } = useApiKey()

  return (
    // AppMenu is pinned to the top-right of the screen (see App.tsx), so the
    // popup should hang below the trigger's right edge, right-aligned to it
    // — set explicitly rather than left to usePopoverPosition's runtime
    // auto-fit, since this component already knows where it lives on screen.
    <Menu
      label="Actions"
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Menu.Toggle>
        <SegmentedButtons
          aria-label="Theme"
          options={THEME_OPTIONS}
          value={theme}
          onChange={(value) => setTheme(value as Theme)}
        />
      </Menu.Toggle>
      {apiKey && <Menu.Item onSelect={clearApiKey}>Log out</Menu.Item>}
    </Menu>
  )
}

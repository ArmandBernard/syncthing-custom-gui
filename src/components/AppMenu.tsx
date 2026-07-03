import { Menu } from './ui/Menu'
import { SegmentedButtons } from './ui/SegmentedButtons'
import { useTheme } from '../hooks/useTheme'
import type { Theme } from '../lib/theme'

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

  return (
    <Menu label="Menu">
      <Menu.Toggle>
        <SegmentedButtons
          aria-label="Theme"
          options={THEME_OPTIONS}
          value={theme}
          onChange={(value) => setTheme(value as Theme)}
        />
      </Menu.Toggle>
    </Menu>
  )
}

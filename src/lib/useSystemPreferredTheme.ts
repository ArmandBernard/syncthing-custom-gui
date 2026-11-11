import { useSyncExternalStore } from 'preact/compat'

type ThemePreference = 'dark' | 'light' | null

const darkQuery = '(prefers-color-scheme: dark)'
const lightQuery = '(prefers-color-scheme: light)'

function subscribe(callback: () => void) {
  const query = window.matchMedia(darkQuery)
  query.addEventListener('change', callback)
  return () => query.removeEventListener('change', callback)
}

// returns a primitive string/null, so snapshots compare equal and avoid re-render loops
function getSnapshot(): ThemePreference {
  if (window.matchMedia(darkQuery).matches) return 'dark'
  if (window.matchMedia(lightQuery).matches) return 'light'
  return null
}

/** The OS (or devtools-emulated) colour scheme, kept live as it changes. `null` means no preference. */
export function useSystemPreferredTheme(): ThemePreference {
  return useSyncExternalStore(subscribe, getSnapshot)
}

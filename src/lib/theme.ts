export type Theme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'syncthing-theme'

export function getStoredTheme(): Theme {
  const value = localStorage.getItem(STORAGE_KEY)
  return value === 'light' || value === 'dark' ? value : 'system'
}

export function setStoredTheme(theme: Theme): void {
  localStorage.setItem(STORAGE_KEY, theme)
}

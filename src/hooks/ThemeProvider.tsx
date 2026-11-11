import type { ComponentChildren } from 'preact'
import { useCallback, useLayoutEffect, useState } from 'preact/hooks'
import { useSystemPreferredTheme } from '@lib/useSystemPreferredTheme'
import { getStoredTheme, setStoredTheme, type Theme } from '@lib/theme'
import { ThemeContext } from './ThemeContext'

export function ThemeProvider({ children }: { children: ComponentChildren }) {
  const [theme, setThemeState] = useState<Theme>(() => getStoredTheme())

  const systemTheme = useSystemPreferredTheme()
  const effectiveTheme = theme === 'system' ? (systemTheme ?? 'light') : theme

  // Use a layoutEffect to block rendering until the theme is known
  useLayoutEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(effectiveTheme)
  }, [effectiveTheme])

  const setTheme = useCallback((next: Theme) => {
    setStoredTheme(next)
    setThemeState(next)
  }, [])

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

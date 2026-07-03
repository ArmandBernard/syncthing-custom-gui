import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { getStoredTheme, setStoredTheme, type Theme } from '../lib/theme'
import { ThemeContext } from './ThemeContext'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => getStoredTheme())

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    if (theme !== 'system') root.classList.add(theme)
  }, [theme])

  const setTheme = useCallback((next: Theme) => {
    setStoredTheme(next)
    setThemeState(next)
  }, [])

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

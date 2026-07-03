import { useEffect, useState } from 'react'
import { ApiKeyForm } from './components/ApiKeyForm'
import { StatusIndicator } from './components/StatusIndicator'
import { IconButton } from './components/ui/IconButton'
import { useApiKey } from './hooks/useApiKey'
import { useTheme } from './hooks/useTheme'

function useResolvedIsDark(theme: 'light' | 'dark' | 'system'): boolean {
  const [systemPrefersDark, setSystemPrefersDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  )

  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const listener = (event: MediaQueryListEvent) => setSystemPrefersDark(event.matches)
    query.addEventListener('change', listener)
    return () => query.removeEventListener('change', listener)
  }, [])

  return theme === 'dark' || (theme === 'system' && systemPrefersDark)
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <circle cx="12" cy="12" r="4" />
      <path
        strokeLinecap="round"
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
      />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 1020.354 15.354z" />
    </svg>
  )
}

function App() {
  const { apiKey, setApiKey, clearApiKey } = useApiKey()
  const { theme, setTheme } = useTheme()
  const isDark = useResolvedIsDark(theme)

  return (
    <div className="flex min-h-screen flex-col bg-surface px-4">
      <div className="flex justify-end pt-4">
        <IconButton
          aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </IconButton>
      </div>
      {apiKey ? <StatusIndicator onChangeKey={clearApiKey} /> : <ApiKeyForm onSubmit={setApiKey} />}
    </div>
  )
}

export default App

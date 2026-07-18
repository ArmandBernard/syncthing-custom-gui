import { useState } from 'react'
import type { TargetedEvent } from 'preact'
import { Card } from '@components/ui/Card.tsx'
import { TextField } from '@components/ui/TextField.tsx'
import { Checkbox } from '@components/ui/Checkbox.tsx'
import { Button } from '@components/ui/Button.tsx'

import { SyncthingApiError } from '@lib/syncthing/SyncthingApiError.ts'

type LoginFormProps = {
  onLogin: (username: string, password: string, stayLoggedIn: boolean) => Promise<void>
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [stayLoggedIn, setStayLoggedIn] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: TargetedEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await onLogin(username, password, stayLoggedIn)
    } catch (cause) {
      setError(
        cause instanceof SyncthingApiError ? cause.message : 'Unable to reach Syncthing right now.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <Card variant="elevated" className="max-w-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <h1 className="text-lg font-semibold text-on-surface">Log in to Syncthing</h1>
            <p className="mt-1 text-sm text-on-surface-variant">
              Enter the GUI username and password configured on this Syncthing instance.
            </p>
          </div>
          <TextField
            label="Username"
            value={username}
            onChange={(event) => setUsername(event.currentTarget.value)}
            autoFocus
            autoComplete="username"
          />
          <TextField
            type="password"
            label="Password"
            value={password}
            onChange={(event) => setPassword(event.currentTarget.value)}
            autoComplete="current-password"
          />
          <Checkbox
            label="Stay logged in"
            checked={stayLoggedIn}
            onChange={(event) => setStayLoggedIn(event.currentTarget.checked)}
          />
          {error && <p className="text-sm text-error">{error}</p>}
          <Button
            type="submit"
            variant="filled"
            disabled={!username.trim() || !password || submitting}
          >
            Log in
          </Button>
        </form>
      </Card>
    </div>
  )
}

import { useState } from 'react'
import { Card } from '@components/ui/Card.tsx'
import { TextField } from '@components/ui/TextField.tsx'
import { Checkbox } from '@components/ui/Checkbox.tsx'
import { Button } from '@components/ui/Button.tsx'
import { useAuth } from '@hooks/useAuth.ts'
import { ErrorAlert } from '@components/ui/ErrorAlert.tsx'

export default function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [stayLoggedIn, setStayLoggedIn] = useState(true)

  const { login } = useAuth()

  async function handleSubmit() {
    await login.mutateAsync({ body: { password, stayLoggedIn, username } })
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
          {login.error && <ErrorAlert error={login.error} />}
          <Button
            type="submit"
            variant="filled"
            disabled={!username.trim() || !password || login.isPending}
          >
            Log in
          </Button>
        </form>
      </Card>
    </div>
  )
}

import { useState, type JSX } from 'react'
import { Card } from './ui/Card'
import { TextField } from './ui/TextField'
import { Button } from './ui/Button'

type ApiKeyFormProps = {
  onSubmit: (apiKey: string) => void
}

export function ApiKeyForm({ onSubmit }: ApiKeyFormProps) {
  const [value, setValue] = useState('')

  const handleSubmit = (event: JSX.TargetedEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = value.trim()
    if (trimmed) onSubmit(trimmed)
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <Card variant="elevated" className="max-w-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <h1 className="text-lg font-semibold text-on-surface">Connect to Syncthing</h1>
            <p className="mt-1 text-sm text-on-surface-variant">
              Find your API key under Syncthing's Settings &rarr; General, then paste it below.
            </p>
          </div>
          <TextField
            type="password"
            label="API key"
            value={value}
            onChange={(event) => setValue(event.currentTarget.value)}
            autoFocus
          />
          <Button type="submit" variant="filled" disabled={!value.trim()}>
            Save
          </Button>
        </form>
      </Card>
    </div>
  )
}

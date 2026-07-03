import { useState } from 'react'

type ApiKeyFormProps = {
  onSubmit: (apiKey: string) => void
}

export function ApiKeyForm({ onSubmit }: ApiKeyFormProps) {
  const [value, setValue] = useState('')

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = value.trim()
    if (trimmed) onSubmit(trimmed)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-24 flex w-full max-w-sm flex-col gap-4 rounded-lg border border-gray-200 p-6 shadow-sm"
    >
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Connect to Syncthing</h1>
        <p className="mt-1 text-sm text-gray-500">
          Find your API key under Syncthing's Settings &rarr; General, then paste it below.
        </p>
      </div>
      <input
        type="password"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="API key"
        autoFocus
        className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      />
      <button
        type="submit"
        disabled={!value.trim()}
        className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Save
      </button>
    </form>
  )
}

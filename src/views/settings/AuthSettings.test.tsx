import { cleanup, fireEvent, render, screen } from '@testing-library/preact'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AuthSettings } from './AuthSettings.tsx'
import { SyncthingApiError } from '@lib/syncthing/SyncthingApiError.ts'
import type { GUIConfiguration } from '@lib/syncthing/types/config'

afterEach(cleanup)

function renderAuthSettings(props: Partial<Parameters<typeof AuthSettings>[0]> = {}) {
  const setUser = vi.fn()
  const setPassword = vi.fn()
  render(
    <AuthSettings
      guiConfig={undefined}
      error={null}
      user=""
      setUser={setUser}
      password=""
      setPassword={setPassword}
      {...props}
    />,
  )
  return { setUser, setPassword }
}

describe('AuthSettings', () => {
  it('shows the username and password fields', () => {
    renderAuthSettings()

    expect(screen.getByLabelText('Username')).toBeTruthy()
    expect(screen.getByLabelText('Password')).toBeTruthy()
    expect(screen.getByText('Leave blank to keep the current password.')).toBeTruthy()
  })

  it('masks the password field', () => {
    renderAuthSettings()

    expect(screen.getByLabelText('Password').getAttribute('type')).toBe('password')
  })

  it('shows the values it is given', () => {
    renderAuthSettings({ user: 'alice', password: 'secret' })

    expect((screen.getByLabelText('Username') as HTMLInputElement).value).toBe('alice')
    expect((screen.getByLabelText('Password') as HTMLInputElement).value).toBe('secret')
  })

  it('falls back to the username from the GUI config when none has been entered', () => {
    renderAuthSettings({ user: '', guiConfig: { user: 'admin' } as GUIConfiguration })

    expect((screen.getByLabelText('Username') as HTMLInputElement).value).toBe('admin')
  })

  it('prefers the entered username over the one from the GUI config', () => {
    renderAuthSettings({ user: 'alice', guiConfig: { user: 'admin' } as GUIConfiguration })

    expect((screen.getByLabelText('Username') as HTMLInputElement).value).toBe('alice')
  })

  it('leaves the username empty when there is no GUI config yet', () => {
    renderAuthSettings({ user: '', guiConfig: undefined })

    expect((screen.getByLabelText('Username') as HTMLInputElement).value).toBe('')
  })

  it('reports username changes', () => {
    const { setUser, setPassword } = renderAuthSettings()

    fireEvent.input(screen.getByLabelText('Username'), { target: { value: 'bob' } })

    expect(setUser).toHaveBeenCalledWith('bob')
    expect(setPassword).not.toHaveBeenCalled()
  })

  it('reports password changes', () => {
    const { setUser, setPassword } = renderAuthSettings()

    fireEvent.input(screen.getByLabelText('Password'), { target: { value: 'hunter2' } })

    expect(setPassword).toHaveBeenCalledWith('hunter2')
    expect(setUser).not.toHaveBeenCalled()
  })

  it('shows an error returned from the API', () => {
    renderAuthSettings({ error: new SyncthingApiError(403, 'Forbidden') })

    expect(screen.getByText('403 Error')).toBeTruthy()
    expect(screen.getByText('Forbidden')).toBeTruthy()
  })

  it('shows no error when there is none', () => {
    renderAuthSettings()

    expect(screen.queryByText(/Error/)).toBeNull()
  })
})

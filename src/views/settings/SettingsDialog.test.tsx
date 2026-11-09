import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/preact'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SettingsDialog from './SettingsDialog.tsx'
import { SyncthingApiError } from '@lib/syncthing/SyncthingApiError.ts'

const mutateAsync = vi.fn()
const logoutMutateAsync = vi.fn()
const mutationState: { isPending: boolean; error: SyncthingApiError | null } = {
  isPending: false,
  error: null,
}

vi.mock('@hooks/useSyncthingMutation.ts', () => ({
  useSyncthingMutation: () => ({ mutateAsync, ...mutationState }),
}))

vi.mock('@hooks/useSyncthingQuery.ts', () => ({
  useSyncthingQuery: () => ({ data: { user: 'admin' } }),
}))

vi.mock('@hooks/useAuth.ts', () => ({
  useAuth: () => ({ logout: { mutateAsync: logoutMutateAsync } }),
}))

beforeEach(() => {
  mutateAsync.mockResolvedValue(undefined)
  logoutMutateAsync.mockResolvedValue(undefined)
  mutationState.isPending = false
  mutationState.error = null
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

function renderDialog(onClose = vi.fn()) {
  render(<SettingsDialog isOpen onClose={onClose} />)
  return { onClose }
}

function type(label: string, value: string) {
  fireEvent.input(screen.getByLabelText(label), { target: { value } })
}

describe('SettingsDialog', () => {
  it('shows the title and the authentication tab by default', () => {
    renderDialog()

    expect(screen.getByRole('heading', { name: 'Settings' })).toBeTruthy()
    expect(screen.getByRole('tab', { name: 'Authentication' }).getAttribute('aria-selected')).toBe(
      'true',
    )
    expect(screen.getByLabelText('Username')).toBeTruthy()
    expect(screen.getByLabelText('Password')).toBeTruthy()
  })

  it('switches tabs', () => {
    renderDialog()

    fireEvent.click(screen.getByRole('tab', { name: 'Ignored folders' }))

    expect(screen.getByRole('tab', { name: 'Ignored folders' }).getAttribute('aria-selected')).toBe(
      'true',
    )
    expect(screen.queryByLabelText('Username')).toBeNull()
  })

  it('calls onClose when Close is clicked', () => {
    const { onClose } = renderDialog()

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('saves with an empty body and does not log out when nothing was entered', async () => {
    const { onClose } = renderDialog()

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(onClose).toHaveBeenCalled())
    expect(mutateAsync).toHaveBeenCalledWith({ body: {} })
    expect(logoutMutateAsync).not.toHaveBeenCalled()
  })

  it('saves the entered credentials, logs out and closes', async () => {
    const { onClose } = renderDialog()

    type('Username', 'alice')
    type('Password', 'secret')
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(onClose).toHaveBeenCalled())
    expect(mutateAsync).toHaveBeenCalledWith({ body: { user: 'alice', password: 'secret' } })
    expect(logoutMutateAsync).toHaveBeenCalledTimes(1)
  })

  it('only sends the fields that were filled in', async () => {
    const { onClose } = renderDialog()

    type('Password', 'secret')
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(onClose).toHaveBeenCalled())
    expect(mutateAsync).toHaveBeenCalledWith({ body: { password: 'secret' } })
  })

  it('disables the buttons while saving', () => {
    mutationState.isPending = true
    renderDialog()

    expect(screen.getByRole('button', { name: 'Close' }).getAttribute('aria-disabled')).toBe('true')
    expect(screen.getByRole('button', { name: 'Save' }).getAttribute('aria-disabled')).toBe('true')
  })

  it('shows an error returned from the API', () => {
    mutationState.error = new SyncthingApiError(403, 'Forbidden')
    renderDialog()

    expect(screen.getByText('403 Error')).toBeTruthy()
    expect(screen.getByText('Forbidden')).toBeTruthy()
  })
})

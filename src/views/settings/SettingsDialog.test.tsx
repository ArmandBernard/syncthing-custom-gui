import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/preact'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SettingsDialog from './SettingsDialog.tsx'

const mutateAsync = vi.fn()
const logoutMutateAsync = vi.fn()
const mutationState = { isPending: false }

vi.mock('@hooks/useSyncthingMutation.ts', () => ({
  useSyncthingMutation: () => ({ mutateAsync, error: null, ...mutationState }),
}))

vi.mock('@hooks/useSyncthingQuery.ts', () => ({
  useSyncthingQuery: () => ({ data: { user: 'admin' } }),
}))

vi.mock('@hooks/useAuth.ts', () => ({
  useAuth: () => ({ logout: { mutateAsync: logoutMutateAsync } }),
}))

// The ignored folders tab has its own tests, and fetches data this file doesn't mock.
vi.mock('./IgnoredFolders.tsx', () => ({
  IgnoredFolders: () => <div>ignored folders content</div>,
}))

beforeEach(() => {
  mutateAsync.mockResolvedValue(undefined)
  logoutMutateAsync.mockResolvedValue(undefined)
  mutationState.isPending = false
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
    expect(screen.queryByText('ignored folders content')).toBeNull()
  })

  it('shows the current username from the GUI config', () => {
    renderDialog()

    expect((screen.getByLabelText('Username') as HTMLInputElement).value).toBe('admin')
  })

  it('does not resend the current username when only the password changes', async () => {
    const { onClose } = renderDialog()

    type('Password', 'secret')
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(onClose).toHaveBeenCalled())
    expect(mutateAsync).toHaveBeenCalledWith({ body: { password: 'secret' } })
  })

  it('switches to the ignored folders tab', () => {
    renderDialog()

    fireEvent.click(screen.getByRole('tab', { name: 'Ignored folders' }))

    expect(screen.getByRole('tab', { name: 'Ignored folders' }).getAttribute('aria-selected')).toBe(
      'true',
    )
    expect(screen.getByText('ignored folders content')).toBeTruthy()
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
})

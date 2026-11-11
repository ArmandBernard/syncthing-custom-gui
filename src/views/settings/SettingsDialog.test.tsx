import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/preact'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SettingsDialog from './SettingsDialog.tsx'
import type { IgnoredFolderRef } from './IgnoredFolders.tsx'
import type { DeviceConfiguration } from '@lib/syncthing/types/config'

const ignored = (id: string) => ({ id, label: `${id} label`, time: '2026-01-01T00:00:00Z' })
const devices = [
  { deviceID: 'DEV-A', ignoredFolders: [ignored('docs'), ignored('photos'), ignored('music')] },
  { deviceID: 'DEV-B', ignoredFolders: [ignored('docs')] },
] as unknown as DeviceConfiguration[]

const mutateAsync = vi.fn()
const patchDevices = vi.fn()
const logoutMutateAsync = vi.fn()
const mutationState = { isPending: false }

vi.mock('@hooks/useSyncthingMutation.ts', () => ({
  useSyncthingMutation: () => ({ mutateAsync, error: null, ...mutationState }),
}))

vi.mock('@hooks/useSyncthingBatchMutation.ts', () => ({
  useSyncthingBatchMutation: () => ({ mutateAsync: patchDevices, error: null, isPending: false }),
}))

vi.mock('@hooks/useSyncthingQuery.ts', () => ({
  useSyncthingQuery: (key: string) => ({
    data: key === 'GET /config/devices' ? devices : { user: 'admin' },
  }),
}))

vi.mock('@hooks/useAuth.ts', () => ({
  useAuth: () => ({ logout: { mutateAsync: logoutMutateAsync } }),
}))

// The ignored folders tab has its own tests, so it's replaced by buttons that queue removals.
vi.mock('./IgnoredFolders.tsx', () => ({
  IgnoredFolders: ({ onRemove }: { onRemove: (ignoredFolder: IgnoredFolderRef) => void }) => (
    <div>
      ignored folders content
      <button onClick={() => onRemove({ deviceId: 'DEV-A', folderId: 'docs' })}>
        queue A docs
      </button>
      <button onClick={() => onRemove({ deviceId: 'DEV-A', folderId: 'photos' })}>
        queue A photos
      </button>
      <button onClick={() => onRemove({ deviceId: 'DEV-B', folderId: 'docs' })}>
        queue B docs
      </button>
    </div>
  ),
}))

beforeEach(() => {
  mutateAsync.mockResolvedValue(undefined)
  patchDevices.mockResolvedValue(undefined)
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
    expect(screen.getByText(/ignored folders content/)).toBeTruthy()
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

  describe('removing ignored folders', () => {
    function queue(name: string) {
      fireEvent.click(screen.getByRole('tab', { name: 'Ignored folders' }))
      fireEvent.click(screen.getByRole('button', { name }))
    }

    function save() {
      fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    }

    it('does not send anything until Save is pressed', () => {
      renderDialog()

      queue('queue A docs')

      expect(patchDevices).not.toHaveBeenCalled()
    })

    it('sends the queued removal for that device when saved', async () => {
      const { onClose } = renderDialog()

      queue('queue A docs')
      save()

      await waitFor(() => expect(onClose).toHaveBeenCalled())
      expect(patchDevices).toHaveBeenCalledTimes(1)
      expect(patchDevices).toHaveBeenCalledWith([
        {
          params: { id: 'DEV-A' },
          body: { ignoredFolders: [ignored('photos'), ignored('music')] },
        },
      ])
    })

    it('combines several removals from one device, and keeps devices separate', async () => {
      const { onClose } = renderDialog()

      queue('queue A docs')
      queue('queue A photos')
      queue('queue B docs')
      save()

      await waitFor(() => expect(onClose).toHaveBeenCalled())
      expect(patchDevices).toHaveBeenCalledWith([
        { params: { id: 'DEV-A' }, body: { ignoredFolders: [ignored('music')] } },
        { params: { id: 'DEV-B' }, body: { ignoredFolders: [] } },
      ])
    })

    it('does not touch devices when nothing was queued', async () => {
      const { onClose } = renderDialog()

      save()

      await waitFor(() => expect(onClose).toHaveBeenCalled())
      expect(patchDevices).not.toHaveBeenCalled()
    })

    it('discards the queue when the dialog is closed', async () => {
      const { onClose } = renderDialog()

      queue('queue A docs')
      fireEvent.click(screen.getByRole('button', { name: 'Close' }))
      save()

      await waitFor(() => expect(mutateAsync).toHaveBeenCalled())
      expect(onClose).toHaveBeenCalled()
      expect(patchDevices).not.toHaveBeenCalled()
    })

    it('removes them before saving the GUI settings, which can log the user out', async () => {
      const { onClose } = renderDialog()

      queue('queue A docs')
      fireEvent.click(screen.getByRole('tab', { name: 'Authentication' }))
      type('Password', 'secret')
      save()

      await waitFor(() => expect(onClose).toHaveBeenCalled())
      expect(patchDevices.mock.invocationCallOrder[0]).toBeLessThan(
        mutateAsync.mock.invocationCallOrder[0],
      )
      expect(patchDevices.mock.invocationCallOrder[0]).toBeLessThan(
        logoutMutateAsync.mock.invocationCallOrder[0],
      )
    })
  })
})

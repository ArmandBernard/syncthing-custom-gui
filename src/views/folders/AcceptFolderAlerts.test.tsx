import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/preact'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ComponentChildren } from 'preact'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AcceptFolderAlerts } from './AcceptFolderAlerts.tsx'
import { useSyncthingQuery } from '@hooks/useSyncthingQuery.ts'
import { syncthingRequest } from '@lib/syncthing/syncthingRequest'
import type { DeviceConfiguration, ObservedFolder } from '@lib/syncthing/types/config'
import type { PendingFolder, PendingFolders } from '@lib/syncthing/types/cluster.ts'
import type { ISODateTime } from '@lib/syncthing/types/common.ts'

const invalidate = vi.fn()

vi.mock('@hooks/useSyncthingQuery.ts', () => ({ useSyncthingQuery: vi.fn() }))

vi.mock('@hooks/useSyncthingMutation.ts', () => ({
  useSyncthingMutation: () => ({ mutateAsync: vi.fn() }),
}))

vi.mock('@hooks/useSyncthingInvalidate.ts', () => ({
  useSyncthingInvalidate: () => invalidate,
}))

// The real batch mutation is used, so these tests cover its pending state too.
vi.mock('@lib/syncthing/syncthingRequest', () => ({ syncthingRequest: vi.fn() }))

// The dialog is lazy loaded, and isn't what these tests are about.
vi.mock('./FolderDialog.tsx', () => ({ default: () => null }))

const request = vi.mocked(syncthingRequest)
const now = new Date('2026-01-01T03:00:00Z')

beforeEach(() => {
  // Only Date is faked: waitFor relies on real timers to poll.
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(now)
  request.mockReset()
  request.mockResolvedValue(undefined)
  invalidate.mockReset()
  invalidate.mockResolvedValue(undefined)
  mockPendingFolders({})
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

/** Sets the offers returned by the 'GET /cluster/pending/folders' query. */
function mockPendingFolders(pendingFolders: Record<string, PendingFolder> | undefined) {
  vi.mocked(useSyncthingQuery).mockImplementation(
    (key) =>
      ({
        data:
          key === 'GET /cluster/pending/folders'
            ? (pendingFolders as PendingFolders | undefined)
            : undefined,
      }) as ReturnType<typeof useSyncthingQuery>,
  )
}

function ignoredFolder(id: string): ObservedFolder {
  return { id, label: `${id} label`, time: '2025-06-01T00:00:00Z' as ISODateTime }
}

function device(
  deviceID: string,
  name: string,
  ignoredFolders: ObservedFolder[] = [],
): DeviceConfiguration {
  return { deviceID, name, ignoredFolders } as DeviceConfiguration
}

/** A folder offered by each of the given devices, labelled `<deviceID> label`. */
function offeredBy(...deviceIDs: string[]): PendingFolder {
  return {
    offeredBy: Object.fromEntries(
      deviceIDs.map((deviceID) => [
        deviceID,
        {
          time: '2026-01-01T00:00:00Z' as ISODateTime,
          label: `${deviceID} label`,
          receiveEncrypted: false,
          remoteEncrypted: false,
        },
      ]),
    ),
  }
}

function renderAlerts(devices: DeviceConfiguration[]) {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  const wrapper = ({ children }: { children?: ComponentChildren }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  render(<AcceptFolderAlerts devices={devices} />, { wrapper })
}

function ignoreButton() {
  return screen.getByRole('button', { name: 'Ignore' })
}

const isDisabled = (button: HTMLElement) => button.getAttribute('aria-disabled') === 'true'

type Deferred = { resolve: () => void; reject: (error: Error) => void }

/** Makes the next request hang until the returned handle settles it. */
function holdNextRequest(): Deferred {
  const deferred = {} as Deferred
  request.mockImplementationOnce(
    () =>
      new Promise<never>((resolve, reject) => {
        deferred.resolve = resolve as () => void
        deferred.reject = reject
      }),
  )
  return deferred
}

describe('AcceptFolderAlerts', () => {
  it('shows nothing while the pending folders are loading', () => {
    mockPendingFolders(undefined)
    renderAlerts([device('DEV-A', 'Laptop')])

    expect(screen.queryAllByRole('alert')).toHaveLength(0)
  })

  it('shows nothing when no folders are offered', () => {
    renderAlerts([device('DEV-A', 'Laptop')])

    expect(screen.queryAllByRole('alert')).toHaveLength(0)
  })

  it('shows an alert for each offered folder', () => {
    mockPendingFolders({ docs: offeredBy('DEV-A'), photos: offeredBy('DEV-B') })
    renderAlerts([device('DEV-A', 'Laptop'), device('DEV-B', 'Phone')])

    const alerts = screen.getAllByRole('alert')
    expect(alerts).toHaveLength(2)
    expect(alerts[0].textContent).toContain('Laptop wants to share a folder called "DEV-A label"')
    expect(alerts[0].textContent).toContain('(docs)')
    expect(alerts[1].textContent).toContain('Phone wants to share a folder called "DEV-B label"')
    expect(within(alerts[0]).getByRole('button', { name: 'Add' })).toBeTruthy()
    expect(within(alerts[0]).getByRole('button', { name: 'Ignore' })).toBeTruthy()
  })

  describe('ignoring an offer', () => {
    it('adds the folder to the offering device’s ignored folders', async () => {
      mockPendingFolders({ docs: offeredBy('DEV-A') })
      renderAlerts([device('DEV-A', 'Laptop', [ignoredFolder('old')])])

      fireEvent.click(ignoreButton())

      await waitFor(() => expect(request).toHaveBeenCalledTimes(1))
      expect(request).toHaveBeenCalledWith('PATCH /config/devices/:id', {
        params: { id: 'DEV-A' },
        body: {
          ignoredFolders: [
            ignoredFolder('old'),
            { id: 'docs', label: 'DEV-A label', time: now.toISOString() },
          ],
        },
      })
    })

    it('ignores the folder on every device that offered it', async () => {
      mockPendingFolders({ docs: offeredBy('DEV-A', 'DEV-B') })
      renderAlerts([device('DEV-A', 'Laptop'), device('DEV-B', 'Phone', [ignoredFolder('old')])])

      fireEvent.click(ignoreButton())

      await waitFor(() => expect(request).toHaveBeenCalledTimes(2))
      expect(request).toHaveBeenCalledWith('PATCH /config/devices/:id', {
        params: { id: 'DEV-A' },
        body: { ignoredFolders: [{ id: 'docs', label: 'DEV-A label', time: now.toISOString() }] },
      })
      expect(request).toHaveBeenCalledWith('PATCH /config/devices/:id', {
        params: { id: 'DEV-B' },
        body: {
          ignoredFolders: [
            ignoredFolder('old'),
            { id: 'docs', label: 'DEV-B label', time: now.toISOString() },
          ],
        },
      })
    })

    it('keeps the button disabled until every device is patched and the refresh is done', async () => {
      const first = holdNextRequest()
      const second = holdNextRequest()
      let finishRefresh = () => {}
      invalidate.mockImplementation(() => new Promise<void>((resolve) => (finishRefresh = resolve)))
      mockPendingFolders({ docs: offeredBy('DEV-A', 'DEV-B') })
      renderAlerts([device('DEV-A', 'Laptop'), device('DEV-B', 'Phone')])

      fireEvent.click(ignoreButton())
      await waitFor(() => expect(isDisabled(ignoreButton())).toBe(true))

      // The last-started request finishing first must not re-enable the button.
      second.resolve()
      await Promise.resolve()
      expect(isDisabled(ignoreButton())).toBe(true)

      first.resolve()
      await waitFor(() => expect(invalidate).toHaveBeenCalled())
      expect(isDisabled(ignoreButton())).toBe(true)

      finishRefresh()
      await waitFor(() => expect(isDisabled(ignoreButton())).toBe(false))
    })
  })
})

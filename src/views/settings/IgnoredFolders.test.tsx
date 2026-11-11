import { cleanup, fireEvent, render, screen, within } from '@testing-library/preact'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { IgnoredFolders, type IgnoredFolderRef } from './IgnoredFolders.tsx'
import { useSyncthingQuery } from '@hooks/useSyncthingQuery.ts'
import { SyncthingApiError } from '@lib/syncthing/SyncthingApiError.ts'
import type { DeviceConfiguration, ObservedFolder } from '@lib/syncthing/types/config'
import type { ISODateTime } from '@lib/syncthing/types/common.ts'

vi.mock('@hooks/useSyncthingQuery.ts', () => ({
  useSyncthingQuery: vi.fn(),
}))

beforeEach(() => {
  // Only Date is faked: waitFor relies on real timers to poll.
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-01-01T03:00:00Z'))
  mockDevices(undefined)
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.clearAllMocks()
})

/** Sets the devices returned by the 'GET /config/devices' query. */
function mockDevices(devices: DeviceConfiguration[] | undefined) {
  vi.mocked(useSyncthingQuery).mockReturnValue({ data: devices } as ReturnType<
    typeof useSyncthingQuery
  >)
}

function folder(id: string, label = `${id} label`): ObservedFolder {
  return { id, label, time: '2026-01-01T00:00:00Z' as ISODateTime }
}

function device(
  deviceID: string,
  name: string,
  ignoredFolders: ObservedFolder[],
): DeviceConfiguration {
  return { deviceID, name, ignoredFolders } as DeviceConfiguration
}

function renderIgnoredFolders({
  error = null,
  removed = [],
}: { error?: SyncthingApiError | null; removed?: IgnoredFolderRef[] } = {}) {
  const onRemove = vi.fn()
  render(<IgnoredFolders removed={removed} onRemove={onRemove} error={error} />)
  return { onRemove }
}

/** The body rows only, without the header row. */
function bodyRows() {
  return screen.getAllByRole('row').slice(1)
}

describe('IgnoredFolders', () => {
  it('shows the column headers', () => {
    renderIgnoredFolders()

    for (const name of ['Id', 'Source device', 'Name', 'Ignored at']) {
      expect(screen.getByRole('columnheader', { name })).toBeTruthy()
    }
  })

  it('shows no rows while the devices are loading', () => {
    mockDevices(undefined)
    renderIgnoredFolders()

    expect(screen.queryAllByRole('row')).toHaveLength(1) // includes headers
  })

  it('shows no rows when nothing is ignored', () => {
    mockDevices([device('DEV-A', 'Laptop', [])])
    renderIgnoredFolders()

    expect(screen.queryAllByRole('row')).toHaveLength(1)
  })

  it('shows a row for each ignored folder, across all devices', () => {
    mockDevices([
      device('DEV-A', 'Laptop', [folder('docs'), folder('photos')]),
      device('DEV-B', 'Phone', [folder('music')]),
    ])
    renderIgnoredFolders()

    const rows = bodyRows()
    expect(rows).toHaveLength(3)
    expect(within(rows[0]).getByText('docs')).toBeTruthy()
    expect(within(rows[0]).getByText('Laptop')).toBeTruthy()
    expect(within(rows[0]).getByText('docs label')).toBeTruthy()
    expect(within(rows[0]).getByText('3 hours ago')).toBeTruthy()
    expect(within(rows[2]).getByText('music')).toBeTruthy()
    expect(within(rows[2]).getByText('Phone')).toBeTruthy()
  })

  it('shows the same folder once per device that ignored it', () => {
    mockDevices([
      device('DEV-A', 'Laptop', [folder('docs')]),
      device('DEV-B', 'Phone', [folder('docs')]),
    ])
    renderIgnoredFolders()

    const rows = bodyRows()
    expect(rows).toHaveLength(2)
    expect(within(rows[0]).getByText('Laptop')).toBeTruthy()
    expect(within(rows[1]).getByText('Phone')).toBeTruthy()
  })

  it('shows an error', () => {
    renderIgnoredFolders({ error: new SyncthingApiError(500, 'Boom') })

    expect(screen.getByText('500 Error')).toBeTruthy()
    expect(screen.getByText('Boom')).toBeTruthy()
  })

  describe('deleting an ignored folder', () => {
    it('queues the removal of that folder from that device, without sending anything', () => {
      mockDevices([device('DEV-A', 'Laptop', [folder('docs'), folder('photos'), folder('music')])])
      const { onRemove } = renderIgnoredFolders()

      fireEvent.click(within(bodyRows()[1]).getByRole('button', { name: 'Delete' }))

      expect(onRemove).toHaveBeenCalledTimes(1)
      expect(onRemove).toHaveBeenCalledWith({ deviceId: 'DEV-A', folderId: 'photos' })
    })

    it('queues the right device when several ignored the same folder', () => {
      mockDevices([
        device('DEV-A', 'Laptop', [folder('docs')]),
        device('DEV-B', 'Phone', [folder('docs'), folder('music')]),
      ])
      const { onRemove } = renderIgnoredFolders()

      fireEvent.click(within(bodyRows()[1]).getByRole('button', { name: 'Delete' }))

      expect(onRemove).toHaveBeenCalledWith({ deviceId: 'DEV-B', folderId: 'docs' })
    })

    it('hides folders that are queued for removal', () => {
      mockDevices([
        device('DEV-A', 'Laptop', [folder('docs'), folder('photos')]),
        device('DEV-B', 'Phone', [folder('docs')]),
      ])
      renderIgnoredFolders({ removed: [{ deviceId: 'DEV-A', folderId: 'docs' }] })

      const rows = bodyRows()
      expect(rows).toHaveLength(2)
      expect(within(rows[0]).getByText('photos')).toBeTruthy()
      // the same folder ignored by another device is a different entry, and stays
      expect(within(rows[1]).getByText('Phone')).toBeTruthy()
    })
  })
})

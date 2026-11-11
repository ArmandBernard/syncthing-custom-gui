import { act, cleanup, renderHook, waitFor } from '@testing-library/preact'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ComponentChildren } from 'preact'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useSyncthingBatchMutation } from './useSyncthingBatchMutation.ts'
import { syncthingRequest } from '@lib/syncthing/syncthingRequest'
import { SyncthingApiError } from '@lib/syncthing/SyncthingApiError.ts'

vi.mock('@lib/syncthing/syncthingRequest', () => ({ syncthingRequest: vi.fn() }))

const request = vi.mocked(syncthingRequest)

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

function renderBatchMutation(
  options?: Parameters<typeof useSyncthingBatchMutation<'PATCH /config/devices/:id'>>[1],
) {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  const wrapper = ({ children }: { children?: ComponentChildren }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  return renderHook(() => useSyncthingBatchMutation('PATCH /config/devices/:id', options), {
    wrapper,
  })
}

const requestFor = (id: string) => ({ params: { id }, body: { name: id } })

beforeEach(() => {
  request.mockReset()
  request.mockResolvedValue(undefined)
})

afterEach(cleanup)

describe('useSyncthingBatchMutation', () => {
  it('sends one request per item to the endpoint', async () => {
    const { result } = renderBatchMutation()

    await act(() => result.current.mutateAsync([requestFor('A'), requestFor('B')]))

    expect(request).toHaveBeenCalledTimes(2)
    expect(request).toHaveBeenCalledWith('PATCH /config/devices/:id', requestFor('A'))
    expect(request).toHaveBeenCalledWith('PATCH /config/devices/:id', requestFor('B'))
  })

  it('succeeds without sending anything for an empty batch', async () => {
    const { result } = renderBatchMutation()

    await act(() => result.current.mutateAsync([]))

    expect(request).not.toHaveBeenCalled()
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('stays pending until every request has finished, whichever finishes last', async () => {
    const first = holdNextRequest()
    const second = holdNextRequest()
    const { result } = renderBatchMutation()

    let done: Promise<void> = Promise.resolve()
    await act(async () => {
      done = result.current.mutateAsync([requestFor('A'), requestFor('B')])
    })
    await waitFor(() => expect(result.current.isPending).toBe(true))

    // The last-started request finishing first is exactly what a looped useMutation gets wrong.
    await act(async () => second.resolve())
    expect(result.current.isPending).toBe(true)

    await act(async () => {
      first.resolve()
      await done
    })
    await waitFor(() => expect(result.current.isPending).toBe(false))
    expect(result.current.isSuccess).toBe(true)
  })

  it('attempts every request and reports the failure once all have settled', async () => {
    const failure = new SyncthingApiError(500, 'Boom')
    const first = holdNextRequest()
    const second = holdNextRequest()
    const { result } = renderBatchMutation()

    let done: Promise<void> = Promise.resolve()
    await act(async () => {
      done = result.current.mutateAsync([requestFor('A'), requestFor('B')])
      done.catch(() => {})
    })
    await waitFor(() => expect(result.current.isPending).toBe(true))

    await act(async () => first.reject(failure))
    expect(result.current.isPending).toBe(true) // B is still running

    await act(async () => {
      second.resolve()
      await done.catch(() => {})
    })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBe(failure)
    expect(request).toHaveBeenCalledTimes(2)
  })

  it('rejects mutateAsync with the first failure in request order', async () => {
    const firstFailure = new SyncthingApiError(500, 'first')
    request.mockRejectedValueOnce(firstFailure)
    request.mockRejectedValueOnce(new SyncthingApiError(500, 'second'))
    const { result } = renderBatchMutation()

    await act(async () => {
      await expect(result.current.mutateAsync([requestFor('A'), requestFor('B')])).rejects.toBe(
        firstFailure,
      )
    })
  })

  it('stays pending while an async onSettled is still running', async () => {
    let finishSettled = () => {}
    const onSettled = vi.fn(() => new Promise<void>((resolve) => (finishSettled = resolve)))
    const { result } = renderBatchMutation({ onSettled })

    let done: Promise<void> = Promise.resolve()
    await act(async () => {
      done = result.current.mutateAsync([requestFor('A')])
    })
    await waitFor(() => expect(onSettled).toHaveBeenCalled())
    expect(result.current.isPending).toBe(true)

    await act(async () => {
      finishSettled()
      await done
    })
    await waitFor(() => expect(result.current.isPending).toBe(false))
  })
})

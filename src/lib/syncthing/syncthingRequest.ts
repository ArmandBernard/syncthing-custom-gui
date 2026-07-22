import { getCsrfHeader, refreshCsrfCookie } from './getCsrfHeader'
import type { EndpointMap } from './endpoints'
import type { RequestOptions } from '@lib/syncthing/RequestOptions.ts'
import { SyncthingApiError } from '@lib/syncthing/SyncthingApiError.ts'

// A small fixed set of endpoints don't speak JSON. TS types alone can't drive
// runtime parsing decisions, so these are tracked as plain lookup tables.
const RAW_TEXT_BODY_KEYS: ReadonlySet<string> = new Set(['POST /system/error'])
const RAW_TEXT_RESPONSE_KEYS: ReadonlySet<string> = new Set(['GET /system/log.txt'])
const BLOB_RESPONSE_KEYS: ReadonlySet<string> = new Set([
  'GET /debug/cpuprof',
  'GET /debug/heapprof',
  'GET /debug/support',
])

function buildPath(pathTemplate: string, params?: unknown, query?: unknown): string {
  let path = pathTemplate
  if (params) {
    for (const [name, value] of Object.entries(params)) {
      path = path.replace(`:${name}`, encodeURIComponent(value))
    }
  }

  const searchParams = new URLSearchParams()
  if (query) {
    for (const [name, value] of Object.entries(query)) {
      if (value === undefined) {
        continue
      }
      if (Array.isArray(value)) {
        for (const item of value) searchParams.append(name, String(item))
      } else {
        searchParams.append(name, String(value))
      }
    }
  }

  const search = searchParams.toString()
  return `/rest${path}${search ? `?${search}` : ''}`
}

export async function syncthingRequest<K extends keyof EndpointMap>(
  key: K,
  options: RequestOptions<EndpointMap[K]> & { signal?: AbortSignal },
): Promise<EndpointMap[K]['response']> {
  const [method, pathTemplate] = key.split(' ', 2)
  const url = buildPath(pathTemplate, options?.params, options?.query)

  const isRawTextBody = RAW_TEXT_BODY_KEYS.has(key)
  const hasBody = 'body' in options && options?.body !== undefined

  const doFetch = () =>
    fetch(url, {
      method,
      credentials: 'include',
      headers: {
        ...getCsrfHeader(),
        ...(hasBody && !isRawTextBody ? { 'Content-Type': 'application/json' } : {}),
      },
      body: hasBody
        ? isRawTextBody
          ? String(options?.body)
          : JSON.stringify(options?.body)
        : undefined,
      signal: options.signal,
    })

  let response = await doFetch()

  if (!response.ok) {
    let message = await response.text().catch(() => '')
    // Syncthing only issues the CSRF-Token cookie from GUI pages, never from
    // REST calls, so the very first authenticated request has no cookie to
    // send yet — and an existing one can also go stale later (e.g. Syncthing
    // regenerating its secret across a restart). Both surface identically as
    // a CSRF-flavoured 403; fetch a fresh cookie and retry once before giving
    // up.
    if (response.status === 403 && /csrf/i.test(message)) {
      await refreshCsrfCookie()
      response = await doFetch()
      message = response.ok ? '' : await response.text().catch(() => '')
    }
    if (!response.ok) {
      throw new SyncthingApiError(response.status, message || response.statusText)
    }
  }

  if (BLOB_RESPONSE_KEYS.has(key)) {
    return (await response.blob()) as EndpointMap[K]['response']
  }
  if (RAW_TEXT_RESPONSE_KEYS.has(key)) {
    return (await response.text()) as EndpointMap[K]['response']
  }

  if (response.status === 204) return undefined as EndpointMap[K]['response']
  const text = await response.text()
  return (text ? JSON.parse(text) : undefined) as EndpointMap[K]['response']
}

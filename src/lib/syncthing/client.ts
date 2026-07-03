import type { EndpointMap } from './endpoints'

export class SyncthingApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'SyncthingApiError'
    this.status = status
  }
}

export type RequestOptions<E> = ('params' extends keyof E ? { params: E['params'] } : object) &
  ('query' extends keyof E
    ? undefined extends E['query']
      ? { query?: E['query'] }
      : { query: E['query'] }
    : object) &
  ('body' extends keyof E
    ? undefined extends E['body']
      ? { body?: E['body'] }
      : { body: E['body'] }
    : object)

interface RuntimeOptions {
  params?: Record<string, string>
  query?: Record<string, unknown>
  body?: unknown
}

// A small fixed set of endpoints don't speak JSON. TS types alone can't drive
// runtime parsing decisions, so these are tracked as plain lookup tables.
const RAW_TEXT_BODY_KEYS: ReadonlySet<string> = new Set(['POST /system/error'])
const RAW_TEXT_RESPONSE_KEYS: ReadonlySet<string> = new Set(['GET /system/log.txt'])
const BLOB_RESPONSE_KEYS: ReadonlySet<string> = new Set([
  'GET /debug/cpuprof',
  'GET /debug/heapprof',
  'GET /debug/support',
])

function buildPath(pathTemplate: string, params?: Record<string, string>, query?: Record<string, unknown>): string {
  let path = pathTemplate
  if (params) {
    for (const [name, value] of Object.entries(params)) {
      path = path.replace(`:${name}`, encodeURIComponent(value))
    }
  }

  const searchParams = new URLSearchParams()
  if (query) {
    for (const [name, value] of Object.entries(query)) {
      if (value === undefined) continue
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
  apiKey: string,
  key: K,
  ...args: object extends RequestOptions<EndpointMap[K]>
    ? [options?: RequestOptions<EndpointMap[K]>]
    : [options: RequestOptions<EndpointMap[K]>]
): Promise<EndpointMap[K]['response']> {
  const options = args[0] as unknown as RuntimeOptions | undefined
  const [method, pathTemplate] = (key as string).split(' ', 2)
  const url = buildPath(pathTemplate, options?.params, options?.query)

  const isRawTextBody = RAW_TEXT_BODY_KEYS.has(key as string)
  const hasBody = options?.body !== undefined

  const response = await fetch(url, {
    method,
    headers: {
      'X-API-Key': apiKey,
      ...(hasBody && !isRawTextBody ? { 'Content-Type': 'application/json' } : {}),
    },
    body: hasBody ? (isRawTextBody ? String(options?.body) : JSON.stringify(options?.body)) : undefined,
  })

  if (!response.ok) {
    const message = await response.text().catch(() => '')
    throw new SyncthingApiError(response.status, message || response.statusText)
  }

  if (BLOB_RESPONSE_KEYS.has(key as string)) {
    return (await response.blob()) as EndpointMap[K]['response']
  }
  if (RAW_TEXT_RESPONSE_KEYS.has(key as string)) {
    return (await response.text()) as EndpointMap[K]['response']
  }

  if (response.status === 204) return undefined as EndpointMap[K]['response']
  const text = await response.text()
  return (text ? JSON.parse(text) : undefined) as EndpointMap[K]['response']
}

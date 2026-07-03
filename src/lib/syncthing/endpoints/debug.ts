// Debug endpoints are internal/rarely used and are typed lightly on purpose.
export interface DebugEndpoints {
  // Binary pprof profile downloads — not JSON.
  'GET /debug/cpuprof': { response: Blob }
  'GET /debug/heapprof': { response: Blob }
  // Zipped support-bundle download.
  'GET /debug/support': { response: Blob }
  // Docs defer the shape to GET /rest/db/file plus an undocumented extra field.
  'GET /debug/file': { query: { folder: string; file: string }; response: unknown }
}

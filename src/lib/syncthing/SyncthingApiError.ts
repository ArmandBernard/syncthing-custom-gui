export class SyncthingApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'SyncthingApiError'
    this.status = status
  }
}

const STORAGE_KEY = 'syncthing-api-key'

export function getStoredApiKey(): string | null {
  return localStorage.getItem(STORAGE_KEY)
}

export function setStoredApiKey(apiKey: string): void {
  localStorage.setItem(STORAGE_KEY, apiKey)
}

export function clearStoredApiKey(): void {
  localStorage.removeItem(STORAGE_KEY)
}

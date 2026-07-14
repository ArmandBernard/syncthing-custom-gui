export function getEnumEntries<T extends Partial<Record<keyof T, unknown>>>(obj: T) {
  return Object.entries(obj) as [keyof T, Required<T>[keyof T]][]
}

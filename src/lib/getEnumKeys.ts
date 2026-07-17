export function getEnumKeys<T extends Partial<Record<keyof T, unknown>>>(obj: T) {
  return Object.keys(obj) as (keyof T)[]
}

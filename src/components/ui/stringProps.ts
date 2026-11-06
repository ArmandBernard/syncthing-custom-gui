/**
 * Preact types `className` and `id` as `Signalish<string | undefined>`, so interpolating them into
 * template literals trips type-aware lint rules. Our components only accept plain strings for these.
 */
export type StringProps<T, K extends 'className' | 'id' = 'className'> = Omit<T, K> &
  Pick<{ className?: string; id?: string }, K>

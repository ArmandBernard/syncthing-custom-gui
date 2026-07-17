export type RequestOptions<E> = {
  body?: E[keyof E & 'body'] | undefined
  query?: E[keyof E & 'query'] | undefined
  params?: E[keyof E & 'params'] | undefined
}

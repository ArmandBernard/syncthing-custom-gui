import type { Dayjs } from 'dayjs'
import dayJs from '@lib/dayJs.ts'

export function getLongDateTimeString(dateTime: string | Date | Dayjs) {
  const date = dayJs(dateTime)

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'full',
    timeStyle: 'long',
  }).format(date.toDate())
}

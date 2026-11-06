import dayJs from '@lib/dayJs'
import { getLongDateTimeString } from '@lib/formatDates.ts'

export function RelativeTime({ date }: { date: string }) {
  const dateObj = dayJs(date)

  return (
    <div className="inline" title={getLongDateTimeString(dateObj)}>
      {dateObj.fromNow()}
    </div>
  )
}

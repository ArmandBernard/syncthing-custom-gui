import dayJs from '@lib/dayJs'
import { getLongDateTimeString } from '@lib/formatDates.ts'
import { useCurrentTime } from '@lib/useCurrentTime.ts'

export function RelativeTime({ date }: { date: string }) {
  const currentTime = dayJs(useCurrentTime())
  const dateObj = dayJs(date)

  return (
    <div className="inline" title={getLongDateTimeString(dateObj)}>
      {dateObj.from(currentTime)}
    </div>
  )
}

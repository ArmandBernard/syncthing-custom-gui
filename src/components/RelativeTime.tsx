import dayJs from '../lib/dayJs'

export function RelativeTime({ date }: { date: string }) {
  const dateObj = dayJs(date)

  return (
    <div className="inline" title={date}>
      {dateObj.fromNow()}
    </div>
  )
}

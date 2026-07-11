import dayJs from '@lib/dayJs'

export function TimeSpan({ seconds }: { seconds: number }) {
  const duration = dayJs.duration(seconds, 'seconds')

  let durationStringSections = []

  if (duration.days() > 0) {
    durationStringSections.push(`${duration.days()}d`)
  }
  if (duration.hours() > 0) {
    durationStringSections.push(`${duration.hours()}h`)
  }
  if (duration.minutes() > 0) {
    durationStringSections.push(`${duration.minutes()}m`)
  }

  return durationStringSections.join(' ')
}

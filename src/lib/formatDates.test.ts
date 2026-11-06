import { describe, expect, test } from 'vitest'
import dayJs from 'dayjs'
import { getLongDateTimeString } from '@lib/formatDates.ts'

describe('getLocaleLongString', () => {
  const testDate = '2026-11-06T16:00:00Z'
  const expectedOutput = 'Friday, 6 November 2026 at 16:00:00 GMT'
  test.each([
    { name: 'an ISO string', date: testDate },
    { name: 'a Date', date: new Date(testDate) },
    { name: 'a DayJS object', date: dayJs(testDate) },
  ])('works with $name', ({ date }) => {
    const result = getLongDateTimeString(date)

    expect(result).toBe(expectedOutput)
  })
})

import { describe, expect, test } from 'vitest'
import dayJs from 'dayjs'
import { getLongDateTimeString } from '@lib/formatDates.ts'

describe('getLocaleLongString', () => {
  const testDate = '2026-11-06T16:00:00Z'
  const expectedOutput = 'Friday, 6 November 2026 at 16:00:00 GMT'
  test.each([
    [testDate, 'an ISO string'],
    [new Date(testDate), 'a Date'],
    [dayJs(testDate), 'a DayJS object'],
  ])('works with $1', (date, _) => {
    const result = getLongDateTimeString(date)

    expect(result).toBe(expectedOutput)
  })
})

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import dayJs from 'dayjs'
import { getLongDateTimeString } from '@lib/formatDates.ts'

describe('getLocaleLongString', () => {
  beforeEach(() => {
    const Original = Intl.DateTimeFormat
    vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(function (_locale, options) {
      return new Original('en-GB', { timeZone: 'UTC', ...options })
    })
  })
  afterEach(() => vi.restoreAllMocks())

  const testDate = '2026-11-06T16:00:00Z'
  const expectedOutput = 'Friday, 6 November 2026 at 16:00:00 UTC'
  test.each([
    { name: 'an ISO string', date: testDate },
    { name: 'a Date', date: new Date(testDate) },
    { name: 'a DayJS object', date: dayJs(testDate) },
  ])('works with $name', ({ date }) => {
    const result = getLongDateTimeString(date)

    expect(result).toBe(expectedOutput)
  })
})

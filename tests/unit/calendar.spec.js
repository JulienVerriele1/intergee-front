import { describe, expect, it } from 'vitest'
import { dateKey, formatTime, isSlotAvailable, monthWeeks, slotsBetween, splitDateTime } from '@/utils/calendar'

describe('calendar helpers', () => {
  it('lays a month out in weeks starting on Monday', () => {
    // October 2026 starts on a Thursday and has 31 days
    const weeks = monthWeeks(2026, 9)
    expect(weeks[0].slice(0, 3)).toEqual([null, null, null])
    expect(dateKey(weeks[0][3])).toBe('2026-10-01')
    expect(weeks.flat().filter(Boolean)).toHaveLength(31)
    expect(weeks.every((week) => week.length === 7)).toBe(true)
  })

  it('writes hours the French way', () => {
    expect(formatTime('09:00')).toBe('9 h')
    expect(formatTime('10:30')).toBe('10 h 30')
  })

  it('offers half-hour slots from 8 h to 20 h', () => {
    expect(slotsBetween(8, 12)).toEqual(['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'])
    expect(slotsBetween(18, 21)).toEqual(['18:00', '18:30', '19:00', '19:30', '20:00'])
  })

  it('splits a datetime-local value and refuses slots in the past', () => {
    expect(splitDateTime('2026-10-14T10:30')).toEqual({ day: '2026-10-14', time: '10:30' })
    expect(splitDateTime('')).toEqual({ day: '', time: '' })
    const now = new Date('2026-10-14T10:15')
    expect(isSlotAvailable('2026-10-14', '10:00', now)).toBe(false)
    expect(isSlotAvailable('2026-10-14', '10:30', now)).toBe(true)
  })
})

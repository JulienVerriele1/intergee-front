/**
 * Pure helpers behind the date and time picker. Dates are handled in local time and exchanged as the
 * "YYYY-MM-DDTHH:mm" string a datetime-local input would produce, so the mission form keeps its validation.
 */

export const FIRST_SLOT_HOUR = 8
export const LAST_SLOT_HOUR = 20
export const SLOT_MINUTES = 30

export const DAY_PARTS = Object.freeze([
  { label: 'Matin', from: 8, to: 12 },
  { label: 'Après-midi', from: 12, to: 18 },
  { label: 'Soir', from: 18, to: 21 },
])

/** Monday first, as on French paper calendars. */
export const WEEKDAYS = Object.freeze([
  { short: 'lun.', long: 'lundi' },
  { short: 'mar.', long: 'mardi' },
  { short: 'mer.', long: 'mercredi' },
  { short: 'jeu.', long: 'jeudi' },
  { short: 'ven.', long: 'vendredi' },
  { short: 'sam.', long: 'samedi' },
  { short: 'dim.', long: 'dimanche' },
])

const pad = (value) => String(value).padStart(2, '0')

/** "2026-10-14" for a local date. */
export function dateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** Local Date at midnight from "2026-10-14". */
export function parseDateKey(key) {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/** Splits "2026-10-14T10:30" into { day: "2026-10-14", time: "10:30" }; empty parts when absent. */
export function splitDateTime(value) {
  const [day = '', time = ''] = (value || '').split('T')
  return { day, time: time.slice(0, 5) }
}

/** The weeks of a month, Monday first, padded with null outside the month. */
export function monthWeeks(year, month) {
  const first = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const leading = (first.getDay() + 6) % 7
  const cells = Array.from({ length: leading }, () => null)
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day))
  }
  while (cells.length % 7 !== 0) {
    cells.push(null)
  }
  return Array.from({ length: cells.length / 7 }, (_, index) => cells.slice(index * 7, index * 7 + 7))
}

/** "10:30" → "10 h 30", "9:00" → "9 h", the French way of writing hours. */
export function formatTime(time) {
  const [hours, minutes] = time.split(':').map(Number)
  return minutes === 0 ? `${hours} h` : `${hours} h ${pad(minutes)}`
}

const monthFormatter = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' })
const longDateFormatter = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

/** "octobre 2026" */
export function formatMonth(year, month) {
  return monthFormatter.format(new Date(year, month, 1))
}

/** "mercredi 14 octobre 2026" */
export function formatLongDate(date) {
  return longDateFormatter.format(date)
}

/** Slots of a day part: ["8:00", "8:30", …], the last part ending on the last slot hour. */
export function slotsBetween(fromHour, toHour) {
  const slots = []
  for (let minutes = fromHour * 60; minutes < toHour * 60; minutes += SLOT_MINUTES) {
    if (minutes > LAST_SLOT_HOUR * 60) {
      break
    }
    slots.push(`${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`)
  }
  return slots
}

/** True when the slot of that day starts after `min` (a Date). */
export function isSlotAvailable(day, time, min) {
  return new Date(`${day}T${time}`) > min
}

// Cancellation of a mission by the beneficiary, withdrawal of the assigned student (spec 017)

/** Chosen in a list, without free text: no health information (spec 017, Q3) */
export const CANCELLATION_REASONS = Object.freeze([
  { value: 'NO_LONGER_NEEDED', label: 'Je n’en ai plus besoin' },
  { value: 'OTHER_SOLUTION_FOUND', label: 'J’ai trouvé une autre solution' },
  { value: 'UNAVAILABLE', label: 'Je suis indisponible' },
  { value: 'OTHER', label: 'Autre' },
])

export const WITHDRAWAL_REASONS = Object.freeze([
  { value: 'UNAVAILABLE', label: 'Je suis indisponible' },
  { value: 'OTHER', label: 'Autre' },
])

export function cancellationReasonLabel(reason) {
  return [...CANCELLATION_REASONS, ...WITHDRAWAL_REASONS].find((option) => option.value === reason)?.label ?? reason
}

const HOUR_MS = 60 * 60_000
/** The beneficiary warns at least 2 hours before, the student at least 8 hours before (spec 017, RG-6) */
export const CANCELLATION_NOTICE_HOURS = 2
export const WITHDRAWAL_NOTICE_HOURS = 8

export function hasStarted(mission, now = Date.now()) {
  return new Date(mission.scheduledAt).getTime() <= now
}

/** A mission is cancelled or changed until it starts, unless it is over or already cancelled (spec 017, RG-2, RG-3) */
export function isLive(mission, now = Date.now()) {
  return ['OPEN', 'APPLIED', 'ASSIGNED'].includes(mission.status) && !hasStarted(mission, now)
}

/** Less than 2 hours before the start of a mission with a chosen student: they may review the beneficiary */
export function isLateCancellation(mission, now = Date.now()) {
  return mission.status === 'ASSIGNED' && new Date(mission.scheduledAt).getTime() - now < CANCELLATION_NOTICE_HOURS * HOUR_MS
}

/** Less than 8 hours before the start: the beneficiary may review the student */
export function isLateWithdrawal(mission, now = Date.now()) {
  return new Date(mission.scheduledAt).getTime() - now < WITHDRAWAL_NOTICE_HOURS * HOUR_MS
}

/** A review after a late cancellation or withdrawal stays open until the given date (spec 017, RG-6) */
export function lateReviewOpen(reviewOpenUntil, reviewSubmitted, now = Date.now()) {
  return Boolean(reviewOpenUntil) && !reviewSubmitted && now < new Date(reviewOpenUntil).getTime()
}

/** Shown instead of the category of the mission on a review (spec 017, RG-6) */
export const REVIEW_OCCASION_LABELS = Object.freeze({
  LATE_CANCELLATION: 'Annulation tardive',
  LATE_WITHDRAWAL: 'Désistement tardif',
})

/** Labels of the fields refused by CHANGE_NOT_ALLOWED */
export const CHANGED_FIELD_LABELS = Object.freeze({
  TITLE: 'le titre',
  DESCRIPTION: 'la description',
  HOURLY_NET_WAGE: 'le salaire (seulement à la hausse)',
  CATEGORY: 'la catégorie',
  SCHEDULE: 'la date',
  DURATION: 'la durée',
  LOCATION: 'le lieu',
  REQUIRED_SKILLS: 'les compétences demandées',
})

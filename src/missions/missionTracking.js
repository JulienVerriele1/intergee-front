// Statuses of a mission and of an application as worded for each role (spec 009)

export const PERIODS = Object.freeze([
  { value: 'UPCOMING', label: 'À venir' },
  { value: 'PAST', label: 'Passées' },
])

/** A mission is over once its slot ends: start plus duration (spec 008). */
export function isOver(mission, now = Date.now()) {
  return new Date(mission.scheduledAt).getTime() + mission.durationMinutes * 60_000 <= now
}

const REVIEW_PERIOD_MS = 14 * 24 * 60 * 60_000

/**
 * A completed mission is reviewed once per side, within 14 days from its completion (spec 007, RG-3 and RG-5).
 */
export function canReview(completedAt, reviewSubmitted, now = Date.now()) {
  return Boolean(completedAt) && !reviewSubmitted && now < new Date(completedAt).getTime() + REVIEW_PERIOD_MS
}

/**
 * @returns {{label: string, tone: 'neutral'|'info'|'success'|'warning'}}
 */
export function publishedMissionStatus(mission, now = Date.now()) {
  switch (mission.status) {
    case 'OPEN':
      return { label: 'En attente de candidats', tone: 'neutral' }
    case 'APPLIED':
      return {
        label: `${mission.applicationCount} candidature${mission.applicationCount > 1 ? 's' : ''}`,
        tone: 'info',
      }
    case 'ASSIGNED':
      return isOver(mission, now)
        ? { label: 'À confirmer', tone: 'warning' }
        : { label: `Attribuée à ${mission.assignedStudentFirstName}`, tone: 'success' }
    case 'COMPLETED':
      return { label: 'Terminée', tone: 'neutral' }
    default:
      return { label: mission.status, tone: 'neutral' }
  }
}

/** "Non retenue" rather than "Refusée": the student may apply elsewhere on this slot (spec 009, Q3). */
export function applicationStatus(application) {
  switch (application.applicationStatus) {
    case 'PENDING':
      return { label: 'En attente', tone: 'info' }
    case 'ACCEPTED':
      return application.mission.status === 'COMPLETED'
        ? { label: 'Retenue · mission terminée', tone: 'neutral' }
        : { label: 'Retenue', tone: 'success' }
    case 'REJECTED':
      return { label: 'Non retenue', tone: 'neutral' }
    default:
      return { label: application.applicationStatus, tone: 'neutral' }
  }
}

export const TONE_CLASSES = Object.freeze({
  neutral: 'bg-slate-100 text-slate-800',
  info: 'bg-blue-100 text-blue-900',
  success: 'bg-green-100 text-green-900',
  warning: 'bg-amber-100 text-amber-900',
})

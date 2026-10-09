// Statuses of a mission and of an application as worded for each role (spec 009)

export const PERIODS = Object.freeze([
  { value: 'UPCOMING', label: 'À venir' },
  { value: 'PAST', label: 'Passées' },
])

/** A mission is over once its slot ends: start plus duration (spec 008). */
export function isOver(mission, now = Date.now()) {
  return new Date(mission.scheduledAt).getTime() + mission.durationMinutes * 60_000 <= now
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

/** Status tag of the design system: a soft background and an icon, the word itself always in ink. */
export const TONE_CLASSES = Object.freeze({
  neutral: 'bg-surface-sunken [&>svg]:text-ink-muted',
  info: 'bg-primary-soft [&>svg]:text-primary-ink',
  success: 'bg-success-soft [&>svg]:text-success',
  warning: 'bg-accent-soft [&>svg]:text-ink',
})

export const TONE_ICONS = Object.freeze({
  neutral: 'dot',
  info: 'clock',
  success: 'check',
  warning: 'alert',
})

import { describe, expect, it } from 'vitest'
import { applicationStatus, isOver, publishedMissionStatus } from '@/missions/missionTracking'

const NOW = Date.parse('2026-12-05T10:00:00Z')

function mission(overrides = {}) {
  // From 8:00 to 9:30
  return { scheduledAt: '2026-12-05T08:00:00Z', durationMinutes: 90, status: 'OPEN', applicationCount: 0, ...overrides }
}

describe('missionTracking', () => {
  it('considers a mission over at the end of its slot, without tolerance', () => {
    expect(isOver(mission(), Date.parse('2026-12-05T09:30:00Z'))).toBe(true)
    expect(isOver(mission(), Date.parse('2026-12-05T09:29:59Z'))).toBe(false)
  })

  it('words the status of a published mission', () => {
    expect(publishedMissionStatus(mission(), NOW).label).toBe('En attente de candidats')
    expect(publishedMissionStatus(mission({ status: 'APPLIED', applicationCount: 1 }), NOW).label).toBe('1 candidature')
    expect(publishedMissionStatus(mission({ status: 'APPLIED', applicationCount: 3 }), NOW).label).toBe('3 candidatures')
    expect(publishedMissionStatus(mission({ status: 'COMPLETED' }), NOW).label).toBe('Terminée')
  })

  it('asks to confirm an assigned mission once over', () => {
    const assigned = mission({ status: 'ASSIGNED', assignedStudentFirstName: 'Léa' })

    expect(publishedMissionStatus(assigned, Date.parse('2026-12-05T09:00:00Z')).label).toBe('Attribuée à Léa')
    expect(publishedMissionStatus(assigned, NOW)).toEqual({ label: 'À confirmer', tone: 'warning' })
  })

  it('words the status of an application, "Non retenue" rather than "Refusée"', () => {
    expect(applicationStatus({ applicationStatus: 'PENDING', mission: mission() }).label).toBe('En attente')
    expect(applicationStatus({ applicationStatus: 'ACCEPTED', mission: mission({ status: 'ASSIGNED' }) }).label).toBe('Retenue')
    expect(applicationStatus({ applicationStatus: 'ACCEPTED', mission: mission({ status: 'COMPLETED' }) }).label)
      .toBe('Retenue · mission terminée')
    expect(applicationStatus({ applicationStatus: 'REJECTED', mission: mission({ status: 'ASSIGNED' }) }).label).toBe('Non retenue')
  })
})

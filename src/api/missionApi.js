import { http } from './http'

export async function publishMission(payload) {
  const { data } = await http.post('/missions', payload)
  return data
}

/** Applies to a mission as the authenticated student (spec 005). */
export async function applyToMission(missionId) {
  const { data } = await http.post(`/missions/${encodeURIComponent(missionId)}/applications`)
  return data
}

/** Withdraws the application of the authenticated student (spec 005). */
export async function withdrawApplication(missionId) {
  await http.delete(`/missions/${encodeURIComponent(missionId)}/applications/me`)
}

/**
 * Open missions within the intervention area of the authenticated student (spec 004).
 *
 * @param {{category?: string, page?: number, size?: number}} criteria
 * Each item has `alreadyApplied`: whether the student applied to it.
 * @returns {Promise<{items: object[], page: number, size: number, totalItems: number, totalPages: number}>}
 */
export async function fetchOpenMissions({ category, page = 0, size = 20 } = {}) {
  const { data } = await http.get('/missions/open', {
    params: { ...(category && { category }), page, size },
  })
  return data
}

/**
 * Missions of the authenticated beneficiary, or of every beneficiary the caregiver manages (spec 009).
 *
 * @param {{period?: 'ALL'|'UPCOMING'|'PAST', page?: number, size?: number}} criteria
 */
export async function fetchMyMissions({ period = 'ALL', page = 0, size = 20 } = {}) {
  const { data } = await http.get('/missions/mine', { params: { period, page, size } })
  return data
}

/**
 * Applications of the authenticated student, without the address of the beneficiary (spec 009).
 *
 * @param {{period?: 'ALL'|'UPCOMING'|'PAST', page?: number, size?: number}} criteria
 */
export async function fetchMyApplications({ period = 'ALL', page = 0, size = 20 } = {}) {
  const { data } = await http.get('/applications/mine', { params: { period, page, size } })
  return data
}

/** Applicants of a mission, for its beneficiary or their caregiver (spec 005). */
export async function fetchApplications(missionId) {
  const { data } = await http.get(`/missions/${encodeURIComponent(missionId)}/applications`)
  return data
}

/** Accepts an applicant: irreversible, the other applications are rejected (spec 006). */
export async function assignMission(missionId, applicantId) {
  const { data } = await http.post(`/missions/${encodeURIComponent(missionId)}/assignment`, { applicantId })
  return data
}

/** Full address and contacts of an assigned mission, for the assigned student and the beneficiary side (spec 006). */
export async function fetchAssignment(missionId) {
  const { data } = await http.get(`/missions/${encodeURIComponent(missionId)}/assignment`)
  return data
}

/** Confirms that an assigned mission took place: final (spec 008). */
export async function completeMission(missionId) {
  const { data } = await http.post(`/missions/${encodeURIComponent(missionId)}/completion`)
  return data
}

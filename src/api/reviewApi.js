import { http } from './http'

/** Reviews the other side of a completed mission, rating only (spec 007). */
export async function submitReview(missionId, rating) {
  const { data } = await http.post('/reviews', { missionId, rating })
  return data
}

/** Published reviews received by a student or a beneficiary, without their author (spec 007). */
export async function fetchUserReviews(userId, { page = 0, size = 20 } = {}) {
  const { data } = await http.get(`/users/${encodeURIComponent(userId)}/reviews`, { params: { page, size } })
  return data
}

/** Reputation of the authenticated user, or of every beneficiary a caregiver manages (spec 007). */
export async function fetchMyReputations() {
  const { data } = await http.get('/reviews/received')
  return data
}

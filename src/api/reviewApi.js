import { http } from './http'

/**
 * Reviews the other side of a completed mission (spec 007), with an optional comment (spec 014).
 *
 * @param {string|null} comment 500 characters at most; left out when blank
 */
/**
 * @param studentId on the beneficiary side, the student who withdrew late (spec 017, RG-6); absent for the assigned
 *                  student
 */
export async function submitReview(missionId, rating, comment = null, studentId = null) {
  const { data } = await http.post('/reviews', {
    missionId,
    rating,
    ...(comment?.trim() && { comment: comment.trim() }),
    ...(studentId && { studentId }),
  })
  return data
}

/**
 * Published reviews received by a student or a beneficiary, with the first name of their author (spec 014): each
 * item has `authorFirstName`, `comment` (absent while hidden), `commentRemoved` and `reportable`.
 */
export async function fetchUserReviews(userId, { page = 0, size = 20 } = {}) {
  const { data } = await http.get(`/users/${encodeURIComponent(userId)}/reviews`, { params: { page, size } })
  return data
}

/** Reputation of the authenticated user, or of every beneficiary a caregiver manages (spec 007). */
export async function fetchMyReputations() {
  const { data } = await http.get('/reviews/received')
  return data
}

/**
 * Reports a comment received: it is hidden at once, until the Geen team decides (spec 014, RG-5).
 *
 * @param {'ABUSIVE'|'HEALTH_INFORMATION'|'PERSONAL_INFORMATION'|'OTHER'} reason
 */
export async function reportComment(reviewId, reason) {
  await http.post(`/reviews/${encodeURIComponent(reviewId)}/report`, { reason })
}

/** Comments hidden by a report, oldest first (spec 014, RG-6): moderators only. */
export async function fetchReportedComments() {
  const { data } = await http.get('/moderation/reports')
  return data
}

export async function restoreComment(reviewId) {
  await http.post(`/moderation/reports/${encodeURIComponent(reviewId)}/restore`)
}

export async function removeComment(reviewId) {
  await http.post(`/moderation/reports/${encodeURIComponent(reviewId)}/remove`)
}

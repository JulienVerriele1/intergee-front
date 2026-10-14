import { http } from './http'

/** Profile of the authenticated student (spec 010). */
export async function fetchMyProfile() {
  const { data } = await http.get('/students/me/profile')
  return data
}

/**
 * @param {{birthDate?: string, address: {street: string, postalCode: string, city: string}, sex: string,
 *   studyLevel: string, skills: string[], presentation: string}} profile the birth date is given once, then locked
 */
export async function updateMyProfile(profile) {
  const { data } = await http.put('/students/me/profile', profile)
  return data
}

/** JPEG or PNG, 5 MB at most: the server crops it to a square. */
export async function uploadMyPhoto(file) {
  const form = new FormData()
  form.append('photo', file)
  await http.put('/students/me/photo', form)
}

/**
 * The photo needs the access token, which an <img> cannot send: it is loaded as a blob.
 *
 * @returns {Promise<Blob>}
 */
export async function fetchStudentPhoto(studentId) {
  const { data } = await http.get(`/students/${encodeURIComponent(studentId)}/photo`, { responseType: 'blob' })
  return data
}

/** Profile of the authenticated beneficiary (spec 012): name, email, phone, address and presentation. */
export async function fetchMyBeneficiaryProfile() {
  const { data } = await http.get('/beneficiaries/me/profile')
  return data
}

/**
 * @param {{phone: string, address: {street: string, postalCode: string, city: string}, presentation: string}} profile
 */
export async function updateMyBeneficiaryProfile(profile) {
  const { data } = await http.put('/beneficiaries/me/profile', profile)
  return data
}

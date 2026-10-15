import { ROLES } from '@/constants/roles'
import { http } from './http'

const REGISTRATION_PATHS = {
  [ROLES.STUDENT]: '/registrations/students',
  [ROLES.BENEFICIARY]: '/registrations/beneficiaries',
  [ROLES.CAREGIVER]: '/registrations/caregivers',
}

/** @returns {Promise<{accessToken: string, tokenType: string, expiresIn: number}>} */
export async function login(email, password) {
  const { data } = await http.post('/auth/login', { email, password }, { isLoginRequest: true })
  return data
}

/** @returns {Promise<{id: string, role: string, verified?: boolean}>} */
export async function register(role, payload) {
  const path = REGISTRATION_PATHS[role]
  if (!path) {
    throw new Error(`Unknown role: ${role}`)
  }
  const { data } = await http.post(path, payload)
  return data
}

/** Sends a link to choose a new password, if an account has this address: the answer is always the same (spec 018). */
export async function requestPasswordReset(email) {
  await http.post('/auth/password-reset', { email }, { isLoginRequest: true })
}

/** Chooses a new password with the link received by e-mail (spec 018). INVALID_LINK when used or expired. */
export async function resetPassword(token, password) {
  await http.post('/auth/password-reset/confirm', { token, password }, { isLoginRequest: true })
}

/** Verifies the address with the link received by e-mail (spec 018). */
export async function confirmEmail(token) {
  await http.post('/auth/email-verification/confirm', { token }, { isLoginRequest: true })
}

/** @returns {Promise<{email: string, verified: boolean}>} the address of the authenticated user (spec 018) */
export async function fetchEmailVerification() {
  const { data } = await http.get('/auth/email-verification')
  return data
}

/** Sends again the link to verify the address of the authenticated user, 3 per hour at most (spec 018). */
export async function resendEmailVerification() {
  await http.post('/auth/email-verification')
}

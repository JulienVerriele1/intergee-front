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

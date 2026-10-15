import { http } from './http'

/** Channels the beneficiary or the caregiver accepts (spec 015, RG-6): `{ email, sms }`, both true by default. */
export async function fetchNotificationPreferences() {
  const { data } = await http.get('/notifications/me/preferences')
  return data
}

export async function updateNotificationPreferences(preferences) {
  const { data } = await http.put('/notifications/me/preferences', preferences)
  return data
}

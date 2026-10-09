// Business limits mirrored from spec 003, for immediate feedback: the backend stays the reference.
export const MIN_DURATION_MINUTES = 15
export const MAX_DURATION_MINUTES = 240
export const TITLE_MAX_LENGTH = 100
export const DESCRIPTION_MAX_LENGTH = 2000

export const DURATION_OPTIONS = Array.from(
  { length: (MAX_DURATION_MINUTES - MIN_DURATION_MINUTES) / 15 + 1 },
  (_, index) => MIN_DURATION_MINUTES + index * 15,
)

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const POSTAL_CODE_PATTERN = /^\d{5}$/
const REWARD_PATTERN = /^\d+([.,]\d{1,2})?$/

export function emptyMissionForm() {
  return {
    beneficiaryId: '',
    title: '',
    category: '',
    description: '',
    scheduledAt: '',
    durationMinutes: 60,
    street: '',
    postalCode: '',
    city: '',
    reward: '',
  }
}

/**
 * @param requiresBeneficiary true for a caregiver, who publishes on behalf of a managed beneficiary
 * @returns {Record<string, string>} error message by field name, empty when the form is valid
 */
export function validateMissionForm(form, { requiresBeneficiary, now = new Date() }) {
  const errors = {}
  if (requiresBeneficiary && !UUID_PATTERN.test(form.beneficiaryId.trim())) {
    errors.beneficiaryId = "Saisissez l'identifiant du bénéficiaire que vous accompagnez."
  }
  if (!form.title.trim()) {
    errors.title = 'Le titre est obligatoire.'
  } else if (form.title.trim().length > TITLE_MAX_LENGTH) {
    errors.title = `Le titre ne doit pas dépasser ${TITLE_MAX_LENGTH} caractères.`
  }
  if (!form.category) {
    errors.category = 'Choisissez une catégorie.'
  }
  if (!form.description.trim()) {
    errors.description = 'La description est obligatoire.'
  } else if (form.description.trim().length > DESCRIPTION_MAX_LENGTH) {
    errors.description = `La description ne doit pas dépasser ${DESCRIPTION_MAX_LENGTH} caractères.`
  }
  if (!form.scheduledAt) {
    errors.scheduledAt = 'Indiquez la date et l’heure de la mission.'
  } else if (new Date(form.scheduledAt) <= now) {
    errors.scheduledAt = 'La mission doit avoir lieu dans le futur.'
  }
  const duration = Number(form.durationMinutes)
  if (!Number.isInteger(duration) || duration < MIN_DURATION_MINUTES || duration > MAX_DURATION_MINUTES) {
    errors.durationMinutes = 'La durée doit être comprise entre 15 minutes et 4 heures.'
  }
  if (!form.street.trim()) {
    errors.street = 'La rue est obligatoire.'
  }
  if (!POSTAL_CODE_PATTERN.test(form.postalCode.trim())) {
    errors.postalCode = 'Le code postal doit contenir 5 chiffres.'
  }
  if (!form.city.trim()) {
    errors.city = 'La ville est obligatoire.'
  }
  const reward = String(form.reward).trim()
  if (!REWARD_PATTERN.test(reward) || parseReward(reward) <= 0) {
    errors.reward = 'Indiquez un montant positif en euros, avec 2 décimales au plus.'
  }
  return errors
}

/**
 * @param location coordinates confirmed by the user after geocoding
 */
export function toPublishPayload(form, location, { requiresBeneficiary }) {
  return {
    ...(requiresBeneficiary && { beneficiaryId: form.beneficiaryId.trim() }),
    title: form.title.trim(),
    category: form.category,
    description: form.description.trim(),
    // datetime-local is in the user's time zone: sent as an ISO instant
    scheduledAt: new Date(form.scheduledAt).toISOString(),
    durationMinutes: Number(form.durationMinutes),
    location: {
      street: form.street.trim(),
      postalCode: form.postalCode.trim(),
      city: form.city.trim(),
      latitude: location.latitude,
      longitude: location.longitude,
    },
    reward: parseReward(String(form.reward).trim()),
  }
}

/** Value for the min attribute of a datetime-local input, in local time. */
export function toDateTimeLocalValue(date) {
  const offsetMs = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16)
}

function parseReward(value) {
  return Number(value.replace(',', '.'))
}

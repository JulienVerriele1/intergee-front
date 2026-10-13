// Rules of spec 001 mirrored for immediate feedback: the backend stays the reference.
export const PASSWORD_MIN_LENGTH = 12
export const RADIUS_OPTIONS = [2, 5, 10, 15, 20, 30, 50]

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const POSTAL_CODE_PATTERN = /^\d{5}$/
// French numbers, with or without spaces, dots or dashes: 06 12 34 56 78 or +33 6 12 34 56 78
const PHONE_PATTERN = /^(0[1-9]\d{8}|\+33[1-9]\d{8})$/

export function emptyStudentForm() {
  return { firstName: '', lastName: '', email: '', password: '', school: '', postalCode: '', city: '', radiusKm: 10 }
}

export function emptyBeneficiaryForm() {
  return { firstName: '', lastName: '', email: '', password: '', phone: '', street: '', postalCode: '', city: '' }
}

function required(value) {
  return typeof value === 'string' ? value.trim().length > 0 : value !== null && value !== undefined
}

function validateAccount(form) {
  const errors = {}
  if (!required(form.firstName)) errors.firstName = 'Saisissez votre prénom.'
  if (!required(form.lastName)) errors.lastName = 'Saisissez votre nom.'
  if (!EMAIL_PATTERN.test(form.email.trim())) errors.email = 'Saisissez une adresse e-mail valide, par exemple nom@exemple.fr.'
  if (form.password.length < PASSWORD_MIN_LENGTH) {
    errors.password = `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.`
  }
  if (!POSTAL_CODE_PATTERN.test(form.postalCode.trim())) errors.postalCode = 'Le code postal contient 5 chiffres.'
  if (!required(form.city)) errors.city = 'Saisissez la ville.'
  return errors
}

/** @returns {Record<string, string>} errors by field, empty when valid */
export function validateStudent(form) {
  const errors = validateAccount(form)
  if (!required(form.school)) errors.school = 'Saisissez votre établissement d’études.'
  return errors
}

/** @returns {Record<string, string>} errors by field, empty when valid */
export function validateBeneficiary(form) {
  const errors = validateAccount(form)
  if (!PHONE_PATTERN.test(form.phone.replace(/[\s.-]/g, ''))) {
    errors.phone = 'Saisissez un numéro français, par exemple 06 12 34 56 78.'
  }
  if (!required(form.street)) errors.street = 'Saisissez le numéro et la rue.'
  return errors
}

/**
 * @param center coordinates of the city, geocoded by the client (spec 004)
 */
export function toStudentPayload(form, center) {
  return {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    email: form.email.trim(),
    password: form.password,
    school: form.school.trim(),
    postalCode: form.postalCode.trim(),
    city: form.city.trim(),
    radiusKm: Number(form.radiusKm),
    latitude: center.latitude,
    longitude: center.longitude,
  }
}

export function toBeneficiaryPayload(form) {
  return {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    email: form.email.trim(),
    password: form.password,
    phone: form.phone.trim(),
    address: { street: form.street.trim(), postalCode: form.postalCode.trim(), city: form.city.trim() },
  }
}

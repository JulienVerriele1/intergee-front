/** Presentation of a student or a beneficiary (spec 012, RG-1): 300 to 1 000 characters, spaces around not counted. */
export const PRESENTATION_MIN = 300
export const PRESENTATION_MAX = 1000

/** Characters rather than UTF-16 units, as the server counts them: an emoji is one character. */
export function presentationLength(text) {
  return [...(text ?? '').trim()].length
}

/** @returns {string} the error to show, or '' when the presentation is valid */
export function presentationError(text) {
  const length = presentationLength(text)
  if (length === 0) {
    return 'Rédigez votre présentation.'
  }
  if (length < PRESENTATION_MIN) {
    return `Votre présentation doit faire au moins ${PRESENTATION_MIN} caractères : il en manque ${PRESENTATION_MIN - length}.`
  }
  if (length > PRESENTATION_MAX) {
    return `Votre présentation ne doit pas dépasser 1 000 caractères : retirez-en ${length - PRESENTATION_MAX}.`
  }
  return ''
}

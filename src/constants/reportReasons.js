/** Why the reviewed person reports a comment (spec 014, RG-5). */
export const REPORT_REASONS = Object.freeze([
  { value: 'ABUSIVE', label: 'Propos injurieux ou discriminants' },
  { value: 'HEALTH_INFORMATION', label: 'Information sur la santé' },
  { value: 'PERSONAL_INFORMATION', label: 'Information personnelle (nom, adresse, téléphone)' },
  { value: 'OTHER', label: 'Autre raison' },
])

export function reportReasonLabel(value) {
  return REPORT_REASONS.find((reason) => reason.value === value)?.label ?? value
}

export const ROLES = Object.freeze({
  STUDENT: 'STUDENT',
  BENEFICIARY: 'BENEFICIARY',
  CAREGIVER: 'CAREGIVER',
  /** Geen team, moderates the comments of the reviews (spec 014): never registered through the application */
  MODERATOR: 'MODERATOR',
})

export const ALL_ROLES = Object.freeze(Object.values(ROLES))

/** Roles allowed to publish a mission (spec 003, RG-1). */
export const PUBLISHER_ROLES = Object.freeze([ROLES.BENEFICIARY, ROLES.CAREGIVER])

export const ROLE_LABELS = Object.freeze({
  [ROLES.STUDENT]: 'Étudiant',
  [ROLES.BENEFICIARY]: 'Bénéficiaire',
  [ROLES.CAREGIVER]: 'Aidant',
  [ROLES.MODERATOR]: 'Modérateur',
})

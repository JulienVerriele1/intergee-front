// Explains a refused action on a mission (specs 005 to 009), a review (spec 007) or a profile (spec 010) from the business code of the API error
const MESSAGES = {
  STUDENT_NOT_VERIFIED: 'Votre compte étudiant doit être vérifié avant de pouvoir postuler.',
  MISSION_NOT_FOUND: "Cette mission n'existe plus.",
  MISSION_CLOSED: "Cette mission n'accepte plus de changement : elle a commencé ou un étudiant a déjà été choisi.",
  MISSION_FULL: 'Cette mission a déjà reçu le nombre maximum de candidatures.',
  ALREADY_APPLIED: 'Vous avez déjà postulé à cette mission.',
  OVERLAPPING_APPLICATION: 'Cette mission a lieu en même temps qu’une autre mission à laquelle vous avez postulé.',
  CONCURRENT_APPLICATION: 'La mission vient d’être modifiée. Réessayez.',
  APPLICATION_NOT_FOUND: "Cette candidature n'existe plus.",
  NOT_YOUR_MISSION: "Cette mission ne vous concerne pas.",
  MISSION_ALREADY_ASSIGNED: 'Un étudiant a déjà été choisi pour cette mission.',
  ASSIGNMENT_NOT_FOUND: "Aucun étudiant n'a encore été choisi pour cette mission.",
  MISSION_NOT_ASSIGNED: "Cette mission n'a pas encore d'étudiant retenu.",
  MISSION_NOT_OVER: 'La mission n’est pas encore terminée : vous pourrez la confirmer après son horaire de fin.',
  MISSION_ALREADY_COMPLETED: 'Cette mission a déjà été confirmée.',
  NOT_A_PARTICIPANT: "Seuls l'étudiant retenu et le bénéficiaire peuvent évaluer cette mission.",
  WAGE_BELOW_MINIMUM: 'Le salaire horaire net est inférieur au minimum légal (SMIC net et congés payés).',
  MISSION_NOT_COMPLETED: "La mission doit d'abord être confirmée comme terminée.",
  REVIEW_PERIOD_OVER: 'Le délai de 14 jours pour évaluer cette mission est dépassé.',
  ALREADY_REVIEWED: 'Cette mission a déjà été évaluée.',
  REVIEWS_NOT_VISIBLE: "Ces avis ne vous sont pas accessibles.",
  USER_NOT_FOUND: "Cette personne n'existe plus.",
  PROFILE_INCOMPLETE: 'Complétez votre profil (photo, compétences, date de naissance, adresse, niveau d’études et présentation) dans « Mon profil » avant de postuler.',
  PROFILE_NOT_FOUND: "Votre profil étudiant est introuvable. Contactez le support.",
  BIRTH_DATE_LOCKED: 'Votre date de naissance est déjà enregistrée et ne peut plus être modifiée.',
  UNDERAGE: 'Il faut avoir au moins 18 ans pour proposer son aide sur Geen.',
  UNSUPPORTED_PHOTO_FORMAT: 'La photo doit être au format JPEG ou PNG.',
  PHOTO_TOO_LARGE: 'La photo ne doit pas dépasser 5 Mo.',
  UNREADABLE_PHOTO: 'Ce fichier ne peut pas être lu comme une image.',
  NOT_YOUR_REVIEW: 'Seule la personne notée peut signaler ce commentaire.',
  NO_COMMENT_TO_REPORT: 'Ce commentaire n’est plus visible : il n’y a rien à signaler.',
  ALREADY_REPORTED: 'Ce commentaire a déjà été signalé ou vérifié par l’équipe Geen.',
  NOT_PENDING: 'Une décision a déjà été prise sur ce commentaire.',
}

export function missionErrorMessage(error) {
  return MESSAGES[error?.code] ?? error?.message ?? 'Une erreur est survenue. Réessayez plus tard.'
}

// Explains a refused action on a mission (specs 005 to 009) or a review (spec 007) from the business code of the API error
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
  MISSION_NOT_COMPLETED: "La mission doit d'abord être confirmée comme terminée.",
  REVIEW_PERIOD_OVER: 'Le délai de 14 jours pour évaluer cette mission est dépassé.',
  ALREADY_REVIEWED: 'Cette mission a déjà été évaluée.',
  REVIEWS_NOT_VISIBLE: "Ces avis ne vous sont pas accessibles.",
  USER_NOT_FOUND: "Cette personne n'existe plus.",
}

export function missionErrorMessage(error) {
  return MESSAGES[error?.code] ?? error?.message ?? 'Une erreur est survenue. Réessayez plus tard.'
}

/**
 * Closed lists of the student profile (spec 010), mirrored from the API: the backend stays the reference.
 * Never a care act nor health data (spec 001, RG-7).
 */
export const SKILL_FAMILIES = Object.freeze([
  {
    value: 'GROCERIES',
    label: 'Courses et quotidien',
    skills: [
      { value: 'GROCERY_SHOPPING', label: 'Faire les courses et porter les sacs' },
      { value: 'OUTING_ESCORT', label: 'Accompagner à un rendez-vous ou une sortie, à pied ou en transports en commun' },
      { value: 'SIMPLE_MEAL', label: 'Préparer un repas simple' },
      { value: 'LIGHT_HOUSEKEEPING', label: 'Aider au rangement et aux petites tâches ménagères' },
    ],
  },
  {
    value: 'COMPANIONSHIP',
    label: 'Compagnie',
    skills: [
      { value: 'CONVERSATION', label: 'Conversation et compagnie' },
      { value: 'READING_ALOUD', label: 'Lecture à voix haute' },
      { value: 'BOARD_GAMES', label: 'Jeux de société et loisirs' },
      { value: 'WALK', label: 'Promenade, y compris en poussant un fauteuil roulant' },
    ],
  },
  {
    value: 'IT_HELP',
    label: 'Aide numérique',
    skills: [
      { value: 'SMARTPHONE_TABLET', label: 'Utiliser un smartphone ou une tablette' },
      { value: 'COMPUTER_INTERNET', label: 'Utiliser un ordinateur et internet' },
      { value: 'VIDEO_CALLS', label: 'Appels vidéo avec les proches' },
      { value: 'ONLINE_PROCEDURES', label: 'Démarches administratives en ligne' },
    ],
  },
  {
    value: 'GARDENING',
    label: 'Maison et jardin',
    skills: [
      { value: 'GARDENING', label: 'Petits travaux de jardinage' },
      { value: 'SMALL_REPAIRS', label: 'Petit bricolage (ampoule, montage de meuble…)' },
    ],
  },
  {
    value: 'ACCESSIBILITY',
    label: 'Accessibilité',
    skills: [
      { value: 'FRENCH_SIGN_LANGUAGE', label: 'Langue des signes française (LSF)' },
      { value: 'MAIL_READING', label: 'Lecture et tri du courrier' },
    ],
  },
])

export const STUDY_LEVELS = Object.freeze([
  { value: 'BAC', label: 'Baccalauréat (en préparation ou obtenu)' },
  { value: 'BAC_1', label: 'Bac +1' },
  { value: 'BAC_2', label: 'Bac +2' },
  { value: 'BAC_3', label: 'Bac +3' },
  { value: 'BAC_4', label: 'Bac +4' },
  { value: 'BAC_5_AND_MORE', label: 'Bac +5 et plus' },
  { value: 'OTHER', label: 'Autre' },
])

/** Optional (spec 010, Q8) */
export const SEXES = Object.freeze([
  { value: 'NOT_SPECIFIED', label: 'Je ne souhaite pas le préciser' },
  { value: 'FEMALE', label: 'Femme' },
  { value: 'MALE', label: 'Homme' },
])

const SKILL_LABELS = Object.fromEntries(SKILL_FAMILIES.flatMap((family) => family.skills).map((skill) => [skill.value, skill.label]))

export function skillLabel(value) {
  return SKILL_LABELS[value] ?? value
}

export function studyLevelLabel(value) {
  return STUDY_LEVELS.find((level) => level.value === value)?.label ?? value
}

export const PHOTO_MEDIA_TYPES = Object.freeze(['image/jpeg', 'image/png'])
export const PHOTO_MAX_BYTES = 5 * 1024 * 1024

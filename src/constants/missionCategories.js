/** Factual categories only: the need is described by the task, never by the person's health (spec 003). */
export const MISSION_CATEGORIES = Object.freeze([
  { value: 'GROCERIES', label: 'Aide aux courses' },
  { value: 'COMPANIONSHIP', label: 'Compagnie / discussion' },
  { value: 'IT_HELP', label: 'Aide informatique de base' },
  { value: 'GARDENING', label: 'Petits travaux de jardinage' },
  { value: 'ACCESSIBILITY', label: 'Accessibilité (langue des signes, lecture du courrier)' },
])

export function categoryLabel(value) {
  return MISSION_CATEGORIES.find((category) => category.value === value)?.label ?? value
}

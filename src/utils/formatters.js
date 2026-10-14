const dateTimeFormatter = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'full', timeStyle: 'short' })
const euroFormatter = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })

export function formatDateTime(isoDate) {
  return dateTimeFormatter.format(new Date(isoDate))
}

export function formatEuros(amount) {
  return euroFormatter.format(Number(amount))
}

export function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) {
    return `${rest} min`
  }
  return rest === 0 ? `${hours} h` : `${hours} h ${String(rest).padStart(2, '0')}`
}

const monthFormatter = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' })

/** "2026-11" → "novembre 2026" */
export function formatMonth(yearMonth) {
  const [year, month] = yearMonth.split('-').map(Number)
  return monthFormatter.format(new Date(year, month - 1, 1))
}

/** Hourly net wage and the net wage of the mission (spec 013, RG-4): "12,00 € de l'heure · 18,00 € pour la mission" */
export function formatWage(mission) {
  return `${formatEuros(mission.hourlyNetWage)} de l’heure · ${formatEuros(mission.netWage)} pour la mission`
}

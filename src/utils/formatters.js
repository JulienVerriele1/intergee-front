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

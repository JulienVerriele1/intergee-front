/**
 * Pages to show in a pagination: the first and the last, the current one and its neighbours, and a gap ("…") where
 * pages are left out. A gap of a single page shows that page instead, since "…" would take as much room.
 *
 * @param {number} page current page, from 0
 * @param {number} totalPages
 * @returns {(number | 'gap')[]} pages from 0, and 'gap' markers
 */
export function pageWindow(page, totalPages) {
  const shown = new Set([0, totalPages - 1, page - 1, page, page + 1].filter((index) => index >= 0 && index < totalPages))
  const sorted = [...shown].sort((first, second) => first - second)
  const items = []
  sorted.forEach((index, position) => {
    const previous = sorted[position - 1]
    if (previous !== undefined && index - previous === 2) {
      items.push(previous + 1)
    } else if (previous !== undefined && index - previous > 2) {
      items.push('gap')
    }
    items.push(index)
  })
  return items
}

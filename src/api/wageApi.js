import { http } from './http'

/**
 * What a mission costs its employer, an estimate only (spec 013, RG-3), with the minimum hourly net wage in force.
 *
 * @returns {Promise<{minimumHourlyNetWage: number, netWage: number, contributions: number, totalCost: number,
 *   taxCredit: number, costAfterTaxCredit: number, belowMinimum: boolean, simulatorUrl: string}>}
 */
export async function estimateCost({ hourlyNetWage, durationMinutes }) {
  const { data } = await http.get('/wages/estimate', { params: { hourlyNetWage, durationMinutes } })
  return data
}

/** CESU declarations to make: completed and undeclared missions, by student and by month (spec 013, RG-7). */
export async function fetchPendingDeclarations() {
  const { data } = await http.get('/declarations/pending')
  return data
}

export async function markDeclared(missionIds) {
  await http.post('/declarations', { missionIds })
}

/** Undoes a mark, after a wrong click (spec 013, RG-8). */
export async function unmarkDeclared(missionIds) {
  await http.delete('/declarations', { data: { missionIds } })
}

/** The official site where the employer declares the student */
export const CESU_URL = 'https://www.cesu.urssaf.fr'

import axios from 'axios'

// Géoplateforme (IGN), successor of the API Adresse data.gouv.fr. Plain axios: never send the JWT there.
const GEOCODING_URL = 'https://data.geopf.fr/geocodage/search'

const ADDRESS_TYPES = new Set(['housenumber', 'street'])

/**
 * Addresses matching what is being typed, for the address fields (autocompletion of the Géoplateforme).
 *
 * @returns {Promise<{label: string, street: string, postalCode: string, city: string, latitude: number, longitude: number}[]>}
 */
export async function suggestAddresses(text, { limit = 5 } = {}) {
  const { data } = await axios.get(GEOCODING_URL, {
    params: { q: text, autocomplete: 1, index: 'address', limit },
    timeout: 5_000,
  })
  return (data?.features ?? [])
    .filter((feature) => ADDRESS_TYPES.has(feature.properties.type))
    .map((feature) => {
      const [longitude, latitude] = feature.geometry.coordinates
      const { label, name, postcode, city } = feature.properties
      return { label, street: name, postalCode: postcode, city, latitude, longitude }
    })
}

/**
 * Center of a city, for the intervention area of a student (spec 004): the server only checks the bounds.
 *
 * @returns {Promise<{label: string, latitude: number, longitude: number} | null>} null when no city matches
 */
export async function geocodeCity({ postalCode, city }) {
  const { data } = await axios.get(GEOCODING_URL, {
    params: { q: city, postcode: postalCode, type: 'municipality', limit: 1 },
    timeout: 5_000,
  })
  const feature = data?.features?.[0]
  if (!feature) {
    return null
  }
  const [longitude, latitude] = feature.geometry.coordinates
  return { label: feature.properties.label, latitude, longitude }
}

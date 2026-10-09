import axios from 'axios'

// Géoplateforme (IGN), successor of the API Adresse data.gouv.fr. Plain axios: never send the JWT there.
const GEOCODING_URL = 'https://data.geopf.fr/geocodage/search'

/**
 * @returns {Promise<{label: string, latitude: number, longitude: number} | null>} null when no address matches
 */
export async function geocodeAddress({ street, postalCode, city }) {
  const { data } = await axios.get(GEOCODING_URL, {
    params: { q: `${street} ${postalCode} ${city}`, postcode: postalCode, limit: 1 },
    timeout: 5_000,
  })
  const feature = data?.features?.[0]
  if (!feature) {
    return null
  }
  const [longitude, latitude] = feature.geometry.coordinates
  return { label: feature.properties.label, latitude, longitude }
}

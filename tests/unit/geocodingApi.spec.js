import { afterEach, describe, expect, it, vi } from 'vitest'
import axios from 'axios'
import * as geocodingApi from '@/api/geocodingApi'

const LENS = { label: '12 Rue de Lens 59000 Lille', street: '12 Rue de Lens', postalCode: '59000', city: 'Lille', latitude: 50.625, longitude: 3.063 }

describe('suggestAddresses', () => {
  afterEach(() => vi.restoreAllMocks())

  it('keeps the street addresses of the Géoplateforme with their coordinates', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({
      data: {
        features: [
          { geometry: { coordinates: [3.063, 50.625] }, properties: { type: 'housenumber', label: LENS.label, name: '12 Rue de Lens', postcode: '59000', city: 'Lille' } },
          { geometry: { coordinates: [3.06, 50.63] }, properties: { type: 'municipality', label: 'Lille', name: 'Lille', postcode: '59000', city: 'Lille' } },
        ],
      },
    })

    const suggestions = await geocodingApi.suggestAddresses('12 rue de lens')

    expect(axios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
      params: { q: '12 rue de lens', autocomplete: 1, index: 'address', limit: 5 },
    }))
    expect(suggestions).toEqual([LENS])
  })
})


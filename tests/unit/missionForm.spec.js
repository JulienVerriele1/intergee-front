import { describe, expect, it } from 'vitest'
import { DURATION_OPTIONS, emptyMissionForm, toPublishPayload, validateMissionForm } from '@/missions/missionForm'

const NOW = new Date('2026-10-09T10:00:00Z')

function validForm(overrides = {}) {
  return {
    ...emptyMissionForm(),
    title: '  Aide pour faire les courses ',
    category: 'GROCERIES',
    description: 'Porter les sacs',
    scheduledAt: '2026-10-17T09:00',
    durationMinutes: 90,
    street: '12 rue de Lens',
    postalCode: '59000',
    city: 'Lille',
    reward: '20,5',
    ...overrides,
  }
}

describe('validateMissionForm', () => {
  it('accepts a valid form', () => {
    expect(validateMissionForm(validForm(), { requiresBeneficiary: false, now: NOW })).toEqual({})
  })

  it('reports every missing field', () => {
    const errors = validateMissionForm(emptyMissionForm(), { requiresBeneficiary: true, now: NOW })

    expect(Object.keys(errors).sort()).toEqual(
      ['beneficiaryId', 'category', 'city', 'description', 'postalCode', 'reward', 'scheduledAt', 'street', 'title'],
    )
  })

  it('refuses a mission in the past', () => {
    const errors = validateMissionForm(validForm({ scheduledAt: '2026-10-01T09:00' }), { requiresBeneficiary: false, now: NOW })

    expect(errors.scheduledAt).toBe('La mission doit avoir lieu dans le futur.')
  })

  it.each([10, 245, 300])('refuses a duration of %s minutes', (durationMinutes) => {
    expect(validateMissionForm(validForm({ durationMinutes }), { requiresBeneficiary: false, now: NOW }))
      .toHaveProperty('durationMinutes')
  })

  it.each(['0', '-5', '12.345', 'abc'])('refuses a reward of %s', (reward) => {
    expect(validateMissionForm(validForm({ reward }), { requiresBeneficiary: false, now: NOW })).toHaveProperty('reward')
  })

  it('requires a valid beneficiary id from a caregiver only', () => {
    expect(validateMissionForm(validForm({ beneficiaryId: 'nope' }), { requiresBeneficiary: true, now: NOW }))
      .toHaveProperty('beneficiaryId')
    expect(validateMissionForm(validForm(), { requiresBeneficiary: false, now: NOW })).not.toHaveProperty('beneficiaryId')
  })
})

describe('toPublishPayload', () => {
  const location = { label: '12 Rue de Lens 59000 Lille', latitude: 50.625, longitude: 3.063 }

  it('builds the request expected by POST /missions', () => {
    const payload = toPublishPayload(validForm(), location, { requiresBeneficiary: false })

    expect(payload).toEqual({
      title: 'Aide pour faire les courses',
      category: 'GROCERIES',
      description: 'Porter les sacs',
      scheduledAt: new Date('2026-10-17T09:00').toISOString(),
      durationMinutes: 90,
      location: { street: '12 rue de Lens', postalCode: '59000', city: 'Lille', latitude: 50.625, longitude: 3.063 },
      reward: 20.5,
    })
  })

  it('adds the beneficiary id for a caregiver', () => {
    const beneficiaryId = '0b9c7e4a-1f2d-4c3b-8a5e-6d7f8091a2b3'

    expect(toPublishPayload(validForm({ beneficiaryId }), location, { requiresBeneficiary: true }))
      .toHaveProperty('beneficiaryId', beneficiaryId)
  })
})

describe('DURATION_OPTIONS', () => {
  it('goes from 15 minutes to 4 hours by steps of 15 minutes', () => {
    expect(DURATION_OPTIONS[0]).toBe(15)
    expect(DURATION_OPTIONS.at(-1)).toBe(240)
    expect(DURATION_OPTIONS).toHaveLength(16)
  })
})

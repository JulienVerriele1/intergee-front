import { describe, expect, it } from 'vitest'
import { decodeJwt, isExpired } from '@/utils/jwt'
import { fakeJwt } from './tokens'

describe('decodeJwt', () => {
  it('reads the claims, including non-ASCII characters', () => {
    const claims = decodeJwt(fakeJwt({ sub: 'id', role: 'CAREGIVER', exp: 1, name: 'Léa' }))

    expect(claims).toEqual({ sub: 'id', role: 'CAREGIVER', exp: 1, name: 'Léa' })
  })

  it.each([null, undefined, '', 'not-a-jwt', 'a.%%%.c'])('returns null for a malformed token (%s)', (token) => {
    expect(decodeJwt(token)).toBeNull()
  })

  it('returns null when a mandatory claim is missing', () => {
    expect(decodeJwt(fakeJwt({ sub: 'id', exp: 1 }))).toBeNull()
  })
})

describe('isExpired', () => {
  it('compares the exp claim (seconds) with the current time (milliseconds)', () => {
    expect(isExpired({ exp: 100 }, 100_000)).toBe(true)
    expect(isExpired({ exp: 100 }, 99_999)).toBe(false)
  })
})

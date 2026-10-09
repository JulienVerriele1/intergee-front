import { describe, expect, it } from 'vitest'
import { resolveNavigation } from '@/router/guards'

const guest = { isAuthenticated: false, role: null }
const student = { isAuthenticated: true, role: 'STUDENT' }

function route(meta, fullPath = '/target') {
  return { meta, fullPath }
}

describe('resolveNavigation', () => {
  it('sends a guest to the login page, remembering where they wanted to go', () => {
    expect(resolveNavigation(route({ requiresAuth: true }, '/missions?page=2'), guest))
      .toEqual({ name: 'login', query: { redirect: '/missions?page=2' } })
  })

  it('lets an authenticated user with an allowed role through', () => {
    expect(resolveNavigation(route({ requiresAuth: true, roles: ['STUDENT'] }), student)).toBe(true)
  })

  it('sends a user without an allowed role to the forbidden page', () => {
    expect(resolveNavigation(route({ requiresAuth: true, roles: ['BENEFICIARY', 'CAREGIVER'] }), student))
      .toEqual({ name: 'forbidden' })
  })

  it('sends an authenticated user away from the login page', () => {
    expect(resolveNavigation(route({ guestOnly: true }), student)).toEqual({ name: 'dashboard' })
  })

  it('lets anybody reach a public page', () => {
    expect(resolveNavigation(route({}), guest)).toBe(true)
  })
})

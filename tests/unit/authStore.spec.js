import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import * as authApi from '@/api/authApi'
import { validToken } from './tokens'

vi.mock('@/api/authApi')

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.resetAllMocks()
  })

  it('logs in, exposes the role from the token and persists it', async () => {
    const token = validToken({ role: 'BENEFICIARY' })
    authApi.login.mockResolvedValue({ accessToken: token, tokenType: 'Bearer', expiresIn: 3600 })
    const auth = useAuthStore()

    await auth.login('jeanne@mail.fr', 'correct-horse-battery')

    expect(authApi.login).toHaveBeenCalledWith('jeanne@mail.fr', 'correct-horse-battery')
    expect(auth.isAuthenticated).toBe(true)
    expect(auth.role).toBe('BENEFICIARY')
    expect(auth.hasRole('BENEFICIARY', 'CAREGIVER')).toBe(true)
    expect(localStorage.getItem('intergee.accessToken')).toBe(token)
  })

  it('stays logged out when the login fails', async () => {
    authApi.login.mockRejectedValue(new Error('401'))
    const auth = useAuthStore()

    await expect(auth.login('lea@univ.fr', 'wrong')).rejects.toThrow()

    expect(auth.isAuthenticated).toBe(false)
    expect(localStorage.getItem('intergee.accessToken')).toBeNull()
  })

  it('registers with the endpoint of the role then logs the new user in', async () => {
    authApi.register.mockResolvedValue({ id: 'new-id', role: 'STUDENT', verified: false })
    authApi.login.mockResolvedValue({ accessToken: validToken() })
    const auth = useAuthStore()
    const payload = { email: 'lea@univ.fr', password: 'correct-horse-battery' }

    const registered = await auth.register('STUDENT', payload)

    expect(authApi.register).toHaveBeenCalledWith('STUDENT', payload)
    expect(registered.verified).toBe(false)
    expect(auth.isAuthenticated).toBe(true)
  })

  it('restores a valid session from a previous visit', () => {
    localStorage.setItem('intergee.accessToken', validToken({ role: 'CAREGIVER' }))
    const auth = useAuthStore()

    auth.restoreSession()

    expect(auth.role).toBe('CAREGIVER')
  })

  it('discards an expired session from a previous visit', () => {
    localStorage.setItem('intergee.accessToken', validToken({ expiresInSeconds: -1 }))
    const auth = useAuthStore()

    auth.restoreSession()

    expect(auth.isAuthenticated).toBe(false)
    expect(localStorage.getItem('intergee.accessToken')).toBeNull()
  })

  it('logs out automatically when the token expires', async () => {
    vi.useFakeTimers()
    authApi.login.mockResolvedValue({ accessToken: validToken({ expiresInSeconds: 60 }) })
    const auth = useAuthStore()
    await auth.login('lea@univ.fr', 'correct-horse-battery')

    vi.advanceTimersByTime(60_000)

    expect(auth.isAuthenticated).toBe(false)
  })
})

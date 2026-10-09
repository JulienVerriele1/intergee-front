import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { http } from '@/api/http'
import { useAuthStore } from '@/stores/auth'
import { validToken } from './tokens'

/** Replaces the network: answers with the given status and records the request. */
function stubAdapter(status, data = {}) {
  const calls = []
  http.defaults.adapter = async (config) => {
    calls.push(config)
    const response = { status, data, headers: {}, config, statusText: '' }
    if (status >= 400) {
      throw Object.assign(new Error(`HTTP ${status}`), { config, response, isAxiosError: true })
    }
    return response
  }
  return calls
}

describe('http client', () => {
  let auth

  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    localStorage.setItem('intergee.accessToken', validToken())
    auth = useAuthStore()
    auth.restoreSession()
  })

  it('sends the JWT of the store in the Authorization header', async () => {
    const calls = stubAdapter(200)

    await http.get('/missions/open')

    expect(calls[0].headers.Authorization).toBe(`Bearer ${auth.token}`)
  })

  it('logs out on a 401 from the API', async () => {
    stubAdapter(401)

    await expect(http.get('/missions/open')).rejects.toMatchObject({ status: 401 })

    expect(auth.isAuthenticated).toBe(false)
  })

  it('keeps the session on a 401 from the login request (wrong credentials)', async () => {
    stubAdapter(401)

    await expect(http.post('/auth/login', {}, { isLoginRequest: true })).rejects.toMatchObject({ status: 401 })

    expect(auth.isAuthenticated).toBe(true)
  })

  it('exposes the problem detail of a validation error', async () => {
    stubAdapter(400, { status: 400, detail: 'Duration must be between 15 and 240 minutes' })

    await expect(http.post('/missions', {})).rejects.toMatchObject({
      status: 400,
      message: 'Duration must be between 15 and 240 minutes',
    })
  })

  it('exposes the business code of a conflict', async () => {
    stubAdapter(409, { status: 409, detail: 'Mission is full', code: 'MISSION_FULL' })

    await expect(http.post('/missions/42/applications')).rejects.toMatchObject({ status: 409, code: 'MISSION_FULL' })
  })

  it('reports an unreachable server', async () => {
    http.defaults.adapter = async (config) => {
      throw Object.assign(new Error('Network Error'), { config, isAxiosError: true })
    }

    await expect(http.get('/missions/open')).rejects.toMatchObject({ status: 0, isNetworkError: true })
  })
})

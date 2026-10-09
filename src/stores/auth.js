import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import * as authApi from '@/api/authApi'
import { decodeJwt, isExpired } from '@/utils/jwt'

const TOKEN_STORAGE_KEY = 'intergee.accessToken'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(null)
  let expiryTimer = null

  const claims = computed(() => decodeJwt(token.value))
  const isAuthenticated = computed(() => claims.value !== null)
  const role = computed(() => claims.value?.role ?? null)
  const userId = computed(() => claims.value?.sub ?? null)

  function hasRole(...roles) {
    return roles.includes(role.value)
  }

  async function login(email, password) {
    const { accessToken } = await authApi.login(email, password)
    setSession(accessToken)
  }

  /**
   * Every self-registered account has credentials, so the user is logged in right after registration.
   */
  async function register(role, payload) {
    const registeredUser = await authApi.register(role, payload)
    await login(payload.email, payload.password)
    return registeredUser
  }

  function logout() {
    clearTimeout(expiryTimer)
    token.value = null
    writeStorage(null)
  }

  /** Restores the token saved by a previous visit, unless it is malformed or expired. */
  function restoreSession() {
    const storedToken = readStorage()
    const storedClaims = decodeJwt(storedToken)
    if (storedClaims && !isExpired(storedClaims)) {
      setSession(storedToken)
    } else {
      writeStorage(null)
    }
  }

  function setSession(accessToken) {
    const tokenClaims = decodeJwt(accessToken)
    if (!tokenClaims) {
      throw new Error('Malformed access token')
    }
    token.value = accessToken
    writeStorage(accessToken)
    scheduleLogoutAt(tokenClaims.exp * 1000)
  }

  function scheduleLogoutAt(expiresAtMs) {
    clearTimeout(expiryTimer)
    expiryTimer = setTimeout(logout, Math.max(expiresAtMs - Date.now(), 0))
  }

  return { token, role, userId, isAuthenticated, hasRole, login, register, logout, restoreSession }
})

// localStorage can be unavailable (private browsing, quotas): the session then simply lasts for the tab
function readStorage() {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

function writeStorage(value) {
  try {
    if (value === null) {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
    } else {
      localStorage.setItem(TOKEN_STORAGE_KEY, value)
    }
  } catch {
    // Ignored on purpose, see readStorage
  }
}

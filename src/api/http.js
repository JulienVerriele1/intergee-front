import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { toApiError } from './apiError'

/**
 * Axios instance for the Intergee API only: the JWT must never be sent to third-party services.
 */
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 10_000,
  headers: { Accept: 'application/json' },
})

http.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    // An expired or revoked token: drop the session, App.vue then redirects to the login page.
    // A 401 on the login request itself only means wrong credentials.
    if (error.response?.status === 401 && !error.config?.isLoginRequest) {
      useAuthStore().logout()
    }
    return Promise.reject(toApiError(error))
  },
)

import { ref } from 'vue'
import { fetchEmailVerification } from '@/api/authApi'

// Shared by the banner and the page opened by the link: verifying the address hides the banner at once (spec 018)
const verification = ref(null) // { email, verified } once known

export function useEmailVerification() {
  async function refresh() {
    try {
      verification.value = await fetchEmailVerification()
    } catch {
      // Only a hint: the API refuses anyway what needs a verified address
      verification.value = null
    }
  }

  function forget() {
    verification.value = null
  }

  return { verification, refresh, forget }
}

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { safeRedirect } from '@/utils/safeRedirect'
import AlertMessage from '@/components/ui/AlertMessage.vue'
import { DEV_ACCOUNTS, DEV_ACCOUNTS_MISSING } from './devAccounts'

/** Local development only: continue as a demo account without typing any credentials. */
const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const pendingRole = ref(null)
const errorMessage = ref('')

async function continueAs(account) {
  pendingRole.value = account.role
  errorMessage.value = ''
  try {
    await auth.login(account.email, account.password)
    await router.replace(safeRedirect(route.query.redirect))
  } catch (error) {
    errorMessage.value = error.status === 401 ? DEV_ACCOUNTS_MISSING : error.message
  } finally {
    pendingRole.value = null
  }
}
</script>

<template>
  <section aria-labelledby="local-mode-title" class="card mb-6 flex flex-col gap-4 border-2 border-dashed border-accent">
    <div>
      <h2 id="local-mode-title" class="text-xl font-bold">Mode local</h2>
      <p class="text-ink-muted">Sans connexion : choisissez un compte de démo.</p>
    </div>
    <div class="grid gap-3 sm:grid-cols-2">
      <button
        v-for="account in DEV_ACCOUNTS"
        :key="account.role"
        type="button"
        class="btn-secondary h-auto flex-col items-start py-3 text-left"
        :disabled="pendingRole !== null"
        @click="continueAs(account)"
      >
        <span>{{ pendingRole === account.role ? 'Connexion…' : `Continuer en tant que ${account.label.toLowerCase()}` }}</span>
        <span class="text-base font-normal text-ink-muted">{{ account.description }}</span>
      </button>
    </div>
    <AlertMessage v-if="errorMessage" variant="error">{{ errorMessage }}</AlertMessage>
  </section>
</template>

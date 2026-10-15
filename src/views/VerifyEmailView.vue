<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { confirmEmail } from '@/api/authApi'
import { useAuthStore } from '@/stores/auth'
import { useEmailVerification } from '@/composables/useEmailVerification'
import { missionErrorMessage } from '@/missions/missionErrors'
import AlertMessage from '@/components/ui/AlertMessage.vue'

/** Opened by the link sent at the registration (spec 018, UC-3). */
const token = String(useRoute().query.token ?? '')
const { isAuthenticated } = storeToRefs(useAuthStore())
const { refresh } = useEmailVerification()
const status = ref('loading') // loading | verified | error
const errorMessage = ref('')

onMounted(async () => {
  if (!token) {
    errorMessage.value = 'Ce lien est incomplet. Ouvrez le lien reçu par e-mail.'
    status.value = 'error'
    return
  }
  try {
    await confirmEmail(token)
    status.value = 'verified'
    if (isAuthenticated.value) {
      await refresh()
    }
  } catch (error) {
    errorMessage.value = missionErrorMessage(error)
    status.value = 'error'
  }
})
</script>

<template>
  <div class="mx-auto flex w-full max-w-md flex-col gap-5">
    <h1 class="text-3xl font-bold">Vérification de votre adresse</h1>
    <p v-if="status === 'loading'" role="status" class="text-ink-muted">Vérification en cours…</p>
    <template v-else-if="status === 'verified'">
      <AlertMessage variant="success">Merci, votre adresse e-mail est vérifiée.</AlertMessage>
      <RouterLink :to="{ name: isAuthenticated ? 'dashboard' : 'login' }" class="btn-primary w-full">
        {{ isAuthenticated ? 'Continuer' : 'Se connecter' }}
      </RouterLink>
    </template>
    <template v-else>
      <AlertMessage variant="error">{{ errorMessage }}</AlertMessage>
      <p class="text-ink-muted">Une fois connecté, vous pouvez vous faire renvoyer un lien depuis le bandeau en haut de la page.</p>
    </template>
  </div>
</template>

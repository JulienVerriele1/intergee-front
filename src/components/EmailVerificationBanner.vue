<script setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { resendEmailVerification } from '@/api/authApi'
import { useAuthStore } from '@/stores/auth'
import { ROLES } from '@/constants/roles'
import { useEmailVerification } from '@/composables/useEmailVerification'

/** Until the address is verified, applying and publishing wait (spec 018, RG-4 and RG-5). */
const { isAuthenticated, role } = storeToRefs(useAuthStore())
const { verification, refresh, forget } = useEmailVerification()

const concerned = computed(() => isAuthenticated.value && [ROLES.STUDENT, ROLES.BENEFICIARY, ROLES.CAREGIVER].includes(role.value))
const shown = computed(() => concerned.value && verification.value && !verification.value.verified)
const action = computed(() => (role.value === ROLES.STUDENT ? 'proposer votre aide' : 'publier une mission'))
const sending = ref(false)
const sent = ref(false)

watch(concerned, (now) => {
  sent.value = false
  if (now) {
    refresh()
  } else {
    forget()
  }
}, { immediate: true })

async function resend() {
  sending.value = true
  try {
    await resendEmailVerification()
    sent.value = true
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div v-if="shown" role="status" class="border-b-2 border-primary bg-primary-soft">
    <div class="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p class="text-lg text-ink">
        Vérifiez votre adresse e-mail pour {{ action }} : ouvrez le lien envoyé à <strong>{{ verification.email }}</strong>.
      </p>
      <p v-if="sent" class="font-bold text-ink">E-mail renvoyé. Pensez à regarder vos indésirables.</p>
      <button v-else type="button" class="btn-secondary shrink-0" :disabled="sending" @click="resend">
        {{ sending ? 'Envoi…' : 'Renvoyer l’e-mail' }}
      </button>
    </div>
  </div>
</template>

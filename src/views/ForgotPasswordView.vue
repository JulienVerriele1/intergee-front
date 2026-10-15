<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { requestPasswordReset } from '@/api/authApi'
import AlertMessage from '@/components/ui/AlertMessage.vue'
import FormField from '@/components/ui/FormField.vue'

/** Asks for a link to choose a new password (spec 018, UC-1): the answer never tells whether the account exists. */
const email = ref('')
const submitting = ref(false)
const sent = ref(false)
const errorMessage = ref('')

async function submit() {
  errorMessage.value = ''
  if (!email.value.trim()) {
    errorMessage.value = 'Saisissez votre adresse e-mail.'
    return
  }
  submitting.value = true
  try {
    await requestPasswordReset(email.value.trim())
    sent.value = true
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="mx-auto w-full max-w-md">
    <div class="card flex flex-col gap-5">
      <div>
        <h1 class="mb-1 text-3xl font-bold">Mot de passe oublié</h1>
        <p class="text-ink-muted">Nous vous envoyons un lien pour choisir un nouveau mot de passe.</p>
      </div>
      <AlertMessage v-if="sent" variant="success">
        Si un compte existe pour cette adresse, un e-mail vient de partir. Le lien est valable 1 heure. Pensez à regarder
        vos indésirables.
      </AlertMessage>
      <form v-else novalidate class="flex flex-col gap-5" @submit.prevent="submit">
        <AlertMessage v-if="errorMessage" variant="error">{{ errorMessage }}</AlertMessage>
        <FormField id="email" v-slot="field" label="Adresse e-mail" required>
          <input
            :id="field.id"
            v-model="email"
            type="email"
            class="form-input"
            autocomplete="username"
            inputmode="email"
            autocapitalize="off"
            spellcheck="false"
            required
          />
        </FormField>
        <button type="submit" class="btn-primary w-full" :disabled="submitting">
          {{ submitting ? 'Envoi…' : 'Recevoir le lien' }}
        </button>
      </form>
      <RouterLink :to="{ name: 'login' }" class="link self-center">Revenir à la connexion</RouterLink>
    </div>
  </div>
</template>

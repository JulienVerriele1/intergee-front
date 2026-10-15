<script setup>
import { ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { resetPassword } from '@/api/authApi'
import { missionErrorMessage } from '@/missions/missionErrors'
import { PASSWORD_MIN_LENGTH } from '@/registration/registrationForm'
import AlertMessage from '@/components/ui/AlertMessage.vue'
import FormField from '@/components/ui/FormField.vue'

/** Chooses a new password with the link received by e-mail (spec 018, UC-2). */
const token = String(useRoute().query.token ?? '')
const password = ref('')
const passwordVisible = ref(false)
const submitting = ref(false)
const done = ref(false)
const errorMessage = ref('')
const passwordError = ref('')

async function submit() {
  errorMessage.value = ''
  passwordError.value = password.value.length < PASSWORD_MIN_LENGTH
    ? `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.`
    : ''
  if (passwordError.value) {
    return
  }
  submitting.value = true
  try {
    await resetPassword(token, password.value)
    done.value = true
  } catch (error) {
    errorMessage.value = missionErrorMessage(error)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="mx-auto w-full max-w-md">
    <div class="card flex flex-col gap-5">
      <h1 class="text-3xl font-bold">Nouveau mot de passe</h1>
      <template v-if="done">
        <AlertMessage variant="success">Votre mot de passe est changé. Connectez-vous avec le nouveau.</AlertMessage>
        <RouterLink :to="{ name: 'login' }" class="btn-primary w-full">Se connecter</RouterLink>
      </template>
      <AlertMessage v-else-if="!token" variant="error">
        Ce lien est incomplet. Ouvrez le lien reçu par e-mail, ou demandez-en un nouveau.
      </AlertMessage>
      <form v-else novalidate class="flex flex-col gap-5" @submit.prevent="submit">
        <AlertMessage v-if="errorMessage" variant="error">{{ errorMessage }}</AlertMessage>
        <FormField id="password" v-slot="field" label="Nouveau mot de passe" :help="`Au moins ${PASSWORD_MIN_LENGTH} caractères.`" :error="passwordError" required>
          <div class="flex gap-2">
            <input
              :id="field.id"
              v-model="password"
              :type="passwordVisible ? 'text' : 'password'"
              class="form-input"
              autocomplete="new-password"
              :aria-describedby="field.describedBy"
              :aria-invalid="field.invalid"
              required
            />
            <button type="button" class="btn-secondary shrink-0" :aria-pressed="passwordVisible" @click="passwordVisible = !passwordVisible">
              {{ passwordVisible ? 'Masquer' : 'Afficher' }}
              <span class="sr-only">le mot de passe</span>
            </button>
          </div>
        </FormField>
        <button type="submit" class="btn-primary w-full" :disabled="submitting">
          {{ submitting ? 'Enregistrement…' : 'Changer mon mot de passe' }}
        </button>
      </form>
      <RouterLink v-if="!done" :to="{ name: 'forgot-password' }" class="link self-center">Demander un nouveau lien</RouterLink>
    </div>
  </div>
</template>

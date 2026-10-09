<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AlertMessage from '@/components/ui/AlertMessage.vue'
import FormField from '@/components/ui/FormField.vue'
import { safeRedirect } from '@/utils/safeRedirect'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const email = ref('')
const password = ref('')
const passwordVisible = ref(false)
const submitting = ref(false)
const errorMessage = ref('')

async function submit() {
  errorMessage.value = ''
  if (!email.value.trim() || !password.value) {
    errorMessage.value = 'Saisissez votre adresse e-mail et votre mot de passe.'
    return
  }
  submitting.value = true
  try {
    await auth.login(email.value.trim(), password.value)
    await router.replace(safeRedirect(route.query.redirect))
  } catch (error) {
    errorMessage.value = error.status === 401 ? 'Adresse e-mail ou mot de passe incorrect.' : error.message
    password.value = ''
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="mx-auto w-full max-w-md">
    <div class="card">
      <h1 class="mb-1 text-3xl font-bold">Connexion</h1>
      <p class="mb-6 text-ink-muted">Accédez à votre espace Intergee.</p>

      <AlertMessage v-if="errorMessage" variant="error" class="mb-6">{{ errorMessage }}</AlertMessage>

      <form novalidate class="flex flex-col gap-5" @submit.prevent="submit">
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

        <FormField id="password" v-slot="field" label="Mot de passe" required>
          <div class="flex gap-2">
            <input
              :id="field.id"
              v-model="password"
              :type="passwordVisible ? 'text' : 'password'"
              class="form-input"
              autocomplete="current-password"
              required
            />
            <button
              type="button"
              class="btn-secondary shrink-0"
              :aria-pressed="passwordVisible"
              aria-controls="password"
              @click="passwordVisible = !passwordVisible"
            >
              {{ passwordVisible ? 'Masquer' : 'Afficher' }}
              <span class="sr-only">le mot de passe</span>
            </button>
          </div>
        </FormField>

        <button type="submit" class="btn-primary w-full" :disabled="submitting">
          {{ submitting ? 'Connexion…' : 'Se connecter' }}
        </button>
      </form>
    </div>
  </div>
</template>

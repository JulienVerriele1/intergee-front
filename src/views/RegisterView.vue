<script setup>
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { geocodeCity } from '@/api/geocodingApi'
import { ROLES } from '@/constants/roles'
import {
  PASSWORD_MIN_LENGTH,
  RADIUS_OPTIONS,
  emptyBeneficiaryForm,
  emptyStudentForm,
  toBeneficiaryPayload,
  toStudentPayload,
  validateBeneficiary,
  validateStudent,
} from '@/registration/registrationForm'
import AlertMessage from '@/components/ui/AlertMessage.vue'
import FormField from '@/components/ui/FormField.vue'

/** Second step of the registration: the form of the chosen role (spec 001). */
const props = defineProps({
  role: { type: String, required: true, validator: (value) => [ROLES.STUDENT, ROLES.BENEFICIARY].includes(value) },
})

const auth = useAuthStore()
const router = useRouter()

const isStudent = computed(() => props.role === ROLES.STUDENT)
const form = ref(isStudent.value ? emptyStudentForm() : emptyBeneficiaryForm())
const errors = ref({})
const errorMessage = ref('')
const submitting = ref(false)
const passwordVisible = ref(false)

async function submit() {
  errorMessage.value = ''
  errors.value = isStudent.value ? validateStudent(form.value) : validateBeneficiary(form.value)
  if (Object.keys(errors.value).length > 0) {
    errorMessage.value = 'Certaines informations sont à corriger.'
    return
  }
  submitting.value = true
  try {
    await auth.register(props.role, await payload())
    // A student completes their profile before applying (spec 010)
    await router.replace(isStudent.value ? { name: 'profile' } : { name: 'dashboard' })
  } catch (error) {
    errorMessage.value = messageOf(error)
  } finally {
    submitting.value = false
  }
}

async function payload() {
  if (!isStudent.value) {
    return toBeneficiaryPayload(form.value)
  }
  const center = await geocodeCity(form.value)
  if (!center) {
    errors.value = { city: 'Ville introuvable pour ce code postal. Vérifiez-les.' }
    throw new Error('Ville introuvable pour ce code postal. Vérifiez-les.')
  }
  return toStudentPayload(form.value, center)
}

function messageOf(error) {
  if (error.status === 409) {
    errors.value = { email: 'Un compte existe déjà avec cette adresse e-mail.' }
    return 'Un compte existe déjà avec cette adresse e-mail. Vous pouvez vous connecter.'
  }
  if (error.status === 400) {
    return 'Certaines informations sont invalides. Vérifiez le formulaire.'
  }
  return error.message
}
</script>

<template>
  <div class="mx-auto w-full max-w-2xl">
    <div class="card">
      <RouterLink :to="{ name: 'register' }" class="link">← Changer de profil</RouterLink>
      <h1 class="mt-3 mb-1 text-3xl font-bold">{{ isStudent ? 'Inscription étudiant' : 'Inscription bénéficiaire' }}</h1>
      <p class="mb-6 text-ink-muted">Les champs marqués d'une étoile sont obligatoires.</p>

      <AlertMessage v-if="errorMessage" variant="error" class="mb-6">{{ errorMessage }}</AlertMessage>

      <form novalidate class="flex flex-col gap-5" @submit.prevent="submit">
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField id="first-name" v-slot="field" label="Prénom" :error="errors.firstName" required>
            <input :id="field.id" v-model="form.firstName" type="text" class="form-input" autocomplete="given-name"
                   :aria-describedby="field.describedBy" :aria-invalid="field.invalid" required />
          </FormField>
          <FormField id="last-name" v-slot="field" label="Nom" :error="errors.lastName" required>
            <input :id="field.id" v-model="form.lastName" type="text" class="form-input" autocomplete="family-name"
                   :aria-describedby="field.describedBy" :aria-invalid="field.invalid" required />
          </FormField>
        </div>

        <FormField id="email" v-slot="field" label="Adresse e-mail" :error="errors.email" required>
          <input :id="field.id" v-model="form.email" type="email" class="form-input" autocomplete="email" inputmode="email"
                 autocapitalize="off" spellcheck="false" :aria-describedby="field.describedBy" :aria-invalid="field.invalid" required />
        </FormField>

        <FormField
          id="password"
          v-slot="field"
          label="Mot de passe"
          :help="`Au moins ${PASSWORD_MIN_LENGTH} caractères.`"
          :error="errors.password"
          required
        >
          <div class="flex gap-2">
            <input :id="field.id" v-model="form.password" :type="passwordVisible ? 'text' : 'password'" class="form-input"
                   autocomplete="new-password" :aria-describedby="field.describedBy" :aria-invalid="field.invalid" required />
            <button type="button" class="btn-secondary shrink-0" :aria-pressed="passwordVisible" aria-controls="password"
                    @click="passwordVisible = !passwordVisible">
              {{ passwordVisible ? 'Masquer' : 'Afficher' }}
              <span class="sr-only">le mot de passe</span>
            </button>
          </div>
        </FormField>

        <template v-if="isStudent">
          <FormField id="school" v-slot="field" label="Établissement d'études" :error="errors.school" required>
            <input :id="field.id" v-model="form.school" type="text" class="form-input" autocomplete="organization"
                   :aria-describedby="field.describedBy" :aria-invalid="field.invalid" required />
          </FormField>
          <fieldset class="flex flex-col gap-4">
            <legend class="mb-1 text-xl font-bold">Zone d'intervention</legend>
            <p class="text-ink-muted">La ville autour de laquelle vous acceptez de rendre service.</p>
            <div class="grid grid-cols-1 gap-5 sm:grid-cols-[10rem_1fr]">
              <FormField id="postal-code" v-slot="field" label="Code postal" :error="errors.postalCode" required>
                <input :id="field.id" v-model="form.postalCode" type="text" inputmode="numeric" maxlength="5" class="form-input"
                       autocomplete="postal-code" :aria-describedby="field.describedBy" :aria-invalid="field.invalid" required />
              </FormField>
              <FormField id="city" v-slot="field" label="Ville" :error="errors.city" required>
                <input :id="field.id" v-model="form.city" type="text" class="form-input" autocomplete="address-level2"
                       :aria-describedby="field.describedBy" :aria-invalid="field.invalid" required />
              </FormField>
            </div>
            <FormField id="radius" v-slot="field" label="Distance maximale" required>
              <select :id="field.id" v-model="form.radiusKm" class="form-input sm:w-48">
                <option v-for="radius in RADIUS_OPTIONS" :key="radius" :value="radius">{{ radius }} km</option>
              </select>
            </FormField>
          </fieldset>
        </template>

        <template v-else>
          <FormField id="phone" v-slot="field" label="Téléphone" :error="errors.phone" required>
            <input :id="field.id" v-model="form.phone" type="tel" class="form-input sm:w-64" autocomplete="tel"
                   :aria-describedby="field.describedBy" :aria-invalid="field.invalid" required />
          </FormField>
          <fieldset class="flex flex-col gap-4">
            <legend class="mb-1 text-xl font-bold">Adresse</legend>
            <p class="text-ink-muted">Elle n'est communiquée qu'à l'étudiant que vous choisirez.</p>
            <FormField id="street" v-slot="field" label="Numéro et rue" :error="errors.street" required>
              <input :id="field.id" v-model="form.street" type="text" class="form-input" autocomplete="address-line1"
                     :aria-describedby="field.describedBy" :aria-invalid="field.invalid" required />
            </FormField>
            <div class="grid grid-cols-1 gap-5 sm:grid-cols-[10rem_1fr]">
              <FormField id="postal-code" v-slot="field" label="Code postal" :error="errors.postalCode" required>
                <input :id="field.id" v-model="form.postalCode" type="text" inputmode="numeric" maxlength="5" class="form-input"
                       autocomplete="postal-code" :aria-describedby="field.describedBy" :aria-invalid="field.invalid" required />
              </FormField>
              <FormField id="city" v-slot="field" label="Ville" :error="errors.city" required>
                <input :id="field.id" v-model="form.city" type="text" class="form-input" autocomplete="address-level2"
                       :aria-describedby="field.describedBy" :aria-invalid="field.invalid" required />
              </FormField>
            </div>
          </fieldset>
        </template>

        <button type="submit" class="btn-primary w-full" :disabled="submitting">
          {{ submitting ? 'Création du compte…' : 'Créer mon compte' }}
        </button>
      </form>
    </div>
  </div>
</template>

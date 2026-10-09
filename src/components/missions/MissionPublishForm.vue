<script setup>
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { publishMission } from '@/api/missionApi'
import { geocodeAddress } from '@/api/geocodingApi'
import { MISSION_CATEGORIES } from '@/constants/missionCategories'
import AlertMessage from '@/components/ui/AlertMessage.vue'
import FormField from '@/components/ui/FormField.vue'
import { formatDateTime, formatDuration } from '@/utils/formatters'
import {
  DESCRIPTION_MAX_LENGTH,
  DURATION_OPTIONS,
  TITLE_MAX_LENGTH,
  emptyMissionForm,
  toDateTimeLocalValue,
  toPublishPayload,
  validateMissionForm,
} from '@/missions/missionForm'

const props = defineProps({
  /** A caregiver publishes on behalf of a beneficiary they manage */
  requiresBeneficiary: { type: Boolean, default: false },
})

const form = reactive(emptyMissionForm())
const errors = ref({})
const location = ref(null) // address confirmed by the user, with its coordinates
const locating = ref(false)
const locationError = ref('')
const submitting = ref(false)
const submitError = ref('')
const publishedMission = ref(null)
const formElement = ref(null)

const minScheduledAt = computed(() => toDateTimeLocalValue(new Date()))
const addressFilled = computed(() => form.street.trim() && /^\d{5}$/.test(form.postalCode.trim()) && form.city.trim())

// Any change to the address invalidates the previously located one
watch(() => [form.street, form.postalCode, form.city], () => {
  location.value = null
  locationError.value = ''
})

async function locateAddress() {
  locating.value = true
  locationError.value = ''
  try {
    location.value = await geocodeAddress(form)
    if (!location.value) {
      locationError.value = 'Adresse introuvable. Vérifiez la rue, le code postal et la ville.'
    }
  } catch {
    locationError.value = 'Le service de localisation est indisponible. Réessayez dans un instant.'
  } finally {
    locating.value = false
  }
}

async function submit() {
  submitError.value = ''
  publishedMission.value = null
  errors.value = validateMissionForm(form, { requiresBeneficiary: props.requiresBeneficiary })
  if (!location.value) {
    locationError.value ||= 'Localisez et vérifiez l’adresse avant de publier.'
  }
  if (Object.keys(errors.value).length > 0 || !location.value) {
    await focusFirstInvalidField()
    return
  }

  submitting.value = true
  try {
    publishedMission.value = await publishMission(
      toPublishPayload(form, location.value, { requiresBeneficiary: props.requiresBeneficiary }),
    )
    Object.assign(form, emptyMissionForm())
    await nextTick()
    location.value = null
  } catch (error) {
    submitError.value = error.message
  } finally {
    submitting.value = false
  }
}

async function focusFirstInvalidField() {
  await nextTick()
  formElement.value?.querySelector('[aria-invalid="true"], #locate-address')?.focus()
}
</script>

<template>
  <section aria-labelledby="publish-title" class="card">
    <h2 id="publish-title" class="mb-1 text-xl font-bold">Publier une mission</h2>
    <p class="mb-6 text-slate-600">
      Décrivez la tâche à réaliser. Les champs marqués <span aria-hidden="true" class="text-red-700">*</span>
      <span class="sr-only">d'un astérisque</span> sont obligatoires.
    </p>

    <AlertMessage v-if="publishedMission" variant="success" class="mb-6">
      Mission « {{ publishedMission.title }} » publiée pour le
      {{ formatDateTime(publishedMission.scheduledAt) }} ({{ formatDuration(publishedMission.durationMinutes) }}).
    </AlertMessage>
    <AlertMessage v-if="submitError" variant="error" class="mb-6">{{ submitError }}</AlertMessage>

    <form ref="formElement" novalidate class="grid gap-5 sm:grid-cols-2" @submit.prevent="submit">
      <FormField
        v-if="requiresBeneficiary"
        id="beneficiaryId"
        v-slot="field"
        class="sm:col-span-2"
        label="Identifiant du bénéficiaire"
        help="Identifiant communiqué lors de la création du bénéficiaire que vous accompagnez."
        :error="errors.beneficiaryId"
        required
      >
        <input
          :id="field.id"
          v-model="form.beneficiaryId"
          class="form-input font-mono"
          autocomplete="off"
          spellcheck="false"
          :aria-describedby="field.describedBy"
          :aria-invalid="field.invalid"
          required
        />
      </FormField>

      <FormField id="title" v-slot="field" class="sm:col-span-2" label="Titre" :error="errors.title" required>
        <input
          :id="field.id"
          v-model="form.title"
          class="form-input"
          :maxlength="TITLE_MAX_LENGTH"
          placeholder="Ex. : Aide pour faire les courses au marché"
          :aria-describedby="field.describedBy"
          :aria-invalid="field.invalid"
          required
        />
      </FormField>

      <FormField id="category" v-slot="field" label="Catégorie" :error="errors.category" required>
        <select
          :id="field.id"
          v-model="form.category"
          class="form-input"
          :aria-describedby="field.describedBy"
          :aria-invalid="field.invalid"
          required
        >
          <option value="" disabled>Choisir une catégorie</option>
          <option v-for="category in MISSION_CATEGORIES" :key="category.value" :value="category.value">
            {{ category.label }}
          </option>
        </select>
      </FormField>

      <FormField id="reward" v-slot="field" label="Compensation (€)" :error="errors.reward" required>
        <input
          :id="field.id"
          v-model="form.reward"
          class="form-input"
          inputmode="decimal"
          placeholder="Ex. : 20"
          :aria-describedby="field.describedBy"
          :aria-invalid="field.invalid"
          required
        />
      </FormField>

      <FormField
        id="description"
        v-slot="field"
        class="sm:col-span-2"
        label="Description"
        help="Précisez la tâche attendue. Ne mentionnez pas d'information sur la santé de la personne."
        :error="errors.description"
        required
      >
        <textarea
          :id="field.id"
          v-model="form.description"
          class="form-input min-h-28"
          rows="4"
          :maxlength="DESCRIPTION_MAX_LENGTH"
          :aria-describedby="field.describedBy"
          :aria-invalid="field.invalid"
          required
        />
      </FormField>

      <FormField id="scheduledAt" v-slot="field" label="Date et heure" :error="errors.scheduledAt" required>
        <input
          :id="field.id"
          v-model="form.scheduledAt"
          type="datetime-local"
          class="form-input"
          :min="minScheduledAt"
          :aria-describedby="field.describedBy"
          :aria-invalid="field.invalid"
          required
        />
      </FormField>

      <FormField id="durationMinutes" v-slot="field" label="Durée estimée" :error="errors.durationMinutes" required>
        <select
          :id="field.id"
          v-model.number="form.durationMinutes"
          class="form-input"
          :aria-describedby="field.describedBy"
          :aria-invalid="field.invalid"
          required
        >
          <option v-for="minutes in DURATION_OPTIONS" :key="minutes" :value="minutes">
            {{ formatDuration(minutes) }}
          </option>
        </select>
      </FormField>

      <fieldset class="grid gap-5 rounded-lg border border-slate-200 p-4 sm:col-span-2 sm:grid-cols-6">
        <legend class="px-1 font-semibold text-slate-800">Lieu de la mission</legend>
        <FormField id="street" v-slot="field" class="sm:col-span-6" label="Numéro et rue" :error="errors.street" required>
          <input
            :id="field.id"
            v-model="form.street"
            class="form-input"
            autocomplete="street-address"
            :aria-describedby="field.describedBy"
            :aria-invalid="field.invalid"
            required
          />
        </FormField>
        <FormField id="postalCode" v-slot="field" class="sm:col-span-2" label="Code postal" :error="errors.postalCode" required>
          <input
            :id="field.id"
            v-model="form.postalCode"
            class="form-input"
            inputmode="numeric"
            autocomplete="postal-code"
            maxlength="5"
            :aria-describedby="field.describedBy"
            :aria-invalid="field.invalid"
            required
          />
        </FormField>
        <FormField id="city" v-slot="field" class="sm:col-span-4" label="Ville" :error="errors.city" required>
          <input
            :id="field.id"
            v-model="form.city"
            class="form-input"
            autocomplete="address-level2"
            :aria-describedby="field.describedBy"
            :aria-invalid="field.invalid"
            required
          />
        </FormField>

        <div class="flex flex-col gap-3 sm:col-span-6" aria-live="polite">
          <button
            id="locate-address"
            type="button"
            class="btn-secondary self-start"
            :disabled="!addressFilled || locating"
            @click="locateAddress"
          >
            {{ locating ? 'Localisation…' : 'Vérifier l’adresse' }}
          </button>
          <p v-if="location" class="rounded-lg bg-green-50 px-3 py-2 text-green-900">
            Adresse reconnue : <strong>{{ location.label }}</strong>.
            Si ce n'est pas la bonne, corrigez les champs ci-dessus.
          </p>
          <p v-if="locationError" class="font-medium text-red-700">{{ locationError }}</p>
        </div>
      </fieldset>

      <div class="sm:col-span-2">
        <button type="submit" class="btn-primary w-full sm:w-auto" :disabled="submitting">
          {{ submitting ? 'Publication…' : 'Publier la mission' }}
        </button>
      </div>
    </form>
  </section>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { publishMission } from '@/api/missionApi'
import { estimateCost } from '@/api/wageApi'
import { MISSION_CATEGORIES } from '@/constants/missionCategories'
import { skillFamiliesForCategory } from '@/constants/profileOptions'
import AlertMessage from '@/components/ui/AlertMessage.vue'
import AddressAutocomplete from '@/components/ui/AddressAutocomplete.vue'
import FormField from '@/components/ui/FormField.vue'
import DateTimePicker from '@/components/ui/DateTimePicker.vue'
import CesuReminder from './CesuReminder.vue'
import CostEstimate from './CostEstimate.vue'
import { formatDateTime, formatDuration, formatEuros } from '@/utils/formatters'
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
  /** Until the employer says they are registered to the CESU (spec 013, RG-5) */
  showCesuReminder: { type: Boolean, default: false },
})

const form = reactive(emptyMissionForm())
const errors = ref({})
const location = ref(null) // address chosen among the suggestions, with its coordinates
const locationError = ref('')
const submitting = ref(false)
const submitError = ref('')
const publishedMission = ref(null)
const formElement = ref(null)
// Net SMIC with paid leave (spec 013, RG-2): the wage starts there, and is never published below it
const minimumHourlyNetWage = ref(null)

onMounted(async () => {
  try {
    const { minimumHourlyNetWage: minimum } = await estimateCost({ hourlyNetWage: 20, durationMinutes: 60 })
    minimumHourlyNetWage.value = minimum
    if (!form.hourlyNetWage) {
      form.hourlyNetWage = Number(minimum).toFixed(2).replace('.', ',')
    }
  } catch {
    // The server checks the minimum anyway
  }
})

const minScheduledAt = computed(() => toDateTimeLocalValue(new Date()))
// Skills a mission of the chosen category may require (spec 011, RG-2)
const skillFamilies = computed(() => (form.category ? skillFamiliesForCategory(form.category) : []))

// A new category keeps only the skills it still allows
watch(() => form.category, () => {
  const allowed = new Set(skillFamilies.value.flatMap((family) => family.skills.map((skill) => skill.value)))
  form.requiredSkills = form.requiredSkills.filter((skill) => allowed.has(skill))
})


// Any change to the address invalidates the previously located one
watch(() => [form.street, form.postalCode, form.city], () => {
  location.value = null
  locationError.value = ''
})

// Choosing a suggested address fills the fields, then locates the mission: the watch above has run in between
async function onAddressSelected(address) {
  form.street = address.street
  form.postalCode = address.postalCode
  form.city = address.city
  await nextTick()
  location.value = { label: address.label, latitude: address.latitude, longitude: address.longitude }
  locationError.value = ''
}

async function submit() {
  submitError.value = ''
  publishedMission.value = null
  errors.value = validateMissionForm(form, {
    requiresBeneficiary: props.requiresBeneficiary,
    minimumHourlyNetWage: minimumHourlyNetWage.value,
  })
  if (!location.value) {
    locationError.value ||= 'Choisissez l’adresse dans la liste proposée sous « Numéro et rue ».'
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
    if (minimumHourlyNetWage.value) {
      form.hourlyNetWage = Number(minimumHourlyNetWage.value).toFixed(2).replace('.', ',')
    }
    await nextTick()
    location.value = null
  } catch (error) {
    // A beneficiary publishes once their presentation is given (spec 012, RG-3)
    submitError.value =
      error.code === 'PROFILE_INCOMPLETE'
        ? 'Avant de publier une mission, ajoutez votre présentation dans « Mon profil ».'
        : error.code === 'WAGE_BELOW_MINIMUM'
          ? 'Le salaire horaire net est inférieur au minimum légal (SMIC net et congés payés) : augmentez-le.'
          : error.message
  } finally {
    submitting.value = false
  }
}

async function focusFirstInvalidField() {
  await nextTick()
  formElement.value?.querySelector('[aria-invalid="true"], #street')?.focus()
}
</script>

<template>
  <section aria-labelledby="publish-title" class="card">
    <h2 id="publish-title" class="mb-1 text-2xl font-bold">Détails de la mission</h2>
    <p class="mb-6 text-ink-muted">
      Décrivez la tâche à réaliser. Les champs marqués <span aria-hidden="true" class="text-danger">*</span>
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

      <fieldset
        v-if="skillFamilies.length > 0"
        class="flex flex-col gap-3"
        :aria-describedby="errors.requiredSkills ? 'required-skills-error' : 'required-skills-help'"
      >
        <legend class="text-lg leading-6 font-bold text-ink">
          Compétences nécessaires <span class="text-danger" aria-hidden="true">*</span>
        </legend>
        <p id="required-skills-help" class="text-base text-ink-muted">
          Choisissez au moins une compétence : la mission est proposée aux étudiants qui en possèdent une.
        </p>
        <div v-for="family in skillFamilies" :key="family.value" class="flex flex-col gap-1">
          <label v-for="skill in family.skills" :key="skill.value" class="flex min-h-target items-center gap-3 text-lg">
            <input
              v-model="form.requiredSkills"
              type="checkbox"
              :value="skill.value"
              class="size-6 shrink-0 accent-primary"
              :aria-invalid="errors.requiredSkills ? 'true' : undefined"
            />
            {{ skill.label }}
          </label>
        </div>
        <p v-if="errors.requiredSkills" id="required-skills-error" class="rounded-lg bg-danger-soft px-3 py-2 text-base text-ink">
          {{ errors.requiredSkills }}
        </p>
      </fieldset>

      <div class="flex flex-col gap-3 sm:col-span-2">
        <FormField
          id="hourly-net-wage"
          v-slot="field"
          label="Salaire horaire net (€ de l'heure)"
          :help="minimumHourlyNetWage
            ? `L'étudiant est votre salarié : au moins ${formatEuros(minimumHourlyNetWage)} de l'heure (SMIC net et congés payés).`
            : 'L\'étudiant est votre salarié : au moins le SMIC net, congés payés compris.'"
          :error="errors.hourlyNetWage"
          required
        >
          <input
            :id="field.id"
            v-model="form.hourlyNetWage"
            class="form-input sm:w-48"
            inputmode="decimal"
            :aria-describedby="field.describedBy"
            :aria-invalid="field.invalid"
            required
          />
        </FormField>
        <CostEstimate :hourly-net-wage="String(form.hourlyNetWage)" :duration-minutes="Number(form.durationMinutes)" />
        <CesuReminder v-if="showCesuReminder" />
      </div>

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

      <FormField
        id="scheduledAt"
        v-slot="field"
        class="sm:col-span-2"
        label="Date et heure"
        help="Choisissez un jour, puis une heure de début entre 8 h et 20 h."
        :error="errors.scheduledAt"
        required
      >
        <DateTimePicker
          :id="field.id"
          v-model="form.scheduledAt"
          label="Date et heure de la mission"
          :min="minScheduledAt"
          :described-by="field.describedBy"
          :invalid="field.invalid"
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

      <fieldset class="grid gap-5 rounded-lg border border-border-subtle p-4 sm:col-span-2 sm:grid-cols-6">
        <legend class="px-1 font-bold text-ink">Lieu de la mission</legend>
        <FormField id="street" v-slot="field" class="sm:col-span-6" label="Numéro et rue" help="Tapez les premiers caractères, puis choisissez l'adresse proposée." :error="errors.street" required>
          <AddressAutocomplete
            :id="field.id"
            v-model="form.street"
            :described-by="field.describedBy"
            :invalid="field.invalid"
            required
            @select="onAddressSelected"
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
          <p v-if="location" class="rounded-lg border-2 border-success bg-success-soft px-4 py-3 text-ink">
            Adresse reconnue : <strong>{{ location.label }}</strong>.
            Si ce n'est pas la bonne, choisissez-en une autre dans « Numéro et rue ».
          </p>
          <p v-if="locationError" class="rounded-lg bg-danger-soft px-4 py-3 font-bold text-ink">{{ locationError }}</p>
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

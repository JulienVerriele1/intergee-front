<script setup>
import { computed, onMounted, ref } from 'vue'
import { fetchMyProfile, updateMyProfile, uploadMyPhoto } from '@/api/profileApi'
import { PHOTO_MAX_BYTES, PHOTO_MEDIA_TYPES, SEXES, SKILL_FAMILIES, STUDY_LEVELS } from '@/constants/profileOptions'
import { missionErrorMessage } from '@/missions/missionErrors'
import AlertMessage from '@/components/ui/AlertMessage.vue'
import AddressAutocomplete from '@/components/ui/AddressAutocomplete.vue'
import FormField from '@/components/ui/FormField.vue'
import StudentPhoto from '@/components/ui/StudentPhoto.vue'

/** Profile of the student (spec 010): required photo, skills, identity. */
const profile = ref(null)
const status = ref('loading') // loading | ready | error
const loadError = ref('')
const form = ref(null)
const saving = ref(false)
const saveMessage = ref(null) // { variant, text }
const photoVersion = ref(0)
const photoMessage = ref(null) // { variant, text }
const uploading = ref(false)

const missing = computed(() => {
  if (!profile.value) {
    return []
  }
  return [
    !profile.value.hasPhoto && 'votre photo',
    profile.value.skills.length === 0 && 'au moins une compétence',
    !profile.value.birthDate && 'votre date de naissance',
    !profile.value.address && 'votre adresse',
    !profile.value.studyLevel && 'votre niveau d’études',
  ].filter(Boolean)
})

function toForm(source) {
  return {
    birthDate: source.birthDate ?? '',
    street: source.address?.street ?? '',
    postalCode: source.address?.postalCode ?? '',
    city: source.address?.city ?? '',
    sex: source.sex ?? 'NOT_SPECIFIED',
    studyLevel: source.studyLevel ?? '',
    skills: [...source.skills],
  }
}

async function load() {
  try {
    profile.value = await fetchMyProfile()
    form.value = toForm(profile.value)
    status.value = 'ready'
  } catch (error) {
    loadError.value = missionErrorMessage(error)
    status.value = 'error'
  }
}

function fillAddress(address) {
  form.value.street = address.street
  form.value.postalCode = address.postalCode
  form.value.city = address.city
}

async function save() {
  saveMessage.value = null
  if (form.value.skills.length === 0) {
    saveMessage.value = { variant: 'error', text: 'Choisissez au moins une compétence.' }
    return
  }
  saving.value = true
  try {
    profile.value = await updateMyProfile({
      // Locked once known: only sent the first time (spec 010, RG-5)
      ...(!profile.value.birthDate && { birthDate: form.value.birthDate || null }),
      address: { street: form.value.street, postalCode: form.value.postalCode, city: form.value.city },
      sex: form.value.sex,
      studyLevel: form.value.studyLevel || null,
      skills: form.value.skills,
    })
    form.value = toForm(profile.value)
    saveMessage.value = { variant: 'success', text: 'Votre profil est enregistré.' }
  } catch (error) {
    saveMessage.value = { variant: 'error', text: missionErrorMessage(error) }
  } finally {
    saving.value = false
  }
}

async function onPhotoChosen(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  photoMessage.value = null
  if (!file) {
    return
  }
  if (!PHOTO_MEDIA_TYPES.includes(file.type)) {
    photoMessage.value = { variant: 'error', text: 'La photo doit être au format JPEG ou PNG.' }
    return
  }
  if (file.size > PHOTO_MAX_BYTES) {
    photoMessage.value = { variant: 'error', text: 'La photo ne doit pas dépasser 5 Mo.' }
    return
  }
  uploading.value = true
  try {
    await uploadMyPhoto(file)
    profile.value = await fetchMyProfile()
    photoVersion.value += 1
    photoMessage.value = { variant: 'success', text: 'Votre photo est enregistrée.' }
  } catch (error) {
    photoMessage.value = { variant: 'error', text: missionErrorMessage(error) }
  } finally {
    uploading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="flex flex-col gap-6">
    <h1 class="text-3xl font-bold">Mon profil</h1>

    <p v-if="status === 'loading'" role="status" class="text-ink-muted">Chargement de votre profil…</p>
    <AlertMessage v-else-if="status === 'error'" variant="error">{{ loadError }}</AlertMessage>
    <template v-else>
      <AlertMessage v-if="missing.length > 0" variant="info">
        Complétez votre profil pour pouvoir postuler aux missions : il manque {{ missing.join(', ') }}.
      </AlertMessage>

      <!-- Photo: required (spec 010, RG-1) -->
      <section aria-labelledby="photo-title" class="card flex flex-col gap-4 sm:flex-row sm:items-center">
        <StudentPhoto
          :student-id="profile.id"
          :first-name="profile.firstName"
          :has-photo="profile.hasPhoto"
          :version="photoVersion"
          :size="128"
        />
        <div class="flex flex-col gap-3">
          <h2 id="photo-title" class="text-xl font-bold">Photo</h2>
          <p class="text-ink-muted">Une photo de votre visage, au format JPEG ou PNG, 5 Mo au maximum. Elle rassure les personnes que vous aidez.</p>
          <label class="btn-secondary self-start" :class="{ 'pointer-events-none opacity-45': uploading }">
            {{ uploading ? 'Envoi en cours…' : profile.hasPhoto ? 'Changer ma photo' : 'Ajouter ma photo' }}
            <input type="file" accept="image/jpeg,image/png" class="sr-only" :disabled="uploading" @change="onPhotoChosen" />
          </label>
          <AlertMessage v-if="photoMessage" :variant="photoMessage.variant">{{ photoMessage.text }}</AlertMessage>
        </div>
      </section>

      <form class="flex flex-col gap-6" novalidate @submit.prevent="save">
        <section aria-labelledby="identity-title" class="card flex flex-col gap-4">
          <h2 id="identity-title" class="text-xl font-bold">Identité</h2>
          <dl class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <dt class="font-bold text-ink-muted">Nom</dt>
              <dd class="text-lg">{{ profile.firstName }} {{ profile.lastName }}</dd>
            </div>
            <div>
              <dt class="font-bold text-ink-muted">Établissement</dt>
              <dd class="text-lg">{{ profile.school }}</dd>
            </div>
            <div v-if="profile.birthDate">
              <dt class="font-bold text-ink-muted">Âge</dt>
              <dd class="text-lg">{{ profile.age }} ans</dd>
            </div>
          </dl>
          <FormField
            v-if="!profile.birthDate"
            id="birth-date"
            label="Date de naissance"
            help="Il faut avoir au moins 18 ans. Elle ne pourra plus être modifiée."
            required
          >
            <template #default="{ id, describedBy }">
              <input :id="id" v-model="form.birthDate" type="date" class="form-input sm:w-64" :aria-describedby="describedBy" required />
            </template>
          </FormField>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField id="sex" label="Sexe">
              <template #default="{ id }">
                <select :id="id" v-model="form.sex" class="form-input">
                  <option v-for="option in SEXES" :key="option.value" :value="option.value">{{ option.label }}</option>
                </select>
              </template>
            </FormField>
            <FormField id="study-level" label="Niveau d'études" required>
              <template #default="{ id }">
                <select :id="id" v-model="form.studyLevel" class="form-input" required>
                  <option value="" disabled>Choisissez votre niveau</option>
                  <option v-for="option in STUDY_LEVELS" :key="option.value" :value="option.value">{{ option.label }}</option>
                </select>
              </template>
            </FormField>
          </div>
        </section>

        <section aria-labelledby="address-title" class="card flex flex-col gap-4">
          <h2 id="address-title" class="text-xl font-bold">Adresse</h2>
          <p class="text-ink-muted">Elle reste privée : elle n'est jamais montrée aux personnes que vous aidez.</p>
          <FormField id="street" label="Numéro et rue" help="Tapez les premiers caractères, puis choisissez l'adresse proposée." required>
            <template #default="{ id, describedBy }">
              <AddressAutocomplete :id="id" v-model="form.street" :described-by="describedBy" required @select="fillAddress" />
            </template>
          </FormField>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-[12rem_1fr]">
            <FormField id="postal-code" label="Code postal" required>
              <template #default="{ id }">
                <input :id="id" v-model="form.postalCode" type="text" inputmode="numeric" autocomplete="postal-code" maxlength="5" class="form-input" required />
              </template>
            </FormField>
            <FormField id="city" label="Ville" required>
              <template #default="{ id }">
                <input :id="id" v-model="form.city" type="text" autocomplete="address-level2" class="form-input" required />
              </template>
            </FormField>
          </div>
        </section>

        <section aria-labelledby="skills-title" class="card flex flex-col gap-4">
          <h2 id="skills-title" class="text-xl font-bold">Mes compétences</h2>
          <p class="text-ink-muted">Choisissez au moins un service que vous savez et acceptez de rendre.</p>
          <fieldset v-for="family in SKILL_FAMILIES" :key="family.value" class="flex flex-col gap-2">
            <legend class="mb-1 text-lg font-bold">{{ family.label }}</legend>
            <label v-for="skill in family.skills" :key="skill.value" class="flex min-h-target items-center gap-3 text-lg">
              <input v-model="form.skills" type="checkbox" :value="skill.value" class="size-6 shrink-0 accent-primary" />
              {{ skill.label }}
            </label>
          </fieldset>
        </section>

        <AlertMessage v-if="saveMessage" :variant="saveMessage.variant">{{ saveMessage.text }}</AlertMessage>
        <button type="submit" class="btn-primary self-start" :disabled="saving">
          {{ saving ? 'Enregistrement…' : 'Enregistrer mon profil' }}
        </button>
      </form>
    </template>
  </div>
</template>

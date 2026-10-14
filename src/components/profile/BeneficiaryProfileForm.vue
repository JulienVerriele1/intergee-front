<script setup>
import { onMounted, ref } from 'vue'
import { fetchMyBeneficiaryProfile, updateMyBeneficiaryProfile } from '@/api/profileApi'
import { CESU_URL } from '@/api/wageApi'
import { missionErrorMessage } from '@/missions/missionErrors'
import { presentationError } from '@/profile/presentation'
import { isFrenchPhone, nationalPhone } from '@/registration/registrationForm'
import AddressAutocomplete from '@/components/ui/AddressAutocomplete.vue'
import AlertMessage from '@/components/ui/AlertMessage.vue'
import FormField from '@/components/ui/FormField.vue'
import PresentationField from './PresentationField.vue'

/**
 * Profile of a beneficiary (spec 012, RG-5): name and email shown, phone, address and presentation changed. The
 * presentation is required to publish a mission (RG-3), and shown to the assigned student only (RG-7).
 */
const profile = ref(null)
const status = ref('loading') // loading | ready | error
const loadError = ref('')
const form = ref(null)
const errors = ref({})
const saving = ref(false)
const saveMessage = ref(null) // { variant, text }

function toForm(source) {
  return {
    phone: nationalPhone(source.phone),
    street: source.address.street,
    postalCode: source.address.postalCode,
    city: source.address.city,
    presentation: source.presentation ?? '',
    cesuRegistered: Boolean(source.cesuRegistered),
  }
}

async function load() {
  try {
    profile.value = await fetchMyBeneficiaryProfile()
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

function validate() {
  const found = {}
  if (!isFrenchPhone(form.value.phone)) found.phone = 'Saisissez un numéro français, par exemple 06 12 34 56 78.'
  if (!form.value.street.trim()) found.street = 'Saisissez le numéro et la rue.'
  if (!/^\d{5}$/.test(form.value.postalCode)) found.postalCode = 'Saisissez un code postal de 5 chiffres.'
  if (!form.value.city.trim()) found.city = 'Saisissez la ville.'
  const presentation = presentationError(form.value.presentation)
  if (presentation) found.presentation = presentation
  return found
}

async function save() {
  saveMessage.value = null
  errors.value = validate()
  if (Object.keys(errors.value).length > 0) {
    saveMessage.value = { variant: 'error', text: 'Certains champs sont à corriger.' }
    return
  }
  saving.value = true
  try {
    profile.value = await updateMyBeneficiaryProfile({
      phone: form.value.phone,
      address: { street: form.value.street, postalCode: form.value.postalCode, city: form.value.city },
      presentation: form.value.presentation.trim(),
      cesuRegistered: form.value.cesuRegistered,
    })
    form.value = toForm(profile.value)
    saveMessage.value = { variant: 'success', text: 'Votre profil est enregistré.' }
  } catch (error) {
    saveMessage.value = { variant: 'error', text: missionErrorMessage(error) }
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="flex flex-col gap-6">
    <p v-if="status === 'loading'" role="status" class="text-ink-muted">Chargement de votre profil…</p>
    <AlertMessage v-else-if="status === 'error'" variant="error">{{ loadError }}</AlertMessage>
    <template v-else>
      <AlertMessage v-if="!profile.complete" variant="info">
        Ajoutez votre présentation pour pouvoir publier des missions.
      </AlertMessage>

      <form class="flex flex-col gap-6" novalidate @submit.prevent="save">
        <section aria-labelledby="identity-title" class="card flex flex-col gap-4">
          <h2 id="identity-title" class="text-xl font-bold">Identité</h2>
          <dl class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <dt class="font-bold text-ink-muted">Nom</dt>
              <dd class="text-lg">{{ profile.firstName }} {{ profile.lastName }}</dd>
            </div>
            <div>
              <dt class="font-bold text-ink-muted">E-mail</dt>
              <dd class="text-lg break-all">{{ profile.email }}</dd>
            </div>
          </dl>
          <FormField
            id="phone"
            label="Téléphone"
            help="Communiqué à l'étudiant que vous choisissez."
            :error="errors.phone"
            required
          >
            <template #default="{ id, describedBy, invalid }">
              <input
                :id="id"
                v-model="form.phone"
                type="tel"
                autocomplete="tel"
                class="form-input sm:w-64"
                :aria-describedby="describedBy"
                :aria-invalid="invalid"
                required
              />
            </template>
          </FormField>
        </section>

        <section aria-labelledby="presentation-title" class="card flex flex-col gap-4">
          <h2 id="presentation-title" class="text-xl font-bold">Ma présentation</h2>
          <p class="text-ink-muted">Seul l'étudiant que vous choisissez pour une mission la lit.</p>
          <PresentationField
            v-model="form.presentation"
            hint="Présentez-vous à l'étudiant qui viendra : qui vous êtes, ce que vous aimez, ce qui compte pour vous."
            :error="errors.presentation"
          />
        </section>

        <!-- The student is the employee of the beneficiary, declared through the CESU (spec 013, RG-5 and RG-11) -->
        <section aria-labelledby="cesu-title" class="card flex flex-col gap-4">
          <h2 id="cesu-title" class="text-xl font-bold">Rémunérer l'étudiant avec le CESU</h2>
          <p class="text-ink-muted">Vous êtes l'employeur de l'étudiant que vous choisissez. C'est simple :</p>
          <ol class="list-decimal space-y-1 pl-6 text-lg">
            <li>
              Inscrivez-vous une fois sur
              <a :href="CESU_URL" target="_blank" rel="noopener noreferrer" class="link">
                cesu.urssaf.fr<span class="sr-only"> (nouvel onglet)</span></a>.
            </li>
            <li>Choisissez l'option CESU+ : l'URSSAF verse le salaire à l'étudiant pour vous, et vous ne payez tout de suite que la moitié environ.</li>
            <li>Après chaque mission, déclarez l'étudiant avec la fiche que Geen prépare dans « Déclaration CESU », en haut de l'écran.</li>
          </ol>
          <label class="flex min-h-target items-center gap-3 text-lg">
            <input v-model="form.cesuRegistered" type="checkbox" class="size-6 shrink-0 accent-primary" />
            Je suis inscrit au CESU
          </label>
        </section>

        <section aria-labelledby="address-title" class="card flex flex-col gap-4">
          <h2 id="address-title" class="text-xl font-bold">Adresse</h2>
          <p class="text-ink-muted">Communiquée à l'étudiant que vous choisissez, jamais aux autres.</p>
          <FormField
            id="street"
            label="Numéro et rue"
            help="Tapez les premiers caractères, puis choisissez l'adresse proposée."
            :error="errors.street"
            required
          >
            <template #default="{ id, describedBy }">
              <AddressAutocomplete :id="id" v-model="form.street" :described-by="describedBy" required @select="fillAddress" />
            </template>
          </FormField>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-[12rem_1fr]">
            <FormField id="postal-code" label="Code postal" :error="errors.postalCode" required>
              <template #default="{ id, describedBy, invalid }">
                <input
                  :id="id"
                  v-model="form.postalCode"
                  type="text"
                  inputmode="numeric"
                  autocomplete="postal-code"
                  maxlength="5"
                  class="form-input"
                  :aria-describedby="describedBy"
                  :aria-invalid="invalid"
                  required
                />
              </template>
            </FormField>
            <FormField id="city" label="Ville" :error="errors.city" required>
              <template #default="{ id, describedBy, invalid }">
                <input
                  :id="id"
                  v-model="form.city"
                  type="text"
                  autocomplete="address-level2"
                  class="form-input"
                  :aria-describedby="describedBy"
                  :aria-invalid="invalid"
                  required
                />
              </template>
            </FormField>
          </div>
        </section>

        <AlertMessage v-if="saveMessage" :variant="saveMessage.variant">{{ saveMessage.text }}</AlertMessage>
        <button type="submit" class="btn-primary self-start" :disabled="saving">
          {{ saving ? 'Enregistrement…' : 'Enregistrer mon profil' }}
        </button>
      </form>
    </template>
  </div>
</template>

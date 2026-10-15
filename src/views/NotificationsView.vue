<script setup>
import { onMounted, ref } from 'vue'
import { fetchNotificationPreferences, updateNotificationPreferences } from '@/api/notificationApi'
import { missionErrorMessage } from '@/missions/missionErrors'
import AlertMessage from '@/components/ui/AlertMessage.vue'

/** Notifications of the beneficiary side (spec 015): the channels accepted, and what is notified by which. */
const EVENTS = [
  { label: 'Votre mission est publiée', when: 'Dès la publication', email: true, sms: false },
  { label: 'Un étudiant propose son aide', when: 'Dès chaque candidature', email: true, sms: true },
  { label: 'Rappel de la mission', when: 'La veille, à 10 h', email: true, sms: true },
  { label: 'Confirmer et évaluer la mission', when: '1 h après la fin', email: true, sms: false },
  { label: 'Déclarations CESU à faire', when: 'Le lundi, à 10 h, s’il y en a', email: true, sms: false },
]
const CHANNELS = [
  { key: 'email', label: 'Recevoir les e-mails' },
  { key: 'sms', label: 'Recevoir les SMS' },
]

const preferences = ref(null)
const status = ref('loading') // loading | ready | error
const errorMessage = ref('')
const savedMessage = ref('')
const saving = ref(false)

async function load() {
  try {
    preferences.value = await fetchNotificationPreferences()
    status.value = 'ready'
  } catch (error) {
    errorMessage.value = missionErrorMessage(error)
    status.value = 'error'
  }
}

// Saved at once: a switch acts as soon as it is flipped
async function toggle(key) {
  const wanted = { ...preferences.value, [key]: !preferences.value[key] }
  saving.value = true
  errorMessage.value = ''
  savedMessage.value = ''
  try {
    preferences.value = await updateNotificationPreferences(wanted)
    savedMessage.value = 'Vos réglages sont enregistrés.'
  } catch (error) {
    errorMessage.value = missionErrorMessage(error)
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <h1 class="text-3xl font-bold">Mes notifications</h1>
      <p class="mt-1 text-lg text-ink-muted">
        Geen vous prévient par e-mail et, pour ce qui demande d’agir vite, par SMS.
      </p>
    </div>

    <p v-if="status === 'loading'" role="status" class="text-ink-muted">Chargement de vos réglages…</p>
    <AlertMessage v-else-if="status === 'error'" variant="error">{{ errorMessage }}</AlertMessage>
    <template v-else>
      <section aria-labelledby="channels-title" class="panel flex flex-col gap-4">
        <h2 id="channels-title" class="text-2xl font-bold">Comment vous prévenir</h2>
        <div v-for="channel in CHANNELS" :key="channel.key" class="card flex items-center justify-between gap-4">
          <span :id="`channel-${channel.key}`" class="text-lg font-bold">{{ channel.label }}</span>
          <button
            type="button"
            role="switch"
            :aria-checked="preferences[channel.key]"
            :aria-labelledby="`channel-${channel.key}`"
            :disabled="saving"
            class="focus-ring relative inline-flex h-9 w-16 shrink-0 items-center rounded-full border-2 transition-colors disabled:opacity-60"
            :class="preferences[channel.key] ? 'border-primary bg-primary' : 'border-border bg-surface-sunken'"
            @click="toggle(channel.key)"
          >
            <span
              class="inline-block size-6 rounded-full bg-surface-raised shadow-card transition-transform"
              :class="preferences[channel.key] ? 'translate-x-8' : 'translate-x-1'"
              aria-hidden="true"
            />
          </button>
        </div>
        <AlertMessage v-if="savedMessage" variant="success">{{ savedMessage }}</AlertMessage>
        <AlertMessage v-if="errorMessage" variant="error">{{ errorMessage }}</AlertMessage>
        <p class="text-base text-ink-muted">
          Le rappel de la veille et les déclarations CESU vous sont envoyés par e-mail même si vous refusez les e-mails :
          ils engagent l’employeur. Aucun SMS n’est envoyé entre 20 h et 8 h : il part à 8 h.
        </p>
      </section>

      <section aria-labelledby="events-title" class="flex flex-col gap-3">
        <h2 id="events-title" class="text-2xl font-bold">Ce qui vous est notifié</h2>
        <div class="card overflow-x-auto p-0">
          <table class="w-full text-left text-lg">
            <thead class="border-b-2 border-border text-base text-ink-muted">
              <tr>
                <th scope="col" class="px-4 py-3">Événement</th>
                <th scope="col" class="px-4 py-3">Quand</th>
                <th scope="col" class="px-4 py-3">E-mail</th>
                <th scope="col" class="px-4 py-3">SMS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="event in EVENTS" :key="event.label" class="border-b border-border-subtle last:border-b-0">
                <th scope="row" class="px-4 py-3 font-bold">{{ event.label }}</th>
                <td class="px-4 py-3">{{ event.when }}</td>
                <td class="px-4 py-3">{{ event.email ? 'Oui' : 'Non' }}</td>
                <td class="px-4 py-3">{{ event.sms ? 'Oui' : 'Non' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-base text-ink-muted">
          Pour une personne que vous accompagnez, c’est vous qui êtes prévenu ; elle reçoit aussi le SMS du rappel de la
          veille.
        </p>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { fetchAssignment, withdrawApplication } from '@/api/missionApi'
import { missionErrorMessage } from '@/missions/missionErrors'
import { applicationStatus } from '@/missions/missionTracking'
import AlertMessage from '@/components/ui/AlertMessage.vue'
import MissionHeadline from './MissionHeadline.vue'
import StatusBadge from './StatusBadge.vue'

const props = defineProps({
  application: { type: Object, required: true },
})
const emit = defineEmits(['changed'])

const mission = computed(() => props.application.mission)
const titleId = computed(() => `application-${mission.value.id}-title`)
const status = computed(() => applicationStatus(props.application))
const mapUrl = computed(() => {
  const { latitude, longitude } = assignment.value.location
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`
})

const assignment = ref(null)
const busy = ref(false)
const errorMessage = ref('')

async function run(action) {
  busy.value = true
  errorMessage.value = ''
  try {
    await action()
  } catch (error) {
    errorMessage.value = missionErrorMessage(error)
  } finally {
    busy.value = false
  }
}

function showAddress() {
  return run(async () => {
    assignment.value = await fetchAssignment(mission.value.id)
  })
}

function withdraw() {
  return run(async () => {
    await withdrawApplication(mission.value.id)
    emit('changed', `Votre candidature à « ${mission.value.title} » a été retirée.`)
  })
}
</script>

<template>
  <article class="card flex flex-col gap-4" :aria-labelledby="titleId">
    <StatusBadge :status="status" class="self-end" />
    <MissionHeadline :mission="mission" :title-id="titleId" />
    <p v-if="application.applicationStatus === 'REJECTED'" class="text-base text-ink-muted">
      Le bénéficiaire a choisi un autre étudiant. Vous pouvez postuler à une autre mission sur ce créneau.
    </p>

    <AlertMessage v-if="errorMessage" variant="error">{{ errorMessage }}</AlertMessage>

    <button
      v-if="application.applicationStatus === 'PENDING'"
      type="button"
      class="btn-secondary self-start"
      :disabled="busy"
      @click="withdraw"
    >
      {{ busy ? 'Retrait en cours…' : 'Retirer ma candidature' }}
    </button>

    <!-- The address is revealed to the assigned student only (spec 006, RG-6) -->
    <template v-if="application.applicationStatus === 'ACCEPTED'">
      <button v-if="!assignment" type="button" class="btn-primary self-start" :disabled="busy" @click="showAddress">
        Voir l'adresse et le contact
      </button>
      <dl v-else class="grid grid-cols-1 gap-2 rounded-lg bg-surface-sunken p-3 text-base sm:grid-cols-2">
        <div>
          <dt class="font-bold text-ink-muted">Adresse</dt>
          <dd>
            {{ assignment.location.street }}, {{ assignment.location.postalCode }} {{ assignment.location.city }}
            <a :href="mapUrl" target="_blank" rel="noopener noreferrer" class="link ml-1">
              Voir sur la carte<span class="sr-only"> (nouvel onglet)</span>
            </a>
          </dd>
        </div>
        <div>
          <dt class="font-bold text-ink-muted">Bénéficiaire</dt>
          <dd>
            {{ assignment.beneficiary.firstName }} {{ assignment.beneficiary.lastName }} ·
            <a :href="`tel:${assignment.beneficiary.phone}`" class="link">{{ assignment.beneficiary.phone }}</a>
          </dd>
        </div>
      </dl>
    </template>
  </article>
</template>

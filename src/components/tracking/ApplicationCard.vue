<script setup>
import { computed, onMounted, ref } from 'vue'
import { fetchAssignment, withdrawApplication, withdrawFromAssignment } from '@/api/missionApi'
import {
  WITHDRAWAL_REASONS,
  cancellationReasonLabel,
  isLateWithdrawal,
  isLive,
  lateReviewOpen,
} from '@/missions/cancellation'
import { formatDateTime } from '@/utils/formatters'
import { missionErrorMessage } from '@/missions/missionErrors'
import { applicationStatus, canReview } from '@/missions/missionTracking'
import AlertMessage from '@/components/ui/AlertMessage.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import ReviewDialog from '@/components/reviews/ReviewDialog.vue'
import PresentationText from '@/components/profile/PresentationText.vue'
import MissionHeadline from './MissionHeadline.vue'
import StatusBadge from './StatusBadge.vue'
import ReasonDialog from './ReasonDialog.vue'

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

const reviewable = computed(
  () => props.application.applicationStatus === 'ACCEPTED' && canReview(props.application.completedAt, props.application.reviewSubmitted),
)
// The beneficiary cancelled less than 2 hours before: the assigned student may review them (spec 017, RG-6)
const lateCancellationReviewable = computed(() =>
  lateReviewOpen(props.application.cancellation?.reviewOpenUntil, props.application.reviewSubmitted),
)
const assigned = computed(() => props.application.applicationStatus === 'ACCEPTED' && mission.value.status === 'ASSIGNED')
// Spec 017, RG-4: until the start
const canWithdraw = computed(() => assigned.value && isLive(mission.value))
const withdrawing = ref(false)
const withdrawalError = ref('')
const withdrawalWarning = computed(() =>
  isLateWithdrawal(mission.value)
    ? 'La mission commence dans moins de 8 h : le bénéficiaire sera prévenu par e-mail et SMS, et pourra vous laisser un avis.'
    : 'Le bénéficiaire sera prévenu par e-mail et SMS, et pourra choisir un autre étudiant.',
)

async function withdrawFromMission(reason) {
  busy.value = true
  withdrawalError.value = ''
  try {
    await withdrawFromAssignment(mission.value.id, reason)
    withdrawing.value = false
    emit('changed', `Vous vous êtes désisté de « ${mission.value.title} ». Le bénéficiaire est prévenu.`)
  } catch (error) {
    withdrawalError.value = missionErrorMessage(error)
  } finally {
    busy.value = false
  }
}
const reviewing = ref(false)

function onReviewed(message) {
  reviewing.value = false
  emit('changed', message)
}

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

// The assigned student sees the address and the beneficiary straight away (spec 006, RG-6)
function loadAssignment() {
  return run(async () => {
    assignment.value = await fetchAssignment(mission.value.id)
  })
}

onMounted(() => {
  if (assigned.value || (props.application.applicationStatus === 'ACCEPTED' && mission.value.status === 'COMPLETED')) {
    loadAssignment()
  }
})

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
    <p v-if="application.cancellation" class="text-base text-ink-muted">
      Le bénéficiaire a annulé la mission le {{ formatDateTime(application.cancellation.cancelledAt) }} ·
      Motif : « {{ cancellationReasonLabel(application.cancellation.reason) }} »
    </p>
    <p v-else-if="application.applicationStatus === 'REJECTED'" class="text-base text-ink-muted">
      Le bénéficiaire a choisi un autre étudiant. Vous pouvez postuler à une autre mission sur ce créneau.
    </p>
    <template v-if="application.cancellation">
      <button v-if="lateCancellationReviewable" type="button" class="btn-primary self-start" @click="reviewing = true">
        Laisser un avis sur cette annulation tardive
      </button>
      <p v-else-if="application.cancellation.reviewOpenUntil && application.reviewSubmitted" class="text-sm font-semibold text-green-800">
        Avis envoyé
      </p>
    </template>

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
    <template v-if="application.applicationStatus === 'ACCEPTED' && !application.cancellation">
      <p v-if="!assignment && busy" role="status" class="text-ink-muted">Chargement de l’adresse et du contact…</p>
      <dl v-if="assignment" class="grid grid-cols-1 gap-2 rounded-lg bg-surface-sunken p-3 text-base sm:grid-cols-2">
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
      <!-- Shown to the assigned student only (spec 012, RG-7) -->
      <PresentationText
        v-if="assignment?.beneficiary.presentation"
        :text="assignment.beneficiary.presentation"
        :title="`Présentation de ${assignment.beneficiary.firstName}`"
        open
      />
      <!-- Declared to the CESU by the employer, as they say (spec 013, RG-9) -->
      <p v-if="application.completedAt" class="tag self-start" :class="application.declared ? 'bg-success-soft' : 'bg-accent-soft'">
        <AppIcon :name="application.declared ? 'check' : 'clock'" :class="application.declared ? 'text-success' : 'text-ink'" />
        {{ application.declared ? 'Déclarée au CESU' : 'En attente de déclaration au CESU' }}
      </p>
      <button v-if="reviewable" type="button" class="btn-primary self-start" @click="reviewing = true">Laisser un avis</button>
      <p v-else-if="application.reviewSubmitted" class="text-sm font-semibold text-green-800">Avis envoyé</p>
      <button v-if="canWithdraw" type="button" class="btn-secondary self-start" @click="withdrawing = true">Me désister</button>
    </template>

    <ReasonDialog
      v-if="withdrawing"
      title="Vous désister de cette mission ?"
      confirm-label="Me désister"
      :reasons="WITHDRAWAL_REASONS"
      :warning="withdrawalWarning"
      :busy="busy"
      :error-message="withdrawalError"
      @confirm="withdrawFromMission"
      @cancel="withdrawing = false; withdrawalError = ''"
    >
      Vous ne viendrez pas pour « {{ mission.title }} » et ne pourrez plus postuler à cette mission. Ce désistement est
      définitif.
    </ReasonDialog>

    <ReviewDialog
      v-if="reviewing"
      :mission-id="mission.id"
      subject="le bénéficiaire de cette mission"
      :one-sided="Boolean(application.cancellation)"
      @submitted="onReviewed"
      @cancel="reviewing = false"
    />
  </article>
</template>

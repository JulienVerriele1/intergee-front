<script setup>
import { computed, ref } from 'vue'
import { assignMission, completeMission, fetchApplications, fetchAssignment } from '@/api/missionApi'
import { missionErrorMessage } from '@/missions/missionErrors'
import { isOver, publishedMissionStatus } from '@/missions/missionTracking'
import { formatDateTime } from '@/utils/formatters'
import AlertMessage from '@/components/ui/AlertMessage.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import MissionHeadline from './MissionHeadline.vue'
import StatusBadge from './StatusBadge.vue'
import AppIcon from '@/components/ui/AppIcon.vue'

const props = defineProps({
  mission: { type: Object, required: true },
  /** A caregiver follows several beneficiaries: their first name tells the missions apart (spec 009, Q1) */
  showBeneficiary: { type: Boolean, default: false },
})
const emit = defineEmits(['changed'])

const titleId = computed(() => `published-${props.mission.id}-title`)
const status = computed(() => publishedMissionStatus(props.mission))
const canConfirm = computed(() => props.mission.status === 'ASSIGNED' && isOver(props.mission))
const hasStudent = computed(() => ['ASSIGNED', 'COMPLETED'].includes(props.mission.status))

const candidates = ref(null)
const assignment = ref(null)
const loading = ref(false)
const errorMessage = ref('')
// Irreversible actions waiting for a confirmation: { type: 'assign', candidate } or { type: 'complete' }
const pendingConfirmation = ref(null)
const sending = ref(false)

async function load(request) {
  loading.value = true
  errorMessage.value = ''
  try {
    return await request(props.mission.id)
  } catch (error) {
    errorMessage.value = missionErrorMessage(error)
    return null
  } finally {
    loading.value = false
  }
}

async function toggleCandidates() {
  candidates.value = candidates.value ? null : await load(fetchApplications)
}

async function showAssignment() {
  assignment.value = await load(fetchAssignment)
}

async function confirm() {
  sending.value = true
  errorMessage.value = ''
  const { type, candidate } = pendingConfirmation.value
  try {
    if (type === 'assign') {
      await assignMission(props.mission.id, candidate.applicantId)
      emit('changed', `${candidate.firstName} réalisera la mission « ${props.mission.title} ». Ses coordonnées sont disponibles sur la mission.`)
    } else {
      await completeMission(props.mission.id)
      emit('changed', `Merci ! La mission « ${props.mission.title} » est terminée.`)
    }
  } catch (error) {
    errorMessage.value = missionErrorMessage(error)
  } finally {
    sending.value = false
    pendingConfirmation.value = null
  }
}
</script>

<template>
  <article class="card flex flex-col gap-4" :aria-labelledby="titleId">
    <div class="flex flex-wrap items-start justify-between gap-2">
      <p v-if="showBeneficiary" class="text-base font-bold text-ink-muted">Pour {{ mission.beneficiary.firstName }}</p>
      <StatusBadge :status="status" class="ml-auto" />
    </div>
    <MissionHeadline :mission="mission" :title-id="titleId" />

    <AlertMessage v-if="errorMessage" variant="error">{{ errorMessage }}</AlertMessage>

    <!-- Candidates: only while the beneficiary chooses -->
    <div v-if="mission.status === 'APPLIED'" class="flex flex-col gap-3">
      <button
        type="button"
        class="btn-secondary self-start"
        :aria-expanded="candidates !== null"
        :aria-controls="`${titleId}-candidates`"
        :disabled="loading"
        @click="toggleCandidates"
      >
        {{ candidates ? 'Masquer les candidats' : 'Voir les candidats' }}
      </button>
      <ul v-if="candidates" :id="`${titleId}-candidates`" role="list" class="flex flex-col gap-3">
        <li
          v-for="candidate in candidates"
          :key="candidate.applicantId"
          class="flex flex-col gap-2 rounded-lg border border-border-subtle p-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p class="font-bold">
              {{ candidate.firstName }}
              <span v-if="candidate.verified" class="tag ml-1 bg-primary-soft align-middle">
                <AppIcon name="shield" class="text-primary-ink" />
                Étudiant vérifié
              </span>
            </p>
            <p class="text-base text-ink-muted">{{ candidate.school }} · candidature du {{ formatDateTime(candidate.appliedAt) }}</p>
          </div>
          <button type="button" class="btn-primary" @click="pendingConfirmation = { type: 'assign', candidate }">
            Choisir {{ candidate.firstName }}
          </button>
        </li>
      </ul>
    </div>

    <!-- Assigned student: contact revealed by the assignment (spec 006) -->
    <div v-if="hasStudent" class="flex flex-col gap-3">
      <button
        v-if="!assignment"
        type="button"
        class="btn-secondary self-start"
        :disabled="loading"
        @click="showAssignment"
      >
        Voir le contact de {{ mission.assignedStudentFirstName }}
      </button>
      <dl v-else class="grid grid-cols-1 gap-1 rounded-lg bg-surface-sunken p-3 text-base sm:grid-cols-2">
        <div>
          <dt class="font-bold text-ink-muted">Étudiant</dt>
          <dd>{{ assignment.student.firstName }} {{ assignment.student.lastName }} · {{ assignment.student.school }}</dd>
        </div>
        <div>
          <dt class="font-bold text-ink-muted">Email</dt>
          <dd><a :href="`mailto:${assignment.student.email}`" class="link">{{ assignment.student.email }}</a></dd>
        </div>
      </dl>
      <button v-if="canConfirm" type="button" class="btn-primary self-start" @click="pendingConfirmation = { type: 'complete' }">
        Confirmer que la mission a eu lieu
      </button>
    </div>

    <ConfirmDialog
      v-if="pendingConfirmation?.type === 'assign'"
      :title="`Choisir ${pendingConfirmation.candidate.firstName} ?`"
      :confirm-label="`Choisir ${pendingConfirmation.candidate.firstName}`"
      :busy="sending"
      @confirm="confirm"
      @cancel="pendingConfirmation = null"
    >
      {{ pendingConfirmation.candidate.firstName }} réalisera la mission « {{ mission.title }} » et recevra votre adresse.
      Les autres candidatures seront refusées. Ce choix est définitif.
    </ConfirmDialog>
    <ConfirmDialog
      v-if="pendingConfirmation?.type === 'complete'"
      title="Confirmer que la mission a eu lieu ?"
      confirm-label="Oui, la mission a eu lieu"
      :busy="sending"
      @confirm="confirm"
      @cancel="pendingConfirmation = null"
    >
      La mission « {{ mission.title }} » sera marquée comme terminée. Cette confirmation est définitive.
    </ConfirmDialog>
  </article>
</template>

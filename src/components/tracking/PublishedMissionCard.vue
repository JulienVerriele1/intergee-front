<script setup>
import { computed, inject, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { assignMission, cancelMission, completeMission, fetchApplications, fetchAssignment } from '@/api/missionApi'
import {
  CANCELLATION_REASONS,
  cancellationReasonLabel,
  isLateCancellation,
  isLive,
  lateReviewOpen,
} from '@/missions/cancellation'
import { missionErrorMessage } from '@/missions/missionErrors'
import { canReview, isOver, publishedMissionStatus } from '@/missions/missionTracking'
import { formatDateTime } from '@/utils/formatters'
import AlertMessage from '@/components/ui/AlertMessage.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import ReviewDialog from '@/components/reviews/ReviewDialog.vue'
import CandidateReviews from '@/components/reviews/CandidateReviews.vue'
import StarRating from '@/components/reviews/StarRating.vue'
import StudentPhoto from '@/components/ui/StudentPhoto.vue'
import { skillLabel, studyLevelLabel } from '@/constants/profileOptions'
import PresentationText from '@/components/profile/PresentationText.vue'
import MissionHeadline from './MissionHeadline.vue'
import StatusBadge from './StatusBadge.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import CesuReminder from '@/components/missions/CesuReminder.vue'
import ReasonDialog from './ReasonDialog.vue'

const props = defineProps({
  mission: { type: Object, required: true },
  /** A caregiver follows several beneficiaries: their first name tells the missions apart (spec 009, Q1) */
  showBeneficiary: { type: Boolean, default: false },
})
const emit = defineEmits(['changed'])
// Reminded until the beneficiary says they are registered to the CESU (spec 013, RG-5); provided by « Mes missions »
const showCesuReminder = inject('showCesuReminder', ref(true))

const titleId = computed(() => `published-${props.mission.id}-title`)
const status = computed(() => publishedMissionStatus(props.mission))
const canConfirm = computed(() => props.mission.status === 'ASSIGNED' && isOver(props.mission))
const hasStudent = computed(() => ['ASSIGNED', 'COMPLETED'].includes(props.mission.status))
const reviewable = computed(() => canReview(props.mission.completedAt, props.mission.reviewSubmitted))
const reviewing = ref(false)
// The student who withdrew late, being reviewed (spec 017, RG-6)
const reviewingWithdrawal = ref(null)

function onReviewed(message) {
  reviewing.value = false
  reviewingWithdrawal.value = null
  emit('changed', message)
}

// Spec 017: changed or cancelled until it starts
const live = computed(() => isLive(props.mission))
const cancelling = ref(false)
const cancelError = ref('')
const cancellationWarning = computed(() => {
  const student = props.mission.assignedStudentFirstName
  if (isLateCancellation(props.mission)) {
    return `La mission commence dans moins de 2 h : ${student} sera prévenu par e-mail et SMS, et pourra vous laisser un avis.`
  }
  if (props.mission.status === 'ASSIGNED') {
    return `${student} sera prévenu par e-mail et SMS.`
  }
  return props.mission.status === 'APPLIED' ? 'Les étudiants qui ont proposé leur aide seront prévenus par e-mail.' : ''
})

async function cancel(reason) {
  sending.value = true
  cancelError.value = ''
  try {
    await cancelMission(props.mission.id, reason)
    cancelling.value = false
    emit('changed', `La mission « ${props.mission.title} » est annulée.`)
  } catch (error) {
    cancelError.value = missionErrorMessage(error)
  } finally {
    sending.value = false
  }
}

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

// The candidates and the assigned student are shown straight away, with the details of the mission
async function loadStudents() {
  if (props.mission.status === 'APPLIED') {
    candidates.value = await load(fetchApplications)
  }
  if (hasStudent.value) {
    assignment.value = await load(fetchAssignment)
  }
}

onMounted(loadStudents)

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

    <p v-if="mission.cancellation" class="text-base text-ink-muted">
      Annulée le {{ formatDateTime(mission.cancellation.cancelledAt) }} · Motif : « {{ cancellationReasonLabel(mission.cancellation.reason) }} »
    </p>

    <!-- Spec 017: changed or cancelled until it starts -->
    <div v-if="live" class="flex flex-wrap gap-3">
      <RouterLink :to="{ name: 'edit-mission', params: { id: mission.id } }" class="btn-secondary">
        <AppIcon name="pencil" :size="20" />
        Modifier
      </RouterLink>
      <button type="button" class="btn-secondary" @click="cancelling = true">Annuler la mission</button>
    </div>

    <!-- Students who withdrew late may be reviewed (spec 017, RG-6) -->
    <ul v-if="mission.lateWithdrawals?.length" role="list" class="flex flex-col gap-2">
      <li v-for="withdrawal in mission.lateWithdrawals" :key="withdrawal.studentId" class="flex flex-col gap-2 rounded-lg bg-accent-soft p-3">
        <p class="text-base">
          {{ withdrawal.firstName }} s’est désisté moins de 8 h avant la mission, le {{ formatDateTime(withdrawal.withdrawnAt) }}.
        </p>
        <button
          v-if="lateReviewOpen(withdrawal.reviewOpenUntil, withdrawal.reviewSubmitted)"
          type="button"
          class="btn-secondary self-start"
          @click="reviewingWithdrawal = withdrawal"
        >
          Évaluer {{ withdrawal.firstName }}
        </button>
        <p v-else-if="withdrawal.reviewSubmitted" class="text-sm font-semibold text-green-800">Avis envoyé</p>
      </li>
    </ul>

    <AlertMessage v-if="errorMessage" variant="error">{{ errorMessage }}</AlertMessage>

    <!-- Candidates: only while the beneficiary chooses -->
    <div v-if="mission.status === 'APPLIED'" class="flex flex-col gap-3">
      <h4 class="text-lg font-bold">Candidats</h4>
      <p v-if="loading && !candidates" role="status" class="text-ink-muted">Chargement des candidats…</p>
      <ul v-if="candidates" role="list" class="flex flex-col gap-3">
        <li
          v-for="candidate in candidates"
          :key="candidate.applicantId"
          class="flex flex-col gap-2 rounded-lg border border-border-subtle p-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="flex items-start gap-3">
            <StudentPhoto :student-id="candidate.applicantId" :first-name="candidate.firstName" :has-photo="candidate.hasPhoto" :size="64" />
            <div>
              <p class="font-bold">
                {{ candidate.firstName }}<template v-if="candidate.age">, {{ candidate.age }} ans</template>
                <span v-if="candidate.verified" class="tag ml-1 bg-primary-soft align-middle">
                  <AppIcon name="shield" class="text-primary-ink" />
                  Étudiant vérifié
                </span>
              </p>
              <p class="text-base text-ink-muted">
                {{ candidate.school }}<template v-if="candidate.studyLevel"> · {{ studyLevelLabel(candidate.studyLevel) }}</template>
                · candidature du {{ formatDateTime(candidate.appliedAt) }}
              </p>
              <StarRating :average-rating="candidate.averageRating" :review-count="candidate.reviewCount" />
              <CandidateReviews
                v-if="candidate.reviewCount > 0"
                :student-id="candidate.applicantId"
                :first-name="candidate.firstName"
                :review-count="candidate.reviewCount"
                class="mt-1"
              />
              <p v-if="candidate.matchingSkills?.length" class="mt-2 font-bold text-success">
                {{ candidate.matchingSkills.length }} compétence{{ candidate.matchingSkills.length > 1 ? 's' : '' }} demandée{{ candidate.matchingSkills.length > 1 ? 's' : '' }} pour cette mission
              </p>
              <ul v-if="candidate.skills?.length" role="list" :aria-label="`Compétences de ${candidate.firstName}`" class="mt-2 flex flex-wrap gap-2">
                <li
                  v-for="skill in candidate.skills"
                  :key="skill"
                  class="tag"
                  :class="candidate.matchingSkills?.includes(skill) ? 'bg-success-soft' : 'bg-accent-soft pl-3'"
                >
                  <AppIcon v-if="candidate.matchingSkills?.includes(skill)" name="check" class="text-success" />
                  {{ skillLabel(skill) }}
                  <span v-if="candidate.matchingSkills?.includes(skill)" class="sr-only">(demandée pour la mission)</span>
                </li>
              </ul>
              <!-- To choose knowing who will come (spec 012, RG-6) -->
              <PresentationText
                v-if="candidate.presentation"
                :text="candidate.presentation"
                :title="`Présentation de ${candidate.firstName}`"
                class="mt-3"
              />
            </div>
          </div>
          <button type="button" class="btn-primary" @click="pendingConfirmation = { type: 'assign', candidate }">
            Choisir {{ candidate.firstName }}
          </button>
        </li>
      </ul>
    </div>

    <!-- Assigned student: contact revealed by the assignment (spec 006) -->
    <div v-if="hasStudent" class="flex flex-col gap-3">
      <p v-if="loading && !assignment" role="status" class="text-ink-muted">Chargement du contact de l’étudiant…</p>
      <div v-if="assignment" class="flex items-center gap-3 rounded-lg bg-surface-sunken p-3">
        <StudentPhoto :student-id="assignment.student.id" :first-name="assignment.student.firstName" :size="64" />
        <dl class="grid flex-1 grid-cols-1 gap-1 text-base sm:grid-cols-2">
          <div>
            <dt class="font-bold text-ink-muted">Étudiant</dt>
            <dd>{{ assignment.student.firstName }} {{ assignment.student.lastName }} · {{ assignment.student.school }}</dd>
          </div>
          <div>
            <dt class="font-bold text-ink-muted">Email</dt>
            <dd><a :href="`mailto:${assignment.student.email}`" class="link">{{ assignment.student.email }}</a></dd>
          </div>
        </dl>
      </div>
      <PresentationText
        v-if="assignment?.student.presentation"
        :text="assignment.student.presentation"
        :title="`Présentation de ${assignment.student.firstName}`"
        open
      />
      <button v-if="canConfirm" type="button" class="btn-primary self-start" @click="pendingConfirmation = { type: 'complete' }">
        Confirmer que la mission a eu lieu
      </button>
      <button v-if="reviewable" type="button" class="btn-primary self-start" @click="reviewing = true">
        Évaluer {{ mission.assignedStudentFirstName }}
      </button>
      <p v-else-if="mission.reviewSubmitted" class="text-sm font-semibold text-green-800">Avis envoyé</p>
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
      <span class="mt-3 block">
        Après la mission, vous déclarerez {{ pendingConfirmation.candidate.firstName }} au CESU. Son numéro de sécurité
        sociale vous sera donné directement : Geen ne le demande jamais.
      </span>
      <CesuReminder v-if="showCesuReminder" :student-first-name="pendingConfirmation.candidate.firstName" class="mt-3" />
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
    <ReasonDialog
      v-if="cancelling"
      title="Annuler la mission ?"
      confirm-label="Annuler la mission"
      :reasons="CANCELLATION_REASONS"
      :warning="cancellationWarning"
      :busy="sending"
      :error-message="cancelError"
      @confirm="cancel"
      @cancel="cancelling = false; cancelError = ''"
    >
      La mission « {{ mission.title }} » ne sera plus proposée aux étudiants. Cette annulation est définitive.
    </ReasonDialog>
    <ReviewDialog
      v-if="reviewingWithdrawal"
      :mission-id="mission.id"
      :subject="reviewingWithdrawal.firstName"
      :student-id="reviewingWithdrawal.studentId"
      one-sided
      @submitted="onReviewed"
      @cancel="reviewingWithdrawal = null"
    />
    <ReviewDialog
      v-if="reviewing"
      :mission-id="mission.id"
      :subject="mission.assignedStudentFirstName"
      @submitted="onReviewed"
      @cancel="reviewing = false"
    />
  </article>
</template>

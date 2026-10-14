<script setup>
import { ref } from 'vue'
import { reportComment } from '@/api/reviewApi'
import { categoryLabel } from '@/constants/missionCategories'
import { REPORT_REASONS } from '@/constants/reportReasons'
import { missionErrorMessage } from '@/missions/missionErrors'
import AlertMessage from '@/components/ui/AlertMessage.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import StarRating from './StarRating.vue'

/**
 * Published reviews: the first name of the author, the month, the category, the stars, then the comment, or that it
 * was removed (spec 014, RG-4 and RG-7). The reviewed person reports a comment from here (RG-5).
 */
const props = defineProps({
  /** Items of GET /users/{id}/reviews */
  reviews: { type: Array, required: true },
})
const emit = defineEmits(['reported'])

const monthFormatter = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' })
const reporting = ref(null) // the review being reported
const reason = ref('')
const sending = ref(false)
const errorMessage = ref('')
const reportedMessage = ref('')

function startReport(review) {
  reporting.value = review
  reason.value = ''
  errorMessage.value = ''
}

async function sendReport() {
  sending.value = true
  errorMessage.value = ''
  try {
    await reportComment(reporting.value.id, reason.value)
    reportedMessage.value = 'Merci : le commentaire est masqué, l’équipe Geen va le vérifier.'
    reporting.value = null
    emit('reported')
  } catch (error) {
    errorMessage.value = missionErrorMessage(error)
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <AlertMessage v-if="reportedMessage" variant="success">{{ reportedMessage }}</AlertMessage>
    <ul role="list" class="flex flex-col gap-3">
      <li v-for="review in props.reviews" :key="review.id" class="flex flex-col gap-1 rounded-lg bg-surface-sunken p-3">
        <p class="text-base font-bold">
          {{ review.authorFirstName }}
          <span class="font-normal text-ink-muted">
            · {{ monthFormatter.format(new Date(review.createdAt)) }} · {{ categoryLabel(review.missionCategory) }}
          </span>
        </p>
        <StarRating :average-rating="review.rating" :review-count="1" :show-count="false" />
        <p v-if="review.comment" class="text-base leading-7 whitespace-pre-line">« {{ review.comment }} »</p>
        <p v-else-if="review.commentRemoved" class="text-base text-ink-muted italic">Commentaire retiré</p>
        <button v-if="review.reportable" type="button" class="link self-start text-base" @click="startReport(review)">
          Signaler ce commentaire
        </button>
      </li>
    </ul>

    <ConfirmDialog
      v-if="reporting"
      title="Signaler ce commentaire"
      confirm-label="Signaler"
      :busy="sending"
      :confirm-disabled="!reason"
      @confirm="sendReport"
      @cancel="reporting = null"
    >
      <div class="flex flex-col gap-3">
        <p>Le commentaire sera masqué aussitôt, puis vérifié par l'équipe Geen. Votre note reste visible.</p>
        <fieldset class="flex flex-col gap-2">
          <legend class="mb-1 font-bold">Pourquoi ?</legend>
          <label v-for="option in REPORT_REASONS" :key="option.value" class="flex min-h-11 items-center gap-3">
            <input v-model="reason" type="radio" name="report-reason" :value="option.value" class="size-5 accent-primary" />
            {{ option.label }}
          </label>
        </fieldset>
        <AlertMessage v-if="errorMessage" variant="error">{{ errorMessage }}</AlertMessage>
      </div>
    </ConfirmDialog>
  </div>
</template>

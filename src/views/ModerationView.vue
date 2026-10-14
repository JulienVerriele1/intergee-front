<script setup>
import { onMounted, ref } from 'vue'
import { fetchReportedComments, removeComment, restoreComment } from '@/api/reviewApi'
import { categoryLabel } from '@/constants/missionCategories'
import { reportReasonLabel } from '@/constants/reportReasons'
import { missionErrorMessage } from '@/missions/missionErrors'
import { formatDateTime } from '@/utils/formatters'
import AlertMessage from '@/components/ui/AlertMessage.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import StarRating from '@/components/reviews/StarRating.vue'

/** The Geen team decides on the comments hidden by a report (spec 014, RG-6): restore, or remove for good. */
const reported = ref([])
const status = ref('loading') // loading | ready | error
const errorMessage = ref('')
const successMessage = ref('')
const pending = ref(null) // { comment, decision: 'restore' | 'remove' }
const sending = ref(false)

const DECISIONS = {
  restore: {
    title: 'Rétablir ce commentaire ?',
    label: 'Rétablir',
    text: 'Il redevient visible, et ne pourra plus être signalé.',
    done: 'Commentaire rétabli.',
    action: restoreComment,
  },
  remove: {
    title: 'Supprimer ce commentaire ?',
    label: 'Supprimer',
    text: 'Il disparaît définitivement ; les lecteurs voient « Commentaire retiré ». La note reste.',
    done: 'Commentaire supprimé.',
    action: removeComment,
  },
}

async function load() {
  try {
    reported.value = await fetchReportedComments()
    status.value = 'ready'
  } catch (error) {
    errorMessage.value = missionErrorMessage(error)
    status.value = 'error'
  }
}

async function confirm() {
  const decision = DECISIONS[pending.value.decision]
  sending.value = true
  errorMessage.value = ''
  try {
    await decision.action(pending.value.comment.reviewId)
    successMessage.value = decision.done
    pending.value = null
    await load()
  } catch (error) {
    errorMessage.value = missionErrorMessage(error)
    pending.value = null
  } finally {
    sending.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <h1 class="text-3xl font-bold">Modération</h1>
      <p class="mt-1 text-lg text-ink-muted">
        Commentaires signalés par la personne notée, masqués en attendant votre décision, du plus ancien au plus récent.
      </p>
    </div>

    <AlertMessage v-if="successMessage" variant="success">{{ successMessage }}</AlertMessage>
    <AlertMessage v-if="errorMessage && status !== 'error'" variant="error">{{ errorMessage }}</AlertMessage>
    <p v-if="status === 'loading'" role="status" class="text-ink-muted">Chargement des signalements…</p>
    <AlertMessage v-else-if="status === 'error'" variant="error">{{ errorMessage }}</AlertMessage>
    <template v-else>
      <p v-if="reported.length === 0" role="status" class="panel text-lg">Aucun commentaire signalé : tout est à jour.</p>
      <ul v-else role="list" class="flex flex-col gap-4">
        <li v-for="comment in reported" :key="comment.reviewId">
          <article class="card flex flex-col gap-3" :aria-labelledby="`reported-${comment.reviewId}`">
            <h2 :id="`reported-${comment.reviewId}`" class="text-xl font-bold">
              Avis de {{ comment.authorFirstName }} sur {{ comment.reviewedFirstName }}
            </h2>
            <p class="text-base text-ink-muted">
              {{ categoryLabel(comment.missionCategory) }} · signalé le
              <time :datetime="comment.reportedAt">{{ formatDateTime(comment.reportedAt) }}</time>
            </p>
            <StarRating :average-rating="comment.rating" :review-count="1" :show-count="false" />
            <blockquote class="rounded-lg bg-surface-sunken p-3 text-lg leading-7 whitespace-pre-line">{{ comment.comment }}</blockquote>
            <p class="tag self-start bg-accent-soft pl-3">Motif : {{ reportReasonLabel(comment.reason) }}</p>
            <div class="flex flex-wrap gap-3">
              <button type="button" class="btn-secondary" @click="pending = { comment, decision: 'restore' }">Rétablir</button>
              <button type="button" class="btn-primary" @click="pending = { comment, decision: 'remove' }">Supprimer</button>
            </div>
          </article>
        </li>
      </ul>
    </template>

    <ConfirmDialog
      v-if="pending"
      :title="DECISIONS[pending.decision].title"
      :confirm-label="DECISIONS[pending.decision].label"
      :busy="sending"
      @confirm="confirm"
      @cancel="pending = null"
    >
      {{ DECISIONS[pending.decision].text }}
    </ConfirmDialog>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { submitReview } from '@/api/reviewApi'
import { missionErrorMessage } from '@/missions/missionErrors'
import AlertMessage from '@/components/ui/AlertMessage.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import StarRatingInput from './StarRatingInput.vue'

/** A rating, and an optional comment (spec 014, RG-1). Render it with v-if, as ConfirmDialog. */
const props = defineProps({
  missionId: { type: String, required: true },
  /** Who or what is reviewed, e.g. "Léa" or "votre échange avec le bénéficiaire" */
  subject: { type: String, required: true },
})
const emit = defineEmits(['submitted', 'cancel'])

const COMMENT_MAX = 500

const rating = ref(null)
const comment = ref('')
const commentLength = computed(() => [...comment.value.trim()].length)
const sending = ref(false)
const errorMessage = ref('')

async function send() {
  sending.value = true
  errorMessage.value = ''
  try {
    await submitReview(props.missionId, rating.value, comment.value)
    emit('submitted', 'Merci pour votre avis ! Il sera visible dès que l’autre partie aura donné le sien, ou dans 14 jours.')
  } catch (error) {
    errorMessage.value = missionErrorMessage(error)
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <ConfirmDialog
    title="Laisser un avis"
    confirm-label="Envoyer mon avis"
    :busy="sending"
    :confirm-disabled="rating === null || commentLength > COMMENT_MAX"
    @confirm="send"
    @cancel="emit('cancel')"
  >
    <div class="flex flex-col gap-4">
      <StarRatingInput v-model="rating" :legend="`Votre note pour ${subject}`" />
      <div class="flex flex-col gap-2">
        <label for="review-comment" class="text-lg font-bold">Commentaire <span class="font-normal text-ink-muted">(facultatif)</span></label>
        <p id="review-comment-help" class="text-base text-ink-muted">
          Restez factuel et bienveillant. N'indiquez aucune information sur la santé ni aucun nom.
        </p>
        <textarea
          id="review-comment"
          v-model="comment"
          rows="4"
          class="form-input resize-y leading-7"
          aria-describedby="review-comment-help review-comment-count"
          :aria-invalid="commentLength > COMMENT_MAX || undefined"
        />
        <p id="review-comment-count" class="self-end text-base" :class="commentLength > COMMENT_MAX ? 'font-bold text-danger' : 'text-ink-muted'">
          {{ commentLength }} / {{ COMMENT_MAX }}
        </p>
      </div>
      <p class="text-base text-ink-muted">
        Votre avis est définitif. Il reste caché jusqu'à ce que l'autre partie ait noté, puis il est publié signé d'un prénom, jamais d'un nom de famille.
      </p>
      <AlertMessage v-if="errorMessage" variant="error">{{ errorMessage }}</AlertMessage>
    </div>
  </ConfirmDialog>
</template>

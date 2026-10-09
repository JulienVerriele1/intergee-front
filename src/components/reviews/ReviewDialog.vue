<script setup>
import { ref } from 'vue'
import { submitReview } from '@/api/reviewApi'
import { missionErrorMessage } from '@/missions/missionErrors'
import AlertMessage from '@/components/ui/AlertMessage.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import StarRatingInput from './StarRatingInput.vue'

/** Rating only: no free comment in this first version (spec 007, RG-4). Render it with v-if, as ConfirmDialog. */
const props = defineProps({
  missionId: { type: String, required: true },
  /** Who or what is reviewed, e.g. "Léa" or "votre échange avec le bénéficiaire" */
  subject: { type: String, required: true },
})
const emit = defineEmits(['submitted', 'cancel'])

const rating = ref(null)
const sending = ref(false)
const errorMessage = ref('')

async function send() {
  sending.value = true
  errorMessage.value = ''
  try {
    await submitReview(props.missionId, rating.value)
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
    :confirm-disabled="rating === null"
    @confirm="send"
    @cancel="emit('cancel')"
  >
    <div class="flex flex-col gap-4">
      <StarRatingInput v-model="rating" :legend="`Votre note pour ${subject}`" />
      <p class="text-sm text-slate-600">Votre note est définitive. Elle reste cachée jusqu'à ce que l'autre partie ait noté.</p>
      <AlertMessage v-if="errorMessage" variant="error">{{ errorMessage }}</AlertMessage>
    </div>
  </ConfirmDialog>
</template>

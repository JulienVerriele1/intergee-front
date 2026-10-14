<script setup>
import { ref } from 'vue'
import { fetchUserReviews } from '@/api/reviewApi'
import { missionErrorMessage } from '@/missions/missionErrors'
import AlertMessage from '@/components/ui/AlertMessage.vue'
import ReviewList from './ReviewList.vue'

/** The reviews of a candidate, loaded on demand while choosing (spec 007, RG-8; spec 014): never reportable here. */
const props = defineProps({
  studentId: { type: String, required: true },
  firstName: { type: String, required: true },
  reviewCount: { type: Number, required: true },
})

const expanded = ref(false)
const reviews = ref(null)
const errorMessage = ref('')

async function toggle() {
  expanded.value = !expanded.value
  if (!expanded.value || reviews.value) {
    return
  }
  try {
    reviews.value = (await fetchUserReviews(props.studentId)).items
  } catch (error) {
    errorMessage.value = missionErrorMessage(error)
  }
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <button
      type="button"
      class="link self-start text-base"
      :aria-expanded="expanded"
      :aria-controls="`reviews-of-${studentId}`"
      @click="toggle"
    >
      {{ expanded ? 'Masquer les avis' : `Lire les avis sur ${firstName} (${reviewCount})` }}
    </button>
    <div v-if="expanded" :id="`reviews-of-${studentId}`">
      <AlertMessage v-if="errorMessage" variant="error">{{ errorMessage }}</AlertMessage>
      <p v-else-if="!reviews" role="status" class="text-ink-muted">Chargement des avis…</p>
      <ReviewList v-else :reviews="reviews" />
    </div>
  </div>
</template>

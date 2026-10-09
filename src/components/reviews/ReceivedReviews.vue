<script setup>
import { onMounted, ref } from 'vue'
import { fetchMyReputations, fetchUserReviews } from '@/api/reviewApi'
import { categoryLabel } from '@/constants/missionCategories'
import { missionErrorMessage } from '@/missions/missionErrors'
import { formatDateTime } from '@/utils/formatters'
import AlertMessage from '@/components/ui/AlertMessage.vue'
import StarRating from './StarRating.vue'

/** Reputation of the user, or of every beneficiary a caregiver manages, at the top of "Mes missions" (spec 007, Q7). */
defineProps({
  showNames: { type: Boolean, default: false },
})

const reputations = ref([])
const details = ref({}) // userId -> page of reviews
const errorMessage = ref('')

async function load() {
  try {
    reputations.value = await fetchMyReputations()
  } catch (error) {
    errorMessage.value = missionErrorMessage(error)
  }
}

async function toggleDetails(userId) {
  if (details.value[userId]) {
    const { [userId]: _hidden, ...others } = details.value
    details.value = others
    return
  }
  try {
    details.value = { ...details.value, [userId]: await fetchUserReviews(userId) }
  } catch (error) {
    errorMessage.value = missionErrorMessage(error)
  }
}

onMounted(load)
</script>

<template>
  <section v-if="reputations.length > 0 || errorMessage" aria-labelledby="received-reviews-title" class="card flex flex-col gap-3">
    <h2 id="received-reviews-title" class="text-lg font-bold">Avis reçus</h2>
    <AlertMessage v-if="errorMessage" variant="error">{{ errorMessage }}</AlertMessage>
    <ul role="list" class="flex flex-col gap-3">
      <li v-for="person in reputations" :key="person.userId" class="flex flex-col gap-2">
        <div class="flex flex-wrap items-center gap-3">
          <span v-if="showNames" class="font-semibold">{{ person.firstName }}</span>
          <StarRating :average-rating="person.averageRating" :review-count="person.reviewCount" />
          <button
            v-if="person.reviewCount > 0"
            type="button"
            class="font-semibold text-blue-800 underline"
            :aria-expanded="Boolean(details[person.userId])"
            @click="toggleDetails(person.userId)"
          >
            {{ details[person.userId] ? 'Masquer les avis' : 'Voir les avis' }}
          </button>
        </div>
        <ul v-if="details[person.userId]" role="list" class="flex flex-col gap-1 text-sm">
          <li v-for="(review, index) in details[person.userId].items" :key="index" class="flex flex-wrap gap-2">
            <StarRating :average-rating="review.rating" :review-count="1" :show-count="false" />
            <span>{{ categoryLabel(review.missionCategory) }} · {{ formatDateTime(review.createdAt) }}</span>
          </li>
        </ul>
      </li>
    </ul>
  </section>
</template>

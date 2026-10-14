<script setup>
import { onMounted, ref } from 'vue'
import { fetchMyReputations, fetchUserReviews } from '@/api/reviewApi'
import { missionErrorMessage } from '@/missions/missionErrors'
import AlertMessage from '@/components/ui/AlertMessage.vue'
import ReviewList from './ReviewList.vue'
import StarRating from './StarRating.vue'

/** Reputation of the user, or of every beneficiary a caregiver manages, in the account menu (spec 007, Q7). */
defineProps({
  showNames: { type: Boolean, default: false },
})
const emit = defineEmits(['loaded'])

const reputations = ref([])
const details = ref({}) // userId -> page of reviews
const errorMessage = ref('')

async function load() {
  try {
    reputations.value = await fetchMyReputations()
    emit('loaded', reputations.value)
  } catch (error) {
    errorMessage.value = missionErrorMessage(error)
  }
}

// A comment reported: reloaded so that it shows hidden
async function reloadDetails(userId) {
  try {
    details.value = { ...details.value, [userId]: await fetchUserReviews(userId) }
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
  <section v-if="reputations.length > 0 || errorMessage" aria-labelledby="received-reviews-title" class="flex flex-col gap-3">
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
            class="link text-base"
            :aria-expanded="Boolean(details[person.userId])"
            @click="toggleDetails(person.userId)"
          >
            {{ details[person.userId] ? 'Masquer les avis' : 'Voir les avis' }}
          </button>
        </div>
        <ReviewList
          v-if="details[person.userId]"
          :reviews="details[person.userId].items"
          @reported="reloadDetails(person.userId)"
        />
      </li>
    </ul>
  </section>
</template>

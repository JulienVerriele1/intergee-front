<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { fetchMission } from '@/api/missionApi'
import { isLive } from '@/missions/cancellation'
import { missionErrorMessage } from '@/missions/missionErrors'
import AlertMessage from '@/components/ui/AlertMessage.vue'
import MissionPublishForm from '@/components/missions/MissionPublishForm.vue'

/** Changes a published mission not started yet (spec 017, UC-2). */
const props = defineProps({
  id: { type: String, required: true },
})

const mission = ref(null)
const status = ref('loading') // loading | ready | closed | error
const errorMessage = ref('')

onMounted(async () => {
  try {
    mission.value = await fetchMission(props.id)
    status.value = isLive(mission.value) ? 'ready' : 'closed'
  } catch (error) {
    errorMessage.value = missionErrorMessage(error)
    status.value = 'error'
  }
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <h1 class="text-3xl font-bold">Modifier la mission</h1>
      <RouterLink :to="{ name: 'my-missions' }" class="mt-2 inline-block link">Revenir à mes missions</RouterLink>
    </div>
    <p v-if="status === 'loading'" role="status" class="text-ink-muted">Chargement de la mission…</p>
    <AlertMessage v-else-if="status === 'error'" variant="error">{{ errorMessage }}</AlertMessage>
    <AlertMessage v-else-if="status === 'closed'" variant="info">
      Cette mission a commencé, est terminée ou annulée : elle ne se modifie plus.
    </AlertMessage>
    <MissionPublishForm v-else :mission="mission" @changed="mission = $event" />
  </div>
</template>

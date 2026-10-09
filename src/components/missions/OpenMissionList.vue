<script setup>
import { onMounted, ref, watch } from 'vue'
import { applyToMission, fetchOpenMissions, withdrawApplication } from '@/api/missionApi'
import { MISSION_CATEGORIES } from '@/constants/missionCategories'
import { missionErrorMessage } from '@/missions/missionErrors'
import AlertMessage from '@/components/ui/AlertMessage.vue'
import MissionCard from './MissionCard.vue'

const PAGE_SIZE = 20

const category = ref('')
const page = ref(0)
const result = ref(null)
const status = ref('loading') // loading | ready | error
const errorMessage = ref('')
// Application in progress, and outcome of the last one, both for a single mission at a time
const pendingMissionId = ref(null)
const feedback = ref(null) // { missionId, variant, text }

async function loadMissions() {
  status.value = 'loading'
  feedback.value = null
  try {
    result.value = await fetchOpenMissions({ category: category.value, page: page.value, size: PAGE_SIZE })
    status.value = 'ready'
  } catch (error) {
    errorMessage.value =
      error.status === 403
        ? "Votre profil étudiant n'a pas de zone d'intervention. Contactez le support."
        : error.message
    status.value = 'error'
  }
}

function goToPage(target) {
  page.value = target
  loadMissions()
}

async function apply(mission) {
  await changeApplication(mission, {
    action: applyToMission,
    appliedAfterwards: true,
    success: 'Votre candidature a été envoyée. Le bénéficiaire choisira parmi les candidats.',
    alreadyInStateCode: 'ALREADY_APPLIED',
  })
}

async function withdraw(mission) {
  await changeApplication(mission, {
    action: withdrawApplication,
    appliedAfterwards: false,
    success: 'Votre candidature a été retirée.',
    alreadyInStateCode: 'APPLICATION_NOT_FOUND',
  })
}

async function changeApplication(mission, { action, appliedAfterwards, success, alreadyInStateCode }) {
  pendingMissionId.value = mission.id
  feedback.value = null
  try {
    await action(mission.id)
    mission.alreadyApplied = appliedAfterwards
    feedback.value = { missionId: mission.id, variant: 'success', text: success }
  } catch (error) {
    // The server state differs from the displayed one (e.g. other tab): align the display
    if (error.code === alreadyInStateCode) {
      mission.alreadyApplied = appliedAfterwards
    }
    feedback.value = { missionId: mission.id, variant: 'error', text: missionErrorMessage(error) }
  } finally {
    pendingMissionId.value = null
  }
}

// A new filter starts again from the first page
watch(category, () => goToPage(0))
onMounted(loadMissions)
</script>

<template>
  <section aria-labelledby="open-missions-title" :aria-busy="status === 'loading'">
    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 id="open-missions-title" class="text-2xl font-bold">Missions ouvertes près de chez vous</h2>
        <p class="text-ink-muted">L'adresse exacte est communiquée à l'étudiant retenu.</p>
      </div>
      <div class="flex flex-col gap-1.5 sm:w-72">
        <label for="category-filter" class="text-base font-bold text-ink">Catégorie</label>
        <select id="category-filter" v-model="category" class="form-input">
          <option value="">Toutes les catégories</option>
          <option v-for="option in MISSION_CATEGORIES" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>

    <p v-if="status === 'loading'" role="status" class="text-ink-muted">Chargement des missions…</p>
    <AlertMessage v-else-if="status === 'error'" variant="error">{{ errorMessage }}</AlertMessage>
    <template v-else>
      <p role="status" class="mb-4 text-ink">
        {{ result.totalItems === 0
          ? 'Aucune mission ouverte dans votre zone pour le moment.'
          : `${result.totalItems} mission${result.totalItems > 1 ? 's' : ''} dans votre zone` }}
      </p>
      <ul v-if="result.items.length > 0" class="grid gap-4 md:grid-cols-2" role="list">
        <li v-for="mission in result.items" :key="mission.id">
          <MissionCard :mission="mission">
            <template #actions>
              <div class="flex flex-col gap-3">
                <AlertMessage v-if="feedback?.missionId === mission.id" :variant="feedback.variant">
                  {{ feedback.text }}
                </AlertMessage>
                <button
                  v-if="mission.alreadyApplied"
                  type="button"
                  class="btn-secondary"
                  :disabled="pendingMissionId !== null"
                  :aria-describedby="`mission-${mission.id}-title`"
                  @click="withdraw(mission)"
                >
                  {{ pendingMissionId === mission.id ? 'Retrait en cours…' : 'Retirer ma candidature' }}
                </button>
                <button
                  v-else
                  type="button"
                  class="btn-primary"
                  :disabled="pendingMissionId !== null"
                  :aria-describedby="`mission-${mission.id}-title`"
                  @click="apply(mission)"
                >
                  {{ pendingMissionId === mission.id ? 'Envoi en cours…' : 'Postuler' }}
                </button>
              </div>
            </template>
          </MissionCard>
        </li>
      </ul>
      <nav v-if="result.totalPages > 1" aria-label="Pagination des missions" class="mt-6 flex items-center justify-between gap-3">
        <button type="button" class="btn-secondary" :disabled="page === 0" @click="goToPage(page - 1)">
          Précédente
        </button>
        <span class="text-ink">Page {{ page + 1 }} sur {{ result.totalPages }}</span>
        <button type="button" class="btn-secondary" :disabled="page + 1 >= result.totalPages" @click="goToPage(page + 1)">
          Suivante
        </button>
      </nav>
    </template>
  </section>
</template>

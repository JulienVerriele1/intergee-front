<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { applyToMission, fetchOpenMissions } from '@/api/missionApi'
import { MISSION_CATEGORIES } from '@/constants/missionCategories'
import { missionErrorMessage } from '@/missions/missionErrors'
import { formatDateTime } from '@/utils/formatters'
import AlertMessage from '@/components/ui/AlertMessage.vue'
import FilterSelect from '@/components/ui/FilterSelect.vue'
import PaginationNav from '@/components/ui/PaginationNav.vue'
import MissionCard from './MissionCard.vue'
import NeighbourhoodIllustration from './NeighbourhoodIllustration.vue'

/**
 * Open missions the student has not applied to yet, on their dashboard: one row per mission, its details on click.
 * The missions already applied to are in "Mes candidatures" (spec 004, RG-8).
 */
const PAGE_SIZE = 5

// An application sent: the applications of the student changed
const emit = defineEmits(['applications-changed'])

const category = ref('')
const page = ref(0)
const result = ref(null)
const status = ref('loading') // loading | ready | error
const errorMessage = ref('')
const successMessage = ref('')
const selectedId = ref(null)
const detailTitle = ref(null)
// Function ref: the heading of the details lives in the v-for of the rows
function setDetailTitle(element) {
  detailTitle.value = element
}
// Application in progress, and its failure, for the selected mission
const applying = ref(false)
const applyError = ref('')

// Sorted by the API across every page: the next ones first, then the closest (spec 004, RG-5)
const rows = computed(() => result.value?.items ?? [])

async function loadMissions() {
  status.value = 'loading'
  try {
    result.value = await fetchOpenMissions({ category: category.value, excludeApplied: true, page: page.value, size: PAGE_SIZE })
    // The last mission of the last page was just applied to: show the previous page
    if (result.value.items.length === 0 && page.value > 0) {
      page.value -= 1
      await loadMissions()
      return
    }
    status.value = 'ready'
  } catch (error) {
    errorMessage.value =
      error.status === 403
        ? "Votre profil étudiant n'a pas de zone d'intervention. Contactez le support."
        : error.message
    status.value = 'error'
  }
}

async function toggle(mission) {
  applyError.value = ''
  if (selectedId.value === mission.id) {
    selectedId.value = null
    return
  }
  selectedId.value = mission.id
  await nextTick()
  detailTitle.value?.focus()
}

function goToPage(target) {
  page.value = target
  selectedId.value = null
  successMessage.value = ''
  loadMissions()
}

async function apply(mission) {
  applying.value = true
  applyError.value = ''
  try {
    await applyToMission(mission.id)
    onApplied('Votre candidature a été envoyée : retrouvez-la dans « Mes candidatures ».')
  } catch (error) {
    // Applied meanwhile (e.g. other tab): the mission no longer belongs to this table
    if (error.code === 'ALREADY_APPLIED') {
      onApplied('Vous avez déjà postulé à cette mission : retrouvez-la dans « Mes candidatures ».')
    } else {
      applyError.value = missionErrorMessage(error)
    }
  } finally {
    applying.value = false
  }
}

function onApplied(message) {
  successMessage.value = message
  selectedId.value = null
  emit('applications-changed')
  loadMissions()
}

// A new filter starts again from the first page
watch(category, () => goToPage(0))
onMounted(loadMissions)

// Reloaded by the dashboard when the student withdraws an application from "Mes candidatures"
defineExpose({ reload: loadMissions })
</script>

<template>
  <section aria-labelledby="open-missions-title" :aria-busy="status === 'loading'" class="flex flex-col gap-4">
    <div class="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
      <div class="w-40 shrink-0 sm:w-44">
        <NeighbourhoodIllustration />
      </div>
      <div class="flex flex-col gap-2 text-center sm:text-left">
        <h2 id="open-missions-title" class="text-2xl font-bold">Missions ouvertes près de chez vous</h2>
        <p class="text-lg text-ink-muted">
          Les prochaines missions de votre zone qui demandent au moins une de vos compétences, et auxquelles vous
          n'avez pas encore postulé. L'adresse exacte est communiquée à l'étudiant retenu.
        </p>
      </div>
    </div>
    <div class="flex flex-wrap items-center justify-between gap-3">
      <FilterSelect
        id="category-filter"
        v-model="category"
        label="Catégorie"
        :options="MISSION_CATEGORIES"
        all-label="Toutes"
      />
      <p v-if="status === 'ready' && result.totalItems > 0" class="text-base text-ink-muted">
        {{ result.totalItems }} mission{{ result.totalItems > 1 ? 's' : '' }} à découvrir
      </p>
    </div>

    <AlertMessage v-if="successMessage" variant="success">{{ successMessage }}</AlertMessage>
    <p v-if="status === 'loading'" role="status" class="text-ink-muted">Chargement des missions…</p>
    <AlertMessage v-else-if="status === 'error'" variant="error">{{ errorMessage }}</AlertMessage>
    <template v-else>
      <p v-if="result.totalItems === 0" role="status" class="text-ink">
        Aucune nouvelle mission dans votre zone ne demande vos compétences pour le moment. Vous pouvez en ajouter dans
        « Mon profil ».
      </p>
      <div v-else class="card overflow-x-auto p-0">
        <table class="w-full text-left text-lg">
          <caption class="sr-only">
            Missions ouvertes, triées par date. Choisissez une mission pour en voir le détail et postuler.
          </caption>
          <thead class="border-b-2 border-border text-base text-ink-muted">
            <tr>
              <th scope="col" class="px-4 py-3">Mission</th>
              <th scope="col" class="px-4 py-3">Date</th>
              <th scope="col" class="px-4 py-3">Lieu</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="mission in rows" :key="mission.id">
              <tr
                class="cursor-pointer border-b border-border-subtle last:border-b-0 hover:bg-primary-soft"
                :class="{ 'border-b-transparent bg-primary-soft': mission.id === selectedId }"
                @click="toggle(mission)"
              >
                <th scope="row" class="px-4 py-3 font-bold">
                  <button
                    type="button"
                    class="focus-ring rounded text-left underline-offset-4 hover:underline"
                    :aria-expanded="mission.id === selectedId"
                    aria-controls="open-mission-detail"
                    @click.stop="toggle(mission)"
                  >
                    {{ mission.title }}
                  </button>
                </th>
                <td class="px-4 py-3 whitespace-nowrap">
                  <time :datetime="mission.scheduledAt">{{ formatDateTime(mission.scheduledAt) }}</time>
                </td>
                <td class="px-4 py-3">
                  {{ mission.city }}
                  <span class="whitespace-nowrap text-ink-muted">
                    · {{ mission.distanceKm < 1 ? 'moins d’1 km' : `${mission.distanceKm} km` }}
                  </span>
                </td>
              </tr>
              <!-- Details right under their row: one mission open at a time -->
              <tr v-if="mission.id === selectedId" id="open-mission-detail" class="border-b border-border-subtle bg-primary-soft last:border-b-0">
                <td colspan="3" class="px-3 pt-1 pb-4 sm:px-4">
                  <div class="flex flex-col gap-2">
                    <h3 :ref="setDetailTitle" tabindex="-1" class="text-base font-bold text-ink-muted outline-none">Détail de la mission</h3>
                    <MissionCard :mission="mission">
                      <template #actions>
                        <div class="flex flex-col gap-3">
                          <AlertMessage v-if="applyError" variant="error">{{ applyError }}</AlertMessage>
                          <button
                            type="button"
                            class="btn-primary"
                            :disabled="applying"
                            :aria-describedby="`mission-${mission.id}-title`"
                            @click="apply(mission)"
                          >
                            {{ applying ? 'Envoi en cours…' : 'Postuler' }}
                          </button>
                        </div>
                      </template>
                    </MissionCard>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <PaginationNav :page="page" :total-pages="result.totalPages" label="Pagination des missions ouvertes" @go="goToPage" />
    </template>
  </section>
</template>

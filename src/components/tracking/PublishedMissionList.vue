<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { fetchMyMissions } from '@/api/missionApi'
import { DEFAULT_PERIOD, publishedMissionStatus } from '@/missions/missionTracking'
import { formatDateTime } from '@/utils/formatters'
import AlertMessage from '@/components/ui/AlertMessage.vue'
import FilterSelect from '@/components/ui/FilterSelect.vue'
import PaginationNav from '@/components/ui/PaginationNav.vue'
import PeriodSwitch from './PeriodSwitch.vue'
import PublishedMissionCard from './PublishedMissionCard.vue'
import StatusBadge from './StatusBadge.vue'

/** Missions of the beneficiary, or of every beneficiary a caregiver manages: one row per mission, its details on click. */
const PAGE_SIZE = 5
const EMPTY_MESSAGES = {
  RETAINED: "Aucune mission avec un étudiant retenu. Choisissez un candidat dans l'onglet « À venir ».",
  UPCOMING: 'Aucune mission à venir.',
  PAST: 'Aucune mission passée.',
}

const props = defineProps({
  /** A caregiver sees the missions of every beneficiary they manage (spec 009, RG-1) */
  isCaregiver: { type: Boolean, default: false },
})

const period = ref(DEFAULT_PERIOD)
const page = ref(0)
const result = ref(null)
const status = ref('loading') // loading | ready | error
const errorMessage = ref('')
const successMessage = ref('')
const beneficiaryFilter = ref('')
const selectedId = ref(null)
const detailTitle = ref(null)
// Function ref: the heading of the details lives in the v-for of the rows
function setDetailTitle(element) {
  detailTitle.value = element
}

// The filter applies to the loaded page: a caregiver manages a few beneficiaries only (spec 009, Q1)
const beneficiaries = computed(() => {
  const byId = new Map((result.value?.items ?? []).map((mission) => [mission.beneficiary.id, mission.beneficiary]))
  return [...byId.values()].sort((first, second) => first.firstName.localeCompare(second.firstName, 'fr'))
})
// Sorted by date by the API across every page: the next ones first, then the most recent past ones (spec 009, RG-4)
const rows = computed(() =>
  (result.value?.items ?? []).filter((mission) => !beneficiaryFilter.value || mission.beneficiary.id === beneficiaryFilter.value),
)

async function loadMissions() {
  status.value = 'loading'
  try {
    result.value = await fetchMyMissions({ period: period.value, page: page.value, size: PAGE_SIZE })
    status.value = 'ready'
  } catch (error) {
    errorMessage.value = error.message
    status.value = 'error'
  }
}

async function toggle(mission) {
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

function onChanged(message) {
  successMessage.value = message
  selectedId.value = null
  loadMissions()
}

watch(period, () => goToPage(0))
onMounted(loadMissions)
</script>

<template>
  <section aria-labelledby="published-missions-title" :aria-busy="status === 'loading'" class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h2 id="published-missions-title" class="text-2xl font-bold">
        {{ props.isCaregiver ? 'Missions des personnes que vous accompagnez' : 'Vos missions' }}
      </h2>
      <PeriodSwitch v-model="period" audience="beneficiary" compact />
    </div>
    <FilterSelect
      v-if="isCaregiver && beneficiaries.length > 1"
      id="beneficiary-filter"
      v-model="beneficiaryFilter"
      label="Personne accompagnée"
      :options="beneficiaries.map((beneficiary) => ({ value: beneficiary.id, label: beneficiary.firstName }))"
      all-label="Toutes"
    />

    <AlertMessage v-if="successMessage" variant="success">{{ successMessage }}</AlertMessage>
    <p v-if="status === 'loading'" role="status" class="text-ink-muted">Chargement des missions…</p>
    <AlertMessage v-else-if="status === 'error'" variant="error">{{ errorMessage }}</AlertMessage>
    <template v-else>
      <p v-if="result.totalItems === 0" role="status" class="text-ink">{{ EMPTY_MESSAGES[period] }}</p>
      <div v-else class="card overflow-x-auto p-0">
        <table class="w-full text-left text-lg">
          <caption class="sr-only">Missions, triées par date. Choisissez une mission pour en voir le détail.</caption>
          <thead class="border-b-2 border-border text-base text-ink-muted">
            <tr>
              <th scope="col" class="px-4 py-3">Mission</th>
              <th v-if="isCaregiver" scope="col" class="px-4 py-3">Pour</th>
              <th scope="col" class="px-4 py-3">Date</th>
              <th scope="col" class="px-4 py-3">Statut</th>
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
                    aria-controls="mission-detail"
                    @click.stop="toggle(mission)"
                  >
                    {{ mission.title }}
                  </button>
                </th>
                <td v-if="isCaregiver" class="px-4 py-3">{{ mission.beneficiary.firstName }}</td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <time :datetime="mission.scheduledAt">{{ formatDateTime(mission.scheduledAt) }}</time>
                </td>
                <td class="px-4 py-3">
                  <StatusBadge :status="publishedMissionStatus(mission)" />
                </td>
              </tr>
              <!-- Details right under their row: one mission open at a time -->
              <tr v-if="mission.id === selectedId" id="mission-detail" class="border-b border-border-subtle bg-primary-soft last:border-b-0">
                <td :colspan="isCaregiver ? 4 : 3" class="px-3 pt-1 pb-4 sm:px-4">
                  <div class="flex flex-col gap-2">
                    <h3 :ref="setDetailTitle" tabindex="-1" class="text-base font-bold text-ink-muted outline-none">Détail de la mission</h3>
                    <PublishedMissionCard :mission="mission" :show-beneficiary="isCaregiver" @changed="onChanged" />
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <PaginationNav :page="page" :total-pages="result.totalPages" label="Pagination des missions" @go="goToPage" />
    </template>
  </section>
</template>

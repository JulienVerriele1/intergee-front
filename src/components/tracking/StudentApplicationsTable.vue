<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { fetchMyApplications } from '@/api/missionApi'
import { DEFAULT_PERIOD, applicationStatus } from '@/missions/missionTracking'
import { formatDateTime } from '@/utils/formatters'
import AlertMessage from '@/components/ui/AlertMessage.vue'
import PaginationNav from '@/components/ui/PaginationNav.vue'
import ApplicationCard from './ApplicationCard.vue'
import ApplicationsIllustration from './ApplicationsIllustration.vue'
import PeriodSwitch from './PeriodSwitch.vue'
import StatusBadge from './StatusBadge.vue'

/** Applications of the student on their dashboard: one row per mission, its details on click. */
const PAGE_SIZE = 5
// An application withdrawn: the mission is open to the student again
const emit = defineEmits(['applications-changed'])
const EMPTY_MESSAGES = {
  RETAINED: "Vous n'avez pas encore été retenu pour une mission.",
  UPCOMING: 'Aucune candidature en attente : postulez à une mission ci-dessous.',
  PAST: 'Aucune mission passée.',
}

const period = ref(DEFAULT_PERIOD)
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

// Sorted by date by the API across every page: the next ones first, then the most recent past ones (spec 009, RG-4)
const rows = computed(() => result.value?.items ?? [])

async function loadApplications() {
  status.value = 'loading'
  try {
    result.value = await fetchMyApplications({ period: period.value, page: page.value, size: PAGE_SIZE })
    status.value = 'ready'
  } catch (error) {
    errorMessage.value = error.message
    status.value = 'error'
  }
}

async function toggle(application) {
  if (selectedId.value === application.mission.id) {
    selectedId.value = null
    return
  }
  selectedId.value = application.mission.id
  await nextTick()
  detailTitle.value?.focus()
}

function goToPage(target) {
  page.value = target
  selectedId.value = null
  successMessage.value = ''
  loadApplications()
}

function onChanged(message) {
  successMessage.value = message
  selectedId.value = null
  emit('applications-changed')
  loadApplications()
}

watch(period, () => goToPage(0))
onMounted(loadApplications)

// Reloaded by the dashboard when the student applies or withdraws from the open missions
defineExpose({ reload: loadApplications })
</script>

<template>
  <section aria-labelledby="student-applications-title" :aria-busy="status === 'loading'" class="flex flex-col gap-4">
    <div class="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
      <div class="w-40 shrink-0 sm:w-44">
        <ApplicationsIllustration />
      </div>
      <div class="flex flex-col gap-2 text-center sm:text-left">
        <h2 id="student-applications-title" class="text-2xl font-bold">Mes candidatures</h2>
        <p class="text-lg text-ink-muted">
          Les missions auxquelles vous avez postulé. Une fois retenu, vous y trouvez l'adresse et le téléphone du
          bénéficiaire.
        </p>
      </div>
    </div>
    <PeriodSwitch v-model="period" compact class="self-start" />

    <AlertMessage v-if="successMessage" variant="success">{{ successMessage }}</AlertMessage>
    <p v-if="status === 'loading'" role="status" class="text-ink-muted">Chargement des candidatures…</p>
    <AlertMessage v-else-if="status === 'error'" variant="error">{{ errorMessage }}</AlertMessage>
    <template v-else>
      <p v-if="result.totalItems === 0" role="status" class="text-ink">{{ EMPTY_MESSAGES[period] }}</p>
      <div v-else class="card overflow-x-auto p-0">
        <table class="w-full text-left text-lg">
          <caption class="sr-only">Candidatures, triées par date. Choisissez une mission pour en voir le détail.</caption>
          <thead class="border-b-2 border-border text-base text-ink-muted">
            <tr>
              <th scope="col" class="px-4 py-3">Mission</th>
              <th scope="col" class="px-4 py-3">Date</th>
              <th scope="col" class="px-4 py-3">Statut</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="application in rows" :key="application.mission.id">
              <tr
                class="cursor-pointer border-b border-border-subtle last:border-b-0 hover:bg-primary-soft"
                :class="{ 'border-b-transparent bg-primary-soft': application.mission.id === selectedId }"
                @click="toggle(application)"
              >
                <th scope="row" class="px-4 py-3 font-bold">
                  <button
                    type="button"
                    class="focus-ring rounded text-left underline-offset-4 hover:underline"
                    :aria-expanded="application.mission.id === selectedId"
                    aria-controls="application-detail"
                    @click.stop="toggle(application)"
                  >
                    {{ application.mission.title }}
                  </button>
                </th>
                <td class="px-4 py-3 whitespace-nowrap">
                  <time :datetime="application.mission.scheduledAt">{{ formatDateTime(application.mission.scheduledAt) }}</time>
                </td>
                <td class="px-4 py-3">
                  <StatusBadge :status="applicationStatus(application)" />
                </td>
              </tr>
              <!-- Details right under their row: one mission open at a time -->
              <tr v-if="application.mission.id === selectedId" id="application-detail" class="border-b border-border-subtle bg-primary-soft last:border-b-0">
                <td colspan="3" class="px-3 pt-1 pb-4 sm:px-4">
                  <div class="flex flex-col gap-2">
                    <h3 :ref="setDetailTitle" tabindex="-1" class="text-base font-bold text-ink-muted outline-none">Détail de la mission</h3>
                    <ApplicationCard :application="application" @changed="onChanged" />
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <PaginationNav :page="page" :total-pages="result.totalPages" label="Pagination des candidatures" @go="goToPage" />
    </template>
  </section>
</template>

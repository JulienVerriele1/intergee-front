<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { fetchMyMissions } from '@/api/missionApi'
import AlertMessage from '@/components/ui/AlertMessage.vue'
import PeriodSwitch from './PeriodSwitch.vue'
import PublishedMissionCard from './PublishedMissionCard.vue'

const PAGE_SIZE = 20

const props = defineProps({
  /** A caregiver sees the missions of every beneficiary they manage (spec 009, RG-1) */
  isCaregiver: { type: Boolean, default: false },
})

const period = ref('UPCOMING')
const page = ref(0)
const result = ref(null)
const status = ref('loading') // loading | ready | error
const errorMessage = ref('')
const successMessage = ref('')
const beneficiaryFilter = ref('')

// The filter applies to the loaded page: a caregiver manages a few beneficiaries only (spec 009, Q1)
const beneficiaries = computed(() => {
  const byId = new Map((result.value?.items ?? []).map((mission) => [mission.beneficiary.id, mission.beneficiary]))
  return [...byId.values()].sort((first, second) => first.firstName.localeCompare(second.firstName, 'fr'))
})
const visibleMissions = computed(() =>
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

function goToPage(target) {
  page.value = target
  successMessage.value = ''
  loadMissions()
}

function onChanged(message) {
  successMessage.value = message
  loadMissions()
}

watch(period, () => goToPage(0))
onMounted(loadMissions)
</script>

<template>
  <section aria-labelledby="published-missions-title" :aria-busy="status === 'loading'" class="flex flex-col gap-4">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <h2 id="published-missions-title" class="text-2xl font-bold">
        {{ props.isCaregiver ? 'Missions des personnes que vous accompagnez' : 'Vos missions' }}
      </h2>
      <PeriodSwitch v-model="period" />
    </div>
    <div v-if="isCaregiver && beneficiaries.length > 1" class="flex flex-col gap-1.5 sm:w-72">
      <label for="beneficiary-filter" class="text-base font-bold text-ink">Personne accompagnée</label>
      <select id="beneficiary-filter" v-model="beneficiaryFilter" class="form-input">
        <option value="">Toutes</option>
        <option v-for="beneficiary in beneficiaries" :key="beneficiary.id" :value="beneficiary.id">
          {{ beneficiary.firstName }}
        </option>
      </select>
    </div>

    <AlertMessage v-if="successMessage" variant="success">{{ successMessage }}</AlertMessage>
    <p v-if="status === 'loading'" role="status" class="text-ink-muted">Chargement des missions…</p>
    <AlertMessage v-else-if="status === 'error'" variant="error">{{ errorMessage }}</AlertMessage>
    <template v-else>
      <p v-if="result.totalItems === 0" role="status" class="text-ink">
        {{ period === 'UPCOMING' ? 'Aucune mission à venir.' : 'Aucune mission passée.' }}
      </p>
      <ul v-else role="list" class="flex flex-col gap-4">
        <li v-for="mission in visibleMissions" :key="mission.id">
          <PublishedMissionCard :mission="mission" :show-beneficiary="isCaregiver" @changed="onChanged" />
        </li>
      </ul>
      <nav v-if="result.totalPages > 1" aria-label="Pagination des missions" class="flex items-center justify-between gap-3">
        <button type="button" class="btn-secondary" :disabled="page === 0" @click="goToPage(page - 1)">Précédente</button>
        <span class="text-ink">Page {{ page + 1 }} sur {{ result.totalPages }}</span>
        <button type="button" class="btn-secondary" :disabled="page + 1 >= result.totalPages" @click="goToPage(page + 1)">
          Suivante
        </button>
      </nav>
    </template>
  </section>
</template>

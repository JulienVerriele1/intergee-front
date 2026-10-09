<script setup>
import { onMounted, ref, watch } from 'vue'
import { fetchMyApplications } from '@/api/missionApi'
import AlertMessage from '@/components/ui/AlertMessage.vue'
import ApplicationCard from './ApplicationCard.vue'
import PeriodSwitch from './PeriodSwitch.vue'

const PAGE_SIZE = 20

const period = ref('UPCOMING')
const page = ref(0)
const result = ref(null)
const status = ref('loading') // loading | ready | error
const errorMessage = ref('')
const successMessage = ref('')

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

function goToPage(target) {
  page.value = target
  successMessage.value = ''
  loadApplications()
}

function onChanged(message) {
  successMessage.value = message
  loadApplications()
}

watch(period, () => goToPage(0))
onMounted(loadApplications)
</script>

<template>
  <section aria-labelledby="my-applications-title" :aria-busy="status === 'loading'" class="flex flex-col gap-4">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <h2 id="my-applications-title" class="text-2xl font-bold">Vos candidatures</h2>
      <PeriodSwitch v-model="period" />
    </div>

    <AlertMessage v-if="successMessage" variant="success">{{ successMessage }}</AlertMessage>
    <p v-if="status === 'loading'" role="status" class="text-ink-muted">Chargement des candidatures…</p>
    <AlertMessage v-else-if="status === 'error'" variant="error">{{ errorMessage }}</AlertMessage>
    <template v-else>
      <p v-if="result.totalItems === 0" role="status" class="text-ink">
        {{ period === 'UPCOMING' ? 'Aucune candidature en cours. Trouvez une mission depuis le tableau de bord.' : 'Aucune mission passée.' }}
      </p>
      <ul v-else role="list" class="flex flex-col gap-4">
        <li v-for="application in result.items" :key="application.mission.id">
          <ApplicationCard :application="application" @changed="onChanged" />
        </li>
      </ul>
      <nav v-if="result.totalPages > 1" aria-label="Pagination des candidatures" class="flex items-center justify-between gap-3">
        <button type="button" class="btn-secondary" :disabled="page === 0" @click="goToPage(page - 1)">Précédente</button>
        <span class="text-ink">Page {{ page + 1 }} sur {{ result.totalPages }}</span>
        <button type="button" class="btn-secondary" :disabled="page + 1 >= result.totalPages" @click="goToPage(page + 1)">
          Suivante
        </button>
      </nav>
    </template>
  </section>
</template>

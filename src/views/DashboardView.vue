<script setup>
import { nextTick, ref } from 'vue'
import OpenMissionList from '@/components/missions/OpenMissionList.vue'
import StudentApplicationsTable from '@/components/tracking/StudentApplicationsTable.vue'

// Only students land here: beneficiaries and caregivers are redirected to their missions (see router)
const TABS = [
  { value: 'open', label: 'Missions ouvertes près de chez moi' },
  { value: 'applications', label: 'Mes candidatures' },
]

const activeTab = ref('open')
const tabButtons = ref([])
const applicationsTable = ref(null)
const openMissionList = ref(null)

// Arrow keys, Home and End move between the tabs (WAI-ARIA tabs pattern, automatic activation)
async function onKeydown(event, index) {
  const targets = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: TABS.length - 1 }
  if (!(event.key in targets)) {
    return
  }
  event.preventDefault()
  const target = (targets[event.key] + TABS.length) % TABS.length
  activeTab.value = TABS[target].value
  await nextTick()
  tabButtons.value[target]?.focus()
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <div>
      <h1 class="text-3xl font-bold">Tableau de bord</h1>
      <p class="mt-1 text-ink-muted">Trouvez une mission près de chez vous et suivez vos candidatures.</p>
    </div>

    <div>
      <!-- Folder tabs, in the colour of the panel they open: unlike the period pills inside the panels -->
      <div role="tablist" aria-label="Tableau de bord" class="flex gap-1 overflow-x-auto px-2 sm:px-4">
        <button
          v-for="(tab, index) in TABS"
          :id="`dashboard-tab-${tab.value}`"
          :key="tab.value"
          ref="tabButtons"
          type="button"
          role="tab"
          :aria-selected="activeTab === tab.value"
          :aria-controls="`dashboard-panel-${tab.value}`"
          :tabindex="activeTab === tab.value ? 0 : -1"
          class="focus-ring relative -mb-0.5 min-h-12 shrink-0 rounded-t-2xl border-2 px-4 text-lg font-bold transition-colors sm:px-6"
          :class="
            activeTab === tab.value
              ? 'z-10 border-border-subtle border-b-surface-sunken bg-surface-sunken text-ink'
              : 'border-transparent text-ink-muted hover:bg-surface-sunken/60 hover:text-ink'
          "
          @click="activeTab = tab.value"
          @keydown="onKeydown($event, index)"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Both stay mounted: one reloads the other when the student applies or withdraws -->
      <div
        id="dashboard-panel-open"
        v-show="activeTab === 'open'"
        role="tabpanel"
        aria-labelledby="dashboard-tab-open"
        class="panel"
      >
        <OpenMissionList ref="openMissionList" @applications-changed="applicationsTable?.reload()" />
      </div>
      <div
        id="dashboard-panel-applications"
        v-show="activeTab === 'applications'"
        role="tabpanel"
        aria-labelledby="dashboard-tab-applications"
        class="panel"
      >
        <StudentApplicationsTable ref="applicationsTable" @applications-changed="openMissionList?.reload()" />
      </div>
    </div>
  </div>
</template>

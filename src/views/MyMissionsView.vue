<script setup>
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { ROLES } from '@/constants/roles'
import PublishMissionPanel from '@/components/missions/PublishMissionPanel.vue'
import PublishedMissionList from '@/components/tracking/PublishedMissionList.vue'

// Beneficiaries and caregivers only: students are redirected to their dashboard (see router)
const { role } = storeToRefs(useAuthStore())
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <h1 class="text-3xl font-bold">Mes missions</h1>
      <p class="mt-1 text-ink-muted">
        Choisissez un étudiant parmi les candidats, puis confirmez la mission une fois réalisée.
      </p>
    </div>
    <PublishMissionPanel :is-caregiver="role === ROLES.CAREGIVER" />
    <div class="panel">
      <PublishedMissionList :is-caregiver="role === ROLES.CAREGIVER" />
    </div>
  </div>
</template>

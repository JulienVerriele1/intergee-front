<script setup>
import { RouterLink } from 'vue-router'
import OpenMissionList from '@/components/missions/OpenMissionList.vue'

// Only students land here: beneficiaries and caregivers are redirected to their missions (see router)
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <h1 class="text-3xl font-bold">Tableau de bord</h1>
      <p class="mt-1 text-ink-muted">Trouvez une mission près de chez vous et rendez service.</p>
      <RouterLink :to="{ name: 'my-missions' }" class="mt-2 inline-block link">Suivre mes candidatures</RouterLink>
    </div>

    <OpenMissionList />
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { ROLES } from '@/constants/roles'
import MissionPublishForm from '@/components/missions/MissionPublishForm.vue'
import OpenMissionList from '@/components/missions/OpenMissionList.vue'

const auth = useAuthStore()
const { role } = storeToRefs(auth)

const introductions = {
  [ROLES.STUDENT]: 'Trouvez une mission près de chez vous et rendez service.',
  [ROLES.BENEFICIARY]: 'Publiez une mission : un étudiant pourra vous proposer son aide.',
  [ROLES.CAREGIVER]: 'Publiez une mission pour une personne que vous accompagnez.',
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <h1 class="text-3xl font-bold">Tableau de bord</h1>
      <p class="mt-1 text-ink-muted">{{ introductions[role] }}</p>
      <RouterLink :to="{ name: 'my-missions' }" class="mt-2 inline-block link">
        {{ role === ROLES.STUDENT ? 'Suivre mes candidatures' : 'Suivre mes missions et leurs candidats' }}
      </RouterLink>
    </div>

    <OpenMissionList v-if="role === ROLES.STUDENT" />
    <MissionPublishForm v-else :requires-beneficiary="role === ROLES.CAREGIVER" />
  </div>
</template>

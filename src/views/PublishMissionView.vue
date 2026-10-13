<script setup>
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { ROLES } from '@/constants/roles'
import MissionPublishForm from '@/components/missions/MissionPublishForm.vue'

const { role } = storeToRefs(useAuthStore())
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <h1 class="text-3xl font-bold">Publier une mission</h1>
      <p class="mt-1 text-ink-muted">
        {{ role === ROLES.CAREGIVER
          ? 'Publiez une mission pour une personne que vous accompagnez.'
          : 'Publiez une mission : un étudiant pourra vous proposer son aide.' }}
      </p>
      <RouterLink :to="{ name: 'my-missions' }" class="mt-2 inline-block link">
        Suivre mes missions et leurs candidats
      </RouterLink>
    </div>

    <MissionPublishForm :requires-beneficiary="role === ROLES.CAREGIVER" />
  </div>
</template>

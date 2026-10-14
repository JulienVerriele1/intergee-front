<script setup>
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { PUBLISHER_ROLES, ROLES } from '@/constants/roles'
import PublishMissionPanel from '@/components/missions/PublishMissionPanel.vue'
import MyApplicationList from '@/components/tracking/MyApplicationList.vue'
import PublishedMissionList from '@/components/tracking/PublishedMissionList.vue'

const { role } = storeToRefs(useAuthStore())
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <h1 class="text-3xl font-bold">{{ role === ROLES.STUDENT ? 'Mes candidatures' : 'Mes missions' }}</h1>
      <p class="mt-1 text-ink-muted">
        {{ role === ROLES.STUDENT
          ? 'Suivez vos candidatures et retrouvez l’adresse des missions pour lesquelles vous avez été choisi.'
          : 'Choisissez un étudiant parmi les candidats, puis confirmez la mission une fois réalisée.' }}
      </p>
    </div>
    <PublishMissionPanel v-if="PUBLISHER_ROLES.includes(role)" :is-caregiver="role === ROLES.CAREGIVER" />
    <MyApplicationList v-if="role === ROLES.STUDENT" />
    <div v-else class="panel">
      <PublishedMissionList :is-caregiver="role === ROLES.CAREGIVER" />
    </div>
  </div>
</template>

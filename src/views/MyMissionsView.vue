<script setup>
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { PUBLISHER_ROLES, ROLES } from '@/constants/roles'
import AppIcon from '@/components/ui/AppIcon.vue'
import MyApplicationList from '@/components/tracking/MyApplicationList.vue'
import PublishedMissionList from '@/components/tracking/PublishedMissionList.vue'

const { role } = storeToRefs(useAuthStore())
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 class="text-3xl font-bold">{{ role === ROLES.STUDENT ? 'Mes candidatures' : 'Mes missions' }}</h1>
        <p class="mt-1 text-ink-muted">
          {{ role === ROLES.STUDENT
            ? 'Suivez vos candidatures et retrouvez l’adresse des missions pour lesquelles vous avez été choisi.'
            : 'Choisissez un étudiant parmi les candidats, puis confirmez la mission une fois réalisée.' }}
        </p>
      </div>
      <RouterLink v-if="PUBLISHER_ROLES.includes(role)" :to="{ name: 'publish-mission' }" class="btn-primary shrink-0 self-start">
        <AppIcon name="plus" :size="22" />
        Ajouter une mission
      </RouterLink>
    </div>
    <MyApplicationList v-if="role === ROLES.STUDENT" />
    <PublishedMissionList v-else :is-caregiver="role === ROLES.CAREGIVER" />
  </div>
</template>

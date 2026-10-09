<script setup>
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { ROLES } from '@/constants/roles'
import MyApplicationList from '@/components/tracking/MyApplicationList.vue'
import PublishedMissionList from '@/components/tracking/PublishedMissionList.vue'

const { role } = storeToRefs(useAuthStore())
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <h1 class="text-2xl font-bold sm:text-3xl">{{ role === ROLES.STUDENT ? 'Mes candidatures' : 'Mes missions' }}</h1>
      <p class="mt-1 text-slate-600">
        {{ role === ROLES.STUDENT
          ? 'Suivez vos candidatures et retrouvez l’adresse des missions pour lesquelles vous avez été choisi.'
          : 'Choisissez un étudiant parmi les candidats, puis confirmez la mission une fois réalisée.' }}
      </p>
    </div>
    <MyApplicationList v-if="role === ROLES.STUDENT" />
    <PublishedMissionList v-else :is-caregiver="role === ROLES.CAREGIVER" />
  </div>
</template>

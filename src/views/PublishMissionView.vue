<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { fetchMyBeneficiaryProfile } from '@/api/profileApi'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { ROLES } from '@/constants/roles'
import MissionPublishForm from '@/components/missions/MissionPublishForm.vue'

const { role } = storeToRefs(useAuthStore())

// Reminded until the beneficiary says they are registered; always for a caregiver (spec 013, RG-5)
const showCesuReminder = ref(role.value === ROLES.CAREGIVER)
onMounted(async () => {
  if (role.value !== ROLES.BENEFICIARY) {
    return
  }
  try {
    showCesuReminder.value = !(await fetchMyBeneficiaryProfile()).cesuRegistered
  } catch {
    showCesuReminder.value = true
  }
})
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

    <MissionPublishForm :requires-beneficiary="role === ROLES.CAREGIVER" :show-cesu-reminder="showCesuReminder" />
  </div>
</template>

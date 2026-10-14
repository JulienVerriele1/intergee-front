<script setup>
import { onMounted, provide, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { fetchMyBeneficiaryProfile } from '@/api/profileApi'
import { useAuthStore } from '@/stores/auth'
import { ROLES } from '@/constants/roles'
import PublishMissionPanel from '@/components/missions/PublishMissionPanel.vue'
import PublishedMissionList from '@/components/tracking/PublishedMissionList.vue'

// Beneficiaries and caregivers only: students are redirected to their dashboard (see router)
const { role } = storeToRefs(useAuthStore())

// A beneficiary publishes once their presentation is given (spec 012, RG-3): until then, the panel leads to the
// profile. Assumed complete when unknown: the server refuses anyway, with an explanation.
const profileComplete = ref(true)
// Reminded until the beneficiary says they are registered to the CESU; always for a caregiver (spec 013, RG-5)
const showCesuReminder = ref(true)
provide('showCesuReminder', showCesuReminder)
onMounted(async () => {
  if (role.value !== ROLES.BENEFICIARY) {
    return
  }
  try {
    const profile = await fetchMyBeneficiaryProfile()
    profileComplete.value = profile.complete
    showCesuReminder.value = !profile.cesuRegistered
  } catch {
    profileComplete.value = true
  }
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <h1 class="text-3xl font-bold">Mes missions</h1>
      <p class="mt-1 text-ink-muted">
        Choisissez un étudiant parmi les candidats, puis confirmez la mission une fois réalisée.
      </p>
    </div>
    <PublishMissionPanel :is-caregiver="role === ROLES.CAREGIVER" :profile-complete="profileComplete" />
    <div class="panel">
      <PublishedMissionList :is-caregiver="role === ROLES.CAREGIVER" />
    </div>
  </div>
</template>

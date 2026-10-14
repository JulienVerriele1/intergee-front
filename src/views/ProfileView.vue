<script setup>
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { ROLES } from '@/constants/roles'
import BeneficiaryProfileForm from '@/components/profile/BeneficiaryProfileForm.vue'
import StudentProfileForm from '@/components/profile/StudentProfileForm.vue'

/** "Mon profil" of a student (specs 010 and 012) or of a beneficiary (spec 012): caregivers have none yet. */
const { role } = storeToRefs(useAuthStore())
</script>

<template>
  <div class="flex flex-col gap-6">
    <h1 class="text-3xl font-bold">Mon profil</h1>
    <StudentProfileForm v-if="role === ROLES.STUDENT" />
    <BeneficiaryProfileForm v-else-if="role === ROLES.BENEFICIARY" />
  </div>
</template>

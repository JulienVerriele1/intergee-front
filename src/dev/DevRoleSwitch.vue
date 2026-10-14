<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { DEV_ACCOUNTS, DEV_ACCOUNTS_MISSING } from './devAccounts'

/** Local development only: switch to another demo account from the account menu. */
const auth = useAuthStore()
const router = useRouter()
const { role } = storeToRefs(auth)

const switchingTo = ref(null)
const errorMessage = ref('')
const otherAccounts = computed(() => DEV_ACCOUNTS.filter((account) => account.role !== role.value))

async function switchTo(account) {
  switchingTo.value = account.role
  errorMessage.value = ''
  try {
    await auth.login(account.email, account.password)
    await router.replace({ name: 'dashboard' })
  } catch (error) {
    errorMessage.value = error.status === 401 ? DEV_ACCOUNTS_MISSING : error.message
  } finally {
    switchingTo.value = null
  }
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <p class="text-sm font-bold text-ink-muted">Mode local</p>
    <button
      v-for="account in otherAccounts"
      :key="account.role"
      type="button"
      class="btn-secondary w-full"
      :disabled="switchingTo !== null"
      @click="switchTo(account)"
    >
      {{ switchingTo === account.role ? 'Changement…' : `Passer en ${account.label.toLowerCase()}` }}
    </button>
    <p v-if="errorMessage" role="alert" class="text-base text-danger">{{ errorMessage }}</p>
  </div>
</template>

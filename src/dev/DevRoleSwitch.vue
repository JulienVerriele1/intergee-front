<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { DEV_ACCOUNTS, DEV_ACCOUNTS_MISSING } from './devAccounts'

/** Local development only: switch to the other demo account from the account menu. */
const auth = useAuthStore()
const router = useRouter()
const { role } = storeToRefs(auth)

const switching = ref(false)
const errorMessage = ref('')
const otherAccount = computed(() => DEV_ACCOUNTS.find((account) => account.role !== role.value) ?? DEV_ACCOUNTS[0])

async function switchAccount() {
  switching.value = true
  errorMessage.value = ''
  try {
    await auth.login(otherAccount.value.email, otherAccount.value.password)
    await router.replace({ name: 'dashboard' })
  } catch (error) {
    errorMessage.value = error.status === 401 ? DEV_ACCOUNTS_MISSING : error.message
  } finally {
    switching.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <p class="text-sm font-bold text-ink-muted">Mode local</p>
    <button type="button" class="btn-secondary w-full" :disabled="switching" @click="switchAccount">
      {{ switching ? 'Changement…' : `Passer en ${otherAccount.label.toLowerCase()}` }}
    </button>
    <p v-if="errorMessage" role="alert" class="text-base text-danger">{{ errorMessage }}</p>
  </div>
</template>

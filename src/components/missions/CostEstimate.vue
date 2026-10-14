<script setup>
import { ref, watch } from 'vue'
import { estimateCost } from '@/api/wageApi'
import { formatEuros } from '@/utils/formatters'

/**
 * What the mission will cost its employer, recomputed when the wage or the duration changes (spec 013, RG-3). An
 * estimate only: said so, next to the official simulator.
 */
const props = defineProps({
  /** As typed: "12,50" or "12.50" */
  hourlyNetWage: { type: String, required: true },
  durationMinutes: { type: Number, required: true },
})

const estimate = ref(null)
let timer = null
let requestId = 0

function amountOf(text) {
  const value = Number(String(text).trim().replace(',', '.'))
  return Number.isFinite(value) && value > 0 ? value : null
}

watch(
  () => [props.hourlyNetWage, props.durationMinutes],
  () => {
    clearTimeout(timer)
    const wage = amountOf(props.hourlyNetWage)
    if (wage === null) {
      estimate.value = null
      return
    }
    // Waits for the typing to pause, and keeps only the answer to the last request
    timer = setTimeout(async () => {
      const current = ++requestId
      try {
        const result = await estimateCost({ hourlyNetWage: wage, durationMinutes: props.durationMinutes })
        if (current === requestId) {
          estimate.value = result
        }
      } catch {
        estimate.value = null
      }
    }, 300)
  },
  { immediate: true },
)
</script>

<template>
  <section v-if="estimate && !estimate.belowMinimum" aria-labelledby="cost-estimate-title" class="rounded-lg bg-surface-sunken p-4">
    <h3 id="cost-estimate-title" class="text-lg font-bold">Ce que la mission vous coûtera</h3>
    <dl class="mt-2 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-base">
      <dt>Salaire versé à l'étudiant</dt>
      <dd class="text-right">{{ formatEuros(estimate.netWage) }}</dd>
      <dt>Cotisations estimées</dt>
      <dd class="text-right">{{ formatEuros(estimate.contributions) }}</dd>
      <dt>Coût total</dt>
      <dd class="text-right">{{ formatEuros(estimate.totalCost) }}</dd>
      <dt>Crédit d'impôt de 50 %</dt>
      <dd class="text-right">− {{ formatEuros(estimate.taxCredit) }}</dd>
      <dt class="font-bold">Coût réel estimé</dt>
      <dd class="text-right font-bold">{{ formatEuros(estimate.costAfterTaxCredit) }}</dd>
    </dl>
    <p class="mt-2 text-base text-ink-muted">
      Estimation indicative. Pour un calcul exact, utilisez le
      <a :href="estimate.simulatorUrl" target="_blank" rel="noopener noreferrer" class="link">
        simulateur du CESU<span class="sr-only"> (nouvel onglet)</span></a>.
    </p>
  </section>
</template>

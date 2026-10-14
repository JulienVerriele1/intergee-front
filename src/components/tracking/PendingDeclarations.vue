<script setup>
import { onMounted, ref } from 'vue'
import { CESU_URL, fetchPendingDeclarations, markDeclared, unmarkDeclared } from '@/api/wageApi'
import { missionErrorMessage } from '@/missions/missionErrors'
import { formatDateTime, formatDuration, formatEuros, formatMonth } from '@/utils/formatters'
import AlertMessage from '@/components/ui/AlertMessage.vue'

/**
 * CESU declarations to make, prepared by Geen (spec 013, RG-7 and RG-8): one card per student and per month, with
 * what to copy into cesu.urssaf.fr. The page around gives the title.
 */
defineProps({
  /** A caregiver declares for several people: each card names the employer */
  isCaregiver: { type: Boolean, default: false },
})
// How many declarations are left, for the title of the page around
const emit = defineEmits(['count'])

const declarations = ref([])
const busyKey = ref(null)
const errorMessage = ref('')
// The last declaration marked, to undo a wrong click
const lastMarked = ref(null) // { text, missionIds }

function keyOf(declaration) {
  return `${declaration.employer.id}-${declaration.employee.id}-${declaration.month}`
}

async function load() {
  try {
    declarations.value = await fetchPendingDeclarations()
  } catch {
    declarations.value = []
  }
  emit('count', declarations.value.length)
}

async function declare(declaration) {
  busyKey.value = keyOf(declaration)
  errorMessage.value = ''
  const missionIds = declaration.missions.map((mission) => mission.id)
  try {
    await markDeclared(missionIds)
    lastMarked.value = {
      text: `Missions de ${declaration.employee.firstName} de ${formatMonth(declaration.month)} indiquées comme déclarées.`,
      missionIds,
    }
    await load()
  } catch (error) {
    errorMessage.value = missionErrorMessage(error)
  } finally {
    busyKey.value = null
  }
}

async function undo() {
  const { missionIds } = lastMarked.value
  lastMarked.value = null
  try {
    await unmarkDeclared(missionIds)
    await load()
  } catch (error) {
    errorMessage.value = missionErrorMessage(error)
  }
}

onMounted(load)
</script>

<template>
  <div class="flex flex-col gap-4">
    <p class="text-lg text-ink-muted">
      Recopiez ces informations sur cesu.urssaf.fr, puis indiquez que c'est fait. Avec l'option CESU+, l'URSSAF verse
      le salaire à l'étudiant pour vous.
    </p>

    <AlertMessage v-if="errorMessage" variant="error">{{ errorMessage }}</AlertMessage>
    <AlertMessage v-if="lastMarked" variant="success">
      {{ lastMarked.text }}
      <button type="button" class="link ml-1" @click="undo">Annuler</button>
    </AlertMessage>

    <p v-if="declarations.length === 0" role="status" class="text-lg">
      Rien à déclarer pour le moment : les missions apparaîtront ici dès que vous aurez confirmé qu'elles ont eu lieu.
    </p>
    <ul v-else role="list" class="flex flex-col gap-4">
      <li v-for="declaration in declarations" :key="keyOf(declaration)">
        <article class="card flex flex-col gap-4" :aria-labelledby="`declaration-${keyOf(declaration)}`">
          <h3 :id="`declaration-${keyOf(declaration)}`" class="text-xl font-bold">
            {{ declaration.employee.firstName }} {{ declaration.employee.lastName }} · {{ formatMonth(declaration.month) }}
          </h3>
          <dl class="grid grid-cols-1 gap-2 rounded-lg bg-surface-sunken p-3 text-base sm:grid-cols-2">
            <div v-if="isCaregiver">
              <dt class="font-bold text-ink-muted">Employeur</dt>
              <dd>{{ declaration.employer.firstName }} {{ declaration.employer.lastName }}</dd>
            </div>
            <div>
              <dt class="font-bold text-ink-muted">Salarié</dt>
              <dd>{{ declaration.employee.firstName }} {{ declaration.employee.lastName }}</dd>
            </div>
            <div>
              <dt class="font-bold text-ink-muted">Période</dt>
              <dd class="first-letter:uppercase">{{ formatMonth(declaration.month) }}</dd>
            </div>
            <div>
              <dt class="font-bold text-ink-muted">Heures travaillées</dt>
              <dd>{{ formatDuration(declaration.totalMinutes) }}</dd>
            </div>
            <div>
              <dt class="font-bold text-ink-muted">Salaire net à déclarer</dt>
              <dd class="font-bold">{{ formatEuros(declaration.netWage) }}</dd>
            </div>
          </dl>
          <details>
            <summary class="focus-ring cursor-pointer rounded font-bold text-primary-ink">
              {{ declaration.missions.length }} mission{{ declaration.missions.length > 1 ? 's' : '' }}
            </summary>
            <ul role="list" class="mt-2 flex flex-col gap-1 text-base">
              <li v-for="mission in declaration.missions" :key="mission.id">
                {{ mission.title }} · <time :datetime="mission.scheduledAt">{{ formatDateTime(mission.scheduledAt) }}</time>
                · {{ formatDuration(mission.durationMinutes) }} · {{ formatEuros(mission.netWage) }}
              </li>
            </ul>
          </details>
          <div class="flex flex-wrap gap-3">
            <a :href="CESU_URL" target="_blank" rel="noopener noreferrer" class="btn-secondary">
              Déclarer sur cesu.urssaf.fr<span class="sr-only"> (nouvel onglet)</span>
            </a>
            <button type="button" class="btn-primary" :disabled="busyKey !== null" @click="declare(declaration)">
              {{ busyKey === keyOf(declaration) ? 'Enregistrement…' : 'C’est déclaré' }}
            </button>
          </div>
        </article>
      </li>
    </ul>
  </div>
</template>

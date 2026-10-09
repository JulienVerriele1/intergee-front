<script setup>
import { categoryLabel } from '@/constants/missionCategories'
import { formatDateTime, formatDuration, formatEuros } from '@/utils/formatters'

defineProps({
  /** Mission preview: no street nor exact location, revealed only to the assigned student (spec 004) */
  mission: { type: Object, required: true },
})
</script>

<template>
  <article class="card flex h-full flex-col gap-3" :aria-labelledby="`mission-${mission.id}-title`">
    <div class="flex flex-wrap items-start justify-between gap-2">
      <h3 :id="`mission-${mission.id}-title`" class="text-lg font-semibold text-slate-900">{{ mission.title }}</h3>
      <div class="flex flex-wrap gap-2">
        <span v-if="mission.alreadyApplied" class="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-900">
          Candidature envoyée
        </span>
        <span class="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-900">
          {{ categoryLabel(mission.category) }}
        </span>
      </div>
    </div>
    <p class="text-slate-700">{{ mission.description }}</p>
    <dl class="mt-auto grid grid-cols-1 gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
      <div>
        <dt class="font-semibold text-slate-600">Quand</dt>
        <dd><time :datetime="mission.scheduledAt">{{ formatDateTime(mission.scheduledAt) }}</time></dd>
      </div>
      <div>
        <dt class="font-semibold text-slate-600">Durée</dt>
        <dd>{{ formatDuration(mission.durationMinutes) }}</dd>
      </div>
      <div>
        <dt class="font-semibold text-slate-600">Où</dt>
        <dd>
          {{ mission.postalCode }} {{ mission.city }}
          <span class="text-slate-600">· {{ mission.distanceKm < 1 ? 'moins d’1 km' : `${mission.distanceKm} km` }}</span>
        </dd>
      </div>
      <div>
        <dt class="font-semibold text-slate-600">Compensation</dt>
        <dd>{{ formatEuros(mission.reward) }}</dd>
      </div>
    </dl>
    <!-- Actions on the mission, provided by the parent (apply / withdraw for a student) -->
    <slot name="actions" />
  </article>
</template>

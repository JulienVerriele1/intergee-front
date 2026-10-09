<script setup>
import { categoryLabel } from '@/constants/missionCategories'
import { formatDateTime, formatDuration, formatEuros } from '@/utils/formatters'
import AppIcon from '@/components/ui/AppIcon.vue'

defineProps({
  /** Mission preview: no street nor exact location, revealed only to the assigned student (spec 004) */
  mission: { type: Object, required: true },
})
</script>

<template>
  <article class="card flex h-full flex-col gap-4" :aria-labelledby="`mission-${mission.id}-title`">
    <div class="flex flex-wrap items-start justify-between gap-2">
      <h3 :id="`mission-${mission.id}-title`" class="text-2xl font-bold text-ink">{{ mission.title }}</h3>
      <div class="flex flex-wrap gap-2">
        <span v-if="mission.alreadyApplied" class="tag bg-success-soft">
          <AppIcon name="check" class="text-success" />
          Candidature envoyée
        </span>
        <span class="tag bg-accent-soft pl-3">
          {{ categoryLabel(mission.category) }}
        </span>
      </div>
    </div>
    <p class="text-ink">{{ mission.description }}</p>
    <dl class="mt-auto grid grid-cols-1 gap-x-4 gap-y-1 text-base sm:grid-cols-2">
      <div>
        <dt class="font-bold text-ink-muted">Quand</dt>
        <dd><time :datetime="mission.scheduledAt">{{ formatDateTime(mission.scheduledAt) }}</time></dd>
      </div>
      <div>
        <dt class="font-bold text-ink-muted">Durée</dt>
        <dd>{{ formatDuration(mission.durationMinutes) }}</dd>
      </div>
      <div>
        <dt class="font-bold text-ink-muted">Où</dt>
        <dd>
          {{ mission.postalCode }} {{ mission.city }}
          <span class="text-ink-muted">· {{ mission.distanceKm < 1 ? 'moins d’1 km' : `${mission.distanceKm} km` }}</span>
        </dd>
      </div>
      <div>
        <dt class="font-bold text-ink-muted">Compensation</dt>
        <dd>{{ formatEuros(mission.reward) }}</dd>
      </div>
    </dl>
    <!-- Actions on the mission, provided by the parent (apply / withdraw for a student) -->
    <slot name="actions" />
  </article>
</template>

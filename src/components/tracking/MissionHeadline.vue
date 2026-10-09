<script setup>
import { categoryLabel } from '@/constants/missionCategories'
import { formatDateTime, formatDuration, formatEuros } from '@/utils/formatters'

/** Title, date and place shared by the tracking cards: never the street (spec 009, RG-3). */
defineProps({
  mission: { type: Object, required: true },
  titleId: { type: String, required: true },
})
</script>

<template>
  <div class="flex flex-col gap-2">
    <h3 :id="titleId" class="text-2xl font-bold text-ink">{{ mission.title }}</h3>
    <dl class="grid grid-cols-1 gap-x-4 gap-y-1 text-base sm:grid-cols-2">
      <div>
        <dt class="font-bold text-ink-muted">Quand</dt>
        <dd>
          <time :datetime="mission.scheduledAt">{{ formatDateTime(mission.scheduledAt) }}</time>
          · {{ formatDuration(mission.durationMinutes) }}
        </dd>
      </div>
      <div>
        <dt class="font-bold text-ink-muted">Où</dt>
        <dd>{{ mission.postalCode }} {{ mission.city }}</dd>
      </div>
      <div>
        <dt class="font-bold text-ink-muted">Catégorie</dt>
        <dd>{{ categoryLabel(mission.category) }}</dd>
      </div>
      <div>
        <dt class="font-bold text-ink-muted">Compensation</dt>
        <dd>{{ formatEuros(mission.reward) }}</dd>
      </div>
    </dl>
  </div>
</template>

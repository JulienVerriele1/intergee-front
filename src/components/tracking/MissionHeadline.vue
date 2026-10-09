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
    <h3 :id="titleId" class="text-lg font-semibold text-slate-900">{{ mission.title }}</h3>
    <dl class="grid grid-cols-1 gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
      <div>
        <dt class="font-semibold text-slate-600">Quand</dt>
        <dd>
          <time :datetime="mission.scheduledAt">{{ formatDateTime(mission.scheduledAt) }}</time>
          · {{ formatDuration(mission.durationMinutes) }}
        </dd>
      </div>
      <div>
        <dt class="font-semibold text-slate-600">Où</dt>
        <dd>{{ mission.postalCode }} {{ mission.city }}</dd>
      </div>
      <div>
        <dt class="font-semibold text-slate-600">Catégorie</dt>
        <dd>{{ categoryLabel(mission.category) }}</dd>
      </div>
      <div>
        <dt class="font-semibold text-slate-600">Compensation</dt>
        <dd>{{ formatEuros(mission.reward) }}</dd>
      </div>
    </dl>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import {
  DAY_PARTS,
  WEEKDAYS,
  dateKey,
  formatLongDate,
  formatMonth,
  formatTime,
  isSlotAvailable,
  monthWeeks,
  parseDateKey,
  slotsBetween,
  splitDateTime,
} from '@/utils/calendar'
import AppIcon from './AppIcon.vue'

/**
 * Date and time picker of the design system: a month calendar with 56px days, then half-hour slots.
 * Replaces the native datetime-local input, whose tiny segments and browser-drawn popup cannot be styled.
 * v-model: "YYYY-MM-DDTHH:mm" (local time), empty until both a day and a slot are chosen.
 */
const props = defineProps({
  id: { type: String, required: true },
  /** Accessible name of the whole picker (the visible label of the form field) */
  label: { type: String, required: true },
  /** Earliest selectable moment, "YYYY-MM-DDTHH:mm" */
  min: { type: String, required: true },
  describedBy: { type: String, default: undefined },
  invalid: { type: Boolean, default: undefined },
})
const model = defineModel({ type: String, default: '' })

const minDate = computed(() => new Date(props.min))
const todayKey = computed(() => dateKey(minDate.value))

const selectedDay = ref(splitDateTime(model.value).day)
const selectedTime = ref(splitDateTime(model.value).time)

const initial = selectedDay.value ? parseDateKey(selectedDay.value) : minDate.value
const viewYear = ref(initial.getFullYear())
const viewMonth = ref(initial.getMonth())
// Roving focus: the only day reachable with Tab, moved with the arrow keys
const focusedKey = ref(selectedDay.value || todayKey.value)
const grid = ref(null)

const weeks = computed(() => monthWeeks(viewYear.value, viewMonth.value))
const monthLabel = computed(() => formatMonth(viewYear.value, viewMonth.value))
const canGoBack = computed(() => {
  const min = minDate.value
  return viewYear.value > min.getFullYear() || (viewYear.value === min.getFullYear() && viewMonth.value > min.getMonth())
})

const isPast = (key) => key < todayKey.value

// The day reachable with Tab in the shown month: the focused one, else the chosen one, else the first open day
const tabbableKey = computed(() => {
  const keys = weeks.value.flat().filter(Boolean).map(dateKey)
  return [focusedKey.value, selectedDay.value].find((key) => keys.includes(key)) ?? keys.find((key) => !isPast(key))
})
const dayParts = computed(() =>
  DAY_PARTS.map((part) => ({
    ...part,
    slots: slotsBetween(part.from, part.to).map((time) => ({
      time,
      label: formatTime(time),
      available: Boolean(selectedDay.value) && isSlotAvailable(selectedDay.value, time, minDate.value),
    })),
  })),
)

const summary = computed(() => {
  if (!selectedDay.value) {
    return 'Choisissez un jour dans le calendrier.'
  }
  const day = formatLongDate(parseDateKey(selectedDay.value))
  return selectedTime.value ? `Le ${day} à ${formatTime(selectedTime.value)}` : `Le ${day}. Choisissez maintenant une heure.`
})

watch([selectedDay, selectedTime], ([day, time]) => {
  model.value = day && time ? `${day}T${time}` : ''
})

// A value set from outside (form reset) is shown again
watch(model, (value) => {
  const { day, time } = splitDateTime(value)
  if (value !== (selectedDay.value && selectedTime.value ? `${selectedDay.value}T${selectedTime.value}` : '')) {
    selectedDay.value = day
    selectedTime.value = time
  }
})

function showMonth(year, month) {
  const date = new Date(year, month, 1)
  viewYear.value = date.getFullYear()
  viewMonth.value = date.getMonth()
}

function selectDay(key) {
  if (isPast(key)) {
    return
  }
  selectedDay.value = key
  focusedKey.value = key
  if (selectedTime.value && !isSlotAvailable(key, selectedTime.value, minDate.value)) {
    selectedTime.value = ''
  }
}

async function moveFocus(event, key) {
  const steps = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }
  const date = parseDateKey(key)
  if (event.key in steps) {
    date.setDate(date.getDate() + steps[event.key])
  } else if (event.key === 'PageUp' || event.key === 'PageDown') {
    date.setMonth(date.getMonth() + (event.key === 'PageUp' ? -1 : 1))
  } else {
    return
  }
  event.preventDefault()
  const target = dateKey(date)
  if (isPast(target)) {
    return
  }
  focusedKey.value = target
  showMonth(date.getFullYear(), date.getMonth())
  await nextTick()
  grid.value?.querySelector(`[data-day="${target}"]`)?.focus()
}

function dayLabel(date) {
  const key = dateKey(date)
  const parts = [formatLongDate(date)]
  if (key === todayKey.value) parts.push('aujourd’hui')
  if (isPast(key)) parts.push('passé, indisponible')
  return parts.join(', ')
}
</script>

<template>
  <div
    :id="id"
    role="group"
    :aria-label="label"
    :aria-describedby="describedBy"
    :aria-invalid="invalid"
    tabindex="-1"
    class="flex flex-col gap-6 rounded-2xl outline-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus border-2 bg-surface-raised p-4 sm:p-6"
    :class="invalid ? 'border-danger' : 'border-border'"
  >
    <div class="flex flex-col gap-3">
      <div class="flex items-center justify-between gap-3">
        <button
          type="button"
          class="btn-secondary px-0"
          :disabled="!canGoBack"
          aria-label="Mois précédent"
          @click="showMonth(viewYear, viewMonth - 1)"
        >
          <AppIcon name="chevron-left" :size="24" />
        </button>
        <p class="text-2xl font-bold first-letter:uppercase" aria-live="polite">{{ monthLabel }}</p>
        <button type="button" class="btn-secondary px-0" aria-label="Mois suivant" @click="showMonth(viewYear, viewMonth + 1)">
          <AppIcon name="chevron-right" :size="24" />
        </button>
      </div>

      <table ref="grid" class="w-full table-fixed border-separate border-spacing-1" :aria-label="`Jours de ${monthLabel}`">
        <thead>
          <tr>
            <th v-for="weekday in WEEKDAYS" :key="weekday.long" scope="col" class="pb-1 text-base font-bold text-ink-muted">
              <abbr :title="weekday.long" class="no-underline">{{ weekday.short }}</abbr>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(week, weekIndex) in weeks" :key="weekIndex">
            <td v-for="(date, dayIndex) in week" :key="dayIndex" class="p-0">
              <button
                v-if="date"
                type="button"
                :data-day="dateKey(date)"
                :tabindex="dateKey(date) === tabbableKey ? 0 : -1"
                :aria-pressed="dateKey(date) === selectedDay"
                :aria-disabled="isPast(dateKey(date)) || undefined"
                :aria-label="dayLabel(date)"
                :aria-current="dateKey(date) === todayKey ? 'date' : undefined"
                class="focus-ring flex aspect-square min-h-target w-full items-center justify-center rounded-full text-xl font-bold transition-colors"
                :class="[
                  dateKey(date) === selectedDay
                    ? 'bg-primary text-on-primary'
                    : isPast(dateKey(date))
                      ? 'cursor-not-allowed font-normal text-ink-muted opacity-60'
                      : 'text-ink hover:bg-primary-soft',
                  dateKey(date) === todayKey && dateKey(date) !== selectedDay ? 'ring-2 ring-accent ring-inset' : '',
                ]"
                @click="selectDay(dateKey(date))"
                @keydown="moveFocus($event, dateKey(date))"
              >
                {{ date.getDate() }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <fieldset class="flex flex-col gap-4" :disabled="!selectedDay">
      <legend class="mb-2 text-lg font-bold">Heure</legend>
      <div v-for="part in dayParts" :key="part.label" role="group" :aria-label="part.label" class="flex flex-col gap-2">
        <p class="text-base font-bold text-ink-muted" aria-hidden="true">{{ part.label }}</p>
        <div class="grid grid-cols-3 gap-3 sm:grid-cols-4">
          <button
            v-for="slot in part.slots"
            :key="slot.time"
            type="button"
            :aria-pressed="slot.time === selectedTime"
            :disabled="!slot.available"
            class="focus-ring min-h-target rounded-full border-2 text-lg font-bold transition-colors disabled:cursor-not-allowed disabled:border-border-subtle disabled:font-normal disabled:text-ink-muted"
            :class="slot.time === selectedTime ? 'border-primary bg-primary text-on-primary' : 'border-border bg-surface-raised text-ink hover:bg-primary-soft'"
            @click="selectedTime = slot.time"
          >
            {{ slot.label }}
          </button>
        </div>
      </div>
    </fieldset>

    <p
      class="flex items-start gap-2 rounded-lg px-4 py-3 text-lg"
      :class="selectedDay && selectedTime ? 'bg-primary-soft font-bold' : 'bg-surface-sunken'"
      aria-live="polite"
    >
      <AppIcon :name="selectedDay && selectedTime ? 'check' : 'clock'" :size="24" class="mt-0.5 text-primary-ink" />
      <span>{{ summary }}</span>
    </p>
  </div>
</template>

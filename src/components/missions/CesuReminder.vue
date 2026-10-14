<script setup>
import { CESU_URL } from '@/api/wageApi'
import AlertMessage from '@/components/ui/AlertMessage.vue'

/** The employer declares the student to the CESU: reminded until they say they are registered (spec 013, RG-5). */
defineProps({
  /** e.g. "Léa": the reminder names the student once chosen */
  studentFirstName: { type: String, default: '' },
})
</script>

<template>
  <AlertMessage variant="info">
    {{ studentFirstName ? `${studentFirstName} sera votre salarié·e` : "L'étudiant sera votre salarié·e" }} : vous le
    déclarez au CESU après la mission, et l'URSSAF peut lui verser son salaire à votre place (option CESU+).
    Pas encore inscrit ?
    <a :href="CESU_URL" target="_blank" rel="noopener noreferrer" class="link">
      Inscrivez-vous sur cesu.urssaf.fr<span class="sr-only"> (nouvel onglet)</span></a>.
  </AlertMessage>
</template>

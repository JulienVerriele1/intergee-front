<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="card mx-auto max-w-lg text-center">
    <h1 class="mb-2 text-2xl font-bold">Accès refusé</h1>
    <p class="mb-6 text-slate-600">Votre profil ne permet pas d'accéder à cette page.</p>
    <RouterLink to="/" class="btn-primary">Retour au tableau de bord</RouterLink>
  </div>
</template>

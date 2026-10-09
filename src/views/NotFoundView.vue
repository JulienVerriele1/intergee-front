<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="card mx-auto max-w-lg text-center">
    <h1 class="mb-2 text-3xl font-bold">Page introuvable</h1>
    <p class="mb-6 text-ink-muted">La page que vous cherchez n'existe pas ou a été déplacée.</p>
    <RouterLink to="/" class="btn-primary">Retour à l'accueil</RouterLink>
  </div>
</template>

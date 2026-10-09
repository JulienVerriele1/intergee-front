<script setup>
import { ref, watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import AppHeader from '@/components/AppHeader.vue'

const route = useRoute()
const router = useRouter()
const { isAuthenticated } = storeToRefs(useAuthStore())
const mainElement = ref(null)

// Single place handling the end of a session: logout button, expired token, 401 from the API
watch(isAuthenticated, (authenticated) => {
  if (!authenticated && route.meta.requiresAuth) {
    router.replace({ name: 'login', query: { redirect: route.fullPath } })
  }
})

// Moves the focus to the new page content, so that screen reader users know the page changed
router.afterEach((to, from) => {
  if (from.matched.length > 0) {
    mainElement.value?.focus()
  }
})
</script>

<template>
  <a
    href="#main-content"
    class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:shadow"
  >
    Aller au contenu
  </a>
  <div class="flex min-h-dvh flex-col">
    <AppHeader />
    <main id="main-content" ref="mainElement" tabindex="-1" class="mx-auto w-full max-w-5xl flex-1 px-4 py-6 outline-none sm:px-6 sm:py-10">
      <RouterView />
    </main>
    <footer class="border-t border-slate-200 bg-white py-4 text-center text-sm text-slate-600">
      Intergee — entraide entre générations
    </footer>
  </div>
</template>

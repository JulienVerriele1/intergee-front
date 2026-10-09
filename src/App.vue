<script setup>
import { ref, watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import AppHeader from '@/components/AppHeader.vue'
import AppBackdrop from '@/components/AppBackdrop.vue'

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
    class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-full focus:bg-surface-raised focus:px-6 focus:py-3 focus:font-bold focus:text-primary-ink focus:shadow-card focus:outline-3 focus:outline-focus"
  >
    Aller au contenu
  </a>
  <div class="flex min-h-dvh flex-col">
    <AppHeader />
    <!-- The backdrop fills the space between header and footer; isolate keeps its negative z-index above the page -->
    <div class="relative isolate flex flex-1 flex-col">
      <AppBackdrop />
      <main id="main-content" ref="mainElement" tabindex="-1" class="mx-auto w-full max-w-5xl flex-1 px-4 py-8 outline-none sm:px-6 sm:py-12">
        <RouterView />
      </main>
    </div>
    <footer class="border-t border-border-subtle bg-surface-sunken py-6 text-center text-base text-ink-muted">
      Intergee — entraide entre générations
    </footer>
  </div>
</template>

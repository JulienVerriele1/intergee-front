import { readonly, ref } from 'vue'

const STORAGE_KEY = 'intergee-theme'
const darkQuery = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null

function storedTheme() {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

// index.html already set data-theme before the first paint: start from it
const theme = ref(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')

function apply(value) {
  theme.value = value
  document.documentElement.dataset.theme = value
  // The browser bar follows the chosen theme rather than the system one
  document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
    meta.content = value === 'dark' ? '#131a1c' : '#0e6b62'
  })
}

// Until the visitor chooses, the theme follows the system setting
darkQuery?.addEventListener?.('change', (event) => {
  if (!storedTheme()) {
    apply(event.matches ? 'dark' : 'light')
  }
})

/** Light or dark theme of the design system, remembered on this device. */
export function useTheme() {
  function toggleTheme() {
    const next = theme.value === 'dark' ? 'light' : 'dark'
    apply(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Private browsing or blocked storage: the choice lasts for this visit only
    }
  }

  return { theme: readonly(theme), toggleTheme }
}

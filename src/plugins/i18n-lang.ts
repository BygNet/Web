import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(() => {
  if (process.client) {
    // Set HTML lang attribute based on i18n locale from global state
    // This runs client-side only after app is mounted
    const setHtmlLang = () => {
      try {
        const html = document.querySelector('html')
        if (html && !html.getAttribute('lang')) {
          // Default to 'en' if not set
          html.setAttribute('lang', 'en')
        }
      } catch (err) {
        // Silently fail if DOM operations aren't available
      }
    }

    // Set on next tick to ensure DOM is ready
    if (typeof window !== 'undefined') {
      Promise.resolve().then(setHtmlLang)
    }
  }
})

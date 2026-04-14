import { watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  if (process.client) {
    // Use hook to ensure i18n is initialized
    nuxtApp.hook('app:mounted', () => {
      const { locale } = useI18n()

      const setHtmlLang = () => {
        const html = document.querySelector('html')
        if (html) {
          html.lang = locale.value
        }
      }

      // Set immediately
      setHtmlLang()

      // Watch for locale changes
      watch(() => locale.value, setHtmlLang)
    })
  }
})

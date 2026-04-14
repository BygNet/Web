import { watch } from 'vue'

export default defineNuxtPlugin(() => {
  if (process.client) {
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
  }
})

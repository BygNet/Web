import { defineNuxtPlugin } from 'nuxt/app'
import { watch } from 'vue'

import { applyThemeClass, currentThemeKey, loadTheme } from '@/data/themes'

export default defineNuxtPlugin(() => {
  loadTheme()

  watch(
    currentThemeKey,
    themeKey => {
      if (!themeKey) return
      applyThemeClass(themeKey)
    },
    {
      immediate: true,
    }
  )
})

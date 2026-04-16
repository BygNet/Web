import { addCollection } from '@iconify/vue'
import { icons as solar } from '@iconify-json/solar'

import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(() => {
  addCollection(solar)
})

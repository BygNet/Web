export default defineNuxtPlugin(nuxtApp => {
  const route = useRoute()

  const originalT = nuxtApp.$i18n.t.bind(nuxtApp.$i18n)

  nuxtApp.$i18n.t = ((...args) => {
    const result = originalT(...args)

    if (route.query.uwu !== undefined && typeof result === 'string') {
      return uwuify(result)
    }

    return result
  }) as typeof nuxtApp.$i18n.t
})

function uwuify(text: string) {
  return text.replace(/[rl]/g, 'w').replace(/[RL]/g, 'W') + '~'
}

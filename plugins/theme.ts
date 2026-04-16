export default defineNuxtPlugin(() => {
  if (process.client) {
    // On client, apply theme from localStorage
    const theme =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem('bygTheme') || 'auto'
        : 'auto'

    if (typeof document !== 'undefined') {
      const html = document.querySelector('html')
      if (html && !html.classList.contains(theme)) {
        html.classList.add(theme)
      }
    }
  }
})

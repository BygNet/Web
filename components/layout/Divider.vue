<template>
  <div class="divider" />
</template>

<style scoped lang="sass">
@use "@/styles/themes"

.divider
  width: calc(100% - 3rem)
  margin: 0.75rem 1.5rem
  height: 0.1rem
  border-radius: 0.1rem
  background: themes.$textColor
  opacity: 0.1
</style>

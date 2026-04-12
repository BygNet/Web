<script setup lang="ts">
  import type { BygPage } from '@bygnet/types'
  import { Icon } from '@iconify/vue'

  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import { BygPages, MorePages } from '@/data/pages.ts'

  defineProps<{
    embed?: boolean
    apps?: BygPage[]
  }>()
</script>

<template>
  <div class="appsList" :class="{ embed }">
    <a
      v-for="app in [...BygPages, ...MorePages]"
      v-if="embed"
      :href="app.path"
      target="_top"
    >
      <HStack class="appItem fullWidth">
        <div class="appIcon">
          <Icon :icon="app.icon" />
          <div class="appIconBackground" :style="{ '--tint': app.color }" />
        </div>

        <VStack class="noSpace appInfo">
          <h3>{{ app.title }}</h3>
          <p class="light">{{ app.description }}</p>
        </VStack>
      </HStack>
    </a>

    <RouterLink
      v-else
      v-for="app in [...BygPages, ...MorePages]"
      :to="app.path"
    >
      <div class="appItem fullWidth">
        <div class="appIcon">
          <Icon :icon="app.icon" />
          <div class="appIconBackground" :style="{ '--tint': app.color }" />
        </div>

        <p>{{ app.title }}</p>
      </div>
    </RouterLink>
  </div>
</template>

<style scoped lang="sass">
  @use "@/styles/themes"

  .appsList
    display: grid
    align-content: start
    grid-template-columns: repeat(auto-fill, minmax(5rem, 1fr))
    gap: 0.75rem
    width: 100%

    &.embed
      grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr))

    &:not(.embed)
      row-gap: 2rem

      .appItem
        gap: 0.5rem

    .appItem
      *
        white-space: nowrap
        overflow: hidden
        text-overflow: ellipsis

      .appIcon
        position: relative
        padding: 0.5rem

        svg
          width: 2rem
          height: 2rem
          z-index: 1

        .appIconBackground
          position: absolute
          top: 0
          bottom: 0
          left: 0
          right: 0
          border-radius: 1rem
          background: linear-gradient(to bottom, var(--tint), hsl(from var(--tint) calc(h - 40) s l))
          opacity: 0.7

      .appInfo
        gap: 0

        *
          margin: 0
</style>

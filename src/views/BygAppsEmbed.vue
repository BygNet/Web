<script setup lang="ts">
  import { Icon } from '@iconify/vue'

  import EmbedShell from '@/components/embeds/EmbedShell.vue'
  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import { BygPages, MorePages } from '@/data/pages.ts'
  import setHeadMeta from '@/utils/setHeadMeta.ts'

  setHeadMeta({
    page: 'Apps Embed',
    subtitle: 'Embeddable app launcher for Byg.',
  })
</script>

<template>
  <EmbedShell title="Byg Apps" class="bygAppsEmbed">
    <div class="appsList">
      <a
        v-for="app in [...BygPages, ...MorePages]"
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
    </div>
  </EmbedShell>
</template>

<style scoped lang="sass">
  @use "@/styles/themes"

  .bygAppsEmbed
    .appsList
      display: grid
      grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr))
      align-content: start
      gap: 0.75rem
      width: 100%

      .appItem
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

        .appInfo
          gap: 0

          *
            margin: 0
</style>

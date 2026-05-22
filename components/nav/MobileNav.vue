<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import { useI18n } from 'vue-i18n'
  import { ProgressiveBlur } from 'vue-progressive-blur'

  import SafeLink from '@/components/base/SafeLink.vue'
  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import { BygPages, ExplorePage } from '@/data/pages'
  import { showingCreateModal } from '@/data/visibility'
  import { toggleCreateModal } from '@/utils/createModalManager'
  import { isActive } from '@/utils/isActive'
  import { useRoute } from '#app'

  const route = useRoute()
  const { t } = useI18n()
</script>

<template>
  <div class="bygMobileNav background">
    <button
      class="createButton prominent large"
      @click="toggleCreateModal()"
      :class="{ open: showingCreateModal }"
    >
      <Icon icon="mingcute:add-fill" />
      {{ t('common.createEllipsis') }}
    </button>

    <HStack class="mobileNavItems">
      <SafeLink v-for="page in [...BygPages, ExplorePage]" :to="page.path">
        <VStack
          class="mobileNavItem"
          :class="{ selected: isActive(route.path, page.path) }"
        >
          <Icon
            :icon="
              isActive(route.path, page.path)
                ? page.icon.replace('line-duotone', 'bold-duotone')
                : page.icon
            "
          />
        </VStack>
      </SafeLink>
    </HStack>

    <ProgressiveBlur :blur="24" :border-radius="0" class="navBlur" />
  </div>
</template>

<style scoped lang="sass">
  @use "@/styles/variables"
  @use "@/styles/themes"

  .bygMobileNav
    --bottom: calc(max(env(safe-area-inset-bottom), 1rem) - var(--padding))

    display: none
    flex-wrap: wrap
    align-items: flex-end
    gap: 1rem
    position: sticky
    bottom: 0
    padding: 0 0.5rem
    z-index: 5001
    width: 100%
    border-radius: 0

    &::before
      background: linear-gradient(to right, var(--gradientOfTheDay))
      mask-image: linear-gradient(to top, black, transparent)
      opacity: 0.3

    .createButton
      svg
        transition: 0.2s ease-in-out
      &.open
        svg
          transform: rotate(45deg)

    .mobileNavItems
      width: 100%
      padding: 0.25rem
      gap: 0
      justify-content: space-around
      margin-bottom: var(--bottom)

      .mobileNavItem
        align-items: center
        padding: 0.45rem 0.35rem
        gap: 0
        border-radius: 10rem

        &:not(.selected)
          opacity: 0.6

        svg
          width: 1.75rem
          height: 1.75rem

        p
          font-size: 0.75rem

    .navBlur
      position: absolute
      bottom: 0
      width: 100%
      height: 100%
      z-index: -1
      border-radius: var(--borderRadius)

  @media (max-width: variables.$mobileWidth)
    .bygMobileNav
      display: flex
</style>

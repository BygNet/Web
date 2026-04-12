<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import { ProgressiveBlur } from 'vue-progressive-blur'

  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import { BygPages, MorePage } from '@/data/pages.ts'
  import { showingCreateModal } from '@/data/visibility.ts'
  import router from '@/router.ts'
  import { toggleCreateModal } from '@/utils/createModalManager.ts'
</script>

<template>
  <div class="bygMobileNav">
    <button
      class="createButton prominent large"
      @click="toggleCreateModal()"
      :class="{ open: showingCreateModal }"
    >
      <Icon icon="mingcute:add-fill" />
      Create...
    </button>

    <HStack class="mobileNavItems">
      <RouterLink v-for="page in [...BygPages, MorePage]" :to="page.path">
        <VStack
          class="mobileNavItem"
          :class="{ selected: router.currentRoute.value.path === page.path }"
        >
          <Icon
            :icon="
              router.currentRoute.value.path === page.path
                ? page.icon.replace('line-duotone', 'bold-duotone')
                : page.icon
            "
          />
          <p>{{ page.title }}</p>
        </VStack>
      </RouterLink>
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
    background: linear-gradient(to top, themes.$backgroundColor, transparent)

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
        min-width: 3.75rem
        padding: 0.45rem 0.35rem
        gap: 0
        border-radius: 10rem

        &.selected *
          color: themes.$accentColor

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

<script setup lang="ts">
  import { Icon } from '@iconify/vue'

  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import { BygPages } from '@/data/pages.ts'
  import router from '@/router.ts'
  import {toggleCreateModal} from "@/utils/createModalManager.ts";
  import {showingCreateModal} from "@/data/visibility.ts";
</script>

<template>
  <div class="bygMobileNav">
    <button
      class="createButton prominent large"
      @click="toggleCreateModal()"
      :class="{ open: showingCreateModal }"
    >
      <Icon icon="mingcute:add-fill" />
    </button>

    <HStack class="mobileNavItems">
      <RouterLink v-for="page in BygPages" :to="page.path">
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
  </div>
</template>

<style scoped lang="sass">
  @use "@/styles/variables"
  @use "@/styles/themes"

  .bygMobileNav
    --bottom: calc(max(env(safe-area-inset-bottom), 1rem) - var(--padding))

    display: none
    align-items: flex-end
    gap: 1rem
    position: sticky
    bottom: var(--bottom)
    padding: 0 0.5rem
    z-index: 5001

    .createButton
      svg
        transition: 0.2s ease-in-out
      &.open
        svg
          transform: rotate(45deg)

    .mobileNavItems
      background: themes.$foregroundColor
      backdrop-filter: blur(0.75rem)
      border-radius: 10rem
      padding: 0.15rem
      border: 0.1rem solid themes.$foregroundColor
      gap: 0
      margin: auto

      .mobileNavItem
        align-items: center
        min-width: 3rem
        padding: 0.35rem 0.25rem
        gap: 0
        border-radius: 10rem

        &.selected
          padding: 0.35rem 0.5rem
          background: themes.$foregroundColor

        svg
          width: 1.5rem
          height: 1.5rem

        p
          font-size: x-small

  @media (max-width: variables.$mobileWidth)
    .bygMobileNav
      display: flex
</style>

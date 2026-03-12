<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import { type Ref, ref } from 'vue'

  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import { BygPages, MorePages } from '@/data/pages.ts'
  import { showingCreateModal } from '@/data/visibility.ts'
  import router from '@/router.ts'
  import { toggleCreateModal } from '@/utils/createModalManager.ts'

  const extendedDisplayMode: Ref<boolean> = ref(false)
</script>

<template>
  <div class="bygMobileNav">
    <button
      class="createButton prominent large"
      @click="toggleCreateModal()"
      :class="{ open: showingCreateModal }"
      v-if="!extendedDisplayMode"
    >
      <Icon icon="mingcute:add-fill" />
    </button>

    <HStack class="mobileNavItems" :class="{ extended: extendedDisplayMode }">
      <RouterLink
        v-for="page in extendedDisplayMode
          ? [...BygPages, ...MorePages]
          : BygPages"
        :to="page.path"
      >
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

      <VStack
        class="mobileNavItem"
        @click="extendedDisplayMode = !extendedDisplayMode"
        :class="{
          selected: MorePages.some(
            p => p.path === router.currentRoute.value.path
          ),
        }"
      >
        <Icon icon="solar:menu-dots-line-duotone" />
        <p>{{ extendedDisplayMode ? 'Less' : 'More' }}</p>
      </VStack>
    </HStack>
  </div>
</template>

<style scoped lang="sass">
  @use "@/styles/variables"
  @use "@/styles/themes"

  .bygMobileNav
    --bottom: calc(max(env(safe-area-inset-bottom), 1rem) - var(--padding))

    display: none
    flex-direction: row
    flex-wrap: wrap
    justify-content: space-between
    gap: 1rem
    position: sticky
    bottom: var(--bottom)
    padding: 0 0.5rem
    z-index: 5001
    width: 100%

    .createButton
      svg
        transition: 0.2s ease-in-out
      &.open
        svg
          transform: rotate(45deg)

    .mobileNavItems
      --borderRadius: 10rem

      background: themes.$foregroundColor
      backdrop-filter: blur(0.25rem)
      border-radius: var(--borderRadius)
      padding: 0.25rem
      gap: 0

      &::after
        content: ""
        position: absolute
        top: 0
        left: 0
        right: 0
        bottom: 0
        border: 0.1rem solid themes.$foregroundColor
        border-radius: var(--borderRadius)
        mask: conic-gradient(#000000 0%, #000000 15%, rgba(255,255,255,0) 22%, #000000 28%, rgba(0,0,0,1) 66%, rgba(255,255,255,0) 72%, #000000 78%, #000000 100%)
        pointer-events: none

      &.extended
        --borderRadius: 1.5rem

        width: 100%
        flex-direction: column
        align-items: flex-start

        .mobileNavItem
          flex-direction: row
          gap: 0.5rem

          p
            font-size: medium

      .mobileNavItem
        align-items: center
        min-width: 3.75rem
        padding: 0.45rem 0.35rem
        gap: 0
        border-radius: 10rem

        &.selected
          padding: 0.45rem 0.5rem
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

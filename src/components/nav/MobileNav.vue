<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import { type Ref, ref } from 'vue'
  import { ProgressiveBlur } from 'vue-progressive-blur'

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
      Create...
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

      &.extended
        border-radius: 1.5rem
        width: 100%
        flex-direction: column
        align-items: flex-start
        background: themes.$foregroundColor
        backdrop-filter: blur(0.25rem)

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

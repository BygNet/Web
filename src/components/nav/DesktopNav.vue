<script setup lang="ts">
  import { Icon } from '@iconify/vue'

  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import { BygPages } from '@/data/pages.ts'
  import router from '@/router.ts'
  import { openCreateModal } from '@/utils/createModalManager.ts'
</script>

<template>
  <nav class="desktopNav">
    <VStack class="header">
      <RouterLink to="/">
        <HStack class="bygLogo">
          <img class="bygLogoImage" src="/favicon.ico" alt="Byg Icon" />
          <h1>Byg β</h1>
          <p class="light">This is Byg Platform.</p>
        </HStack>
      </RouterLink>

      <button
        id="createButton"
        class="prominent large"
        @click="openCreateModal()"
      >
        <Icon icon="solar:pen-new-square-line-duotone" />
        Create...
      </button>
    </VStack>

    <VStack class="pages">
      <RouterLink v-for="page in BygPages" :to="page.path">
        <HStack
          class="desktopNavItem"
          :class="{ selected: router.currentRoute.value.path === page.path }"
        >
          <Icon
            :icon="
              router.currentRoute.value.path === page.path
                ? page.icon.replace('line-duotone', 'bold-duotone')
                : page.icon
            "
          />
          <h3>
            {{ page.title }}
          </h3>
        </HStack>
      </RouterLink>
    </VStack>

    <a href="https://github.com/BygNet" target="_blank">
      <HStack>
        <Icon icon="solar:code-line-duotone" />
        GitHub
      </HStack>
    </a>
  </nav>
</template>

<style scoped lang="sass">
  @use "@/styles/variables"
  @use "@/styles/themes"

  @mixin outPad
    margin: 0 -0.75rem

  .desktopNav
    display: none
    align-items: flex-start
    justify-content: space-between
    min-width: 12rem
    width: 16rem
    gap: 2rem
    padding: var(--padding)
    height: calc(100vh - var(--padding)*2)
    overflow-y: scroll
    border-right: 0.2rem solid themes.$foregroundColor

    .header
      gap: 1rem

      #createButton
        @include outPad

    .bygLogo
      align-items: center

      .bygLogoImage
        width: 2.5rem
        height: 2.5rem

  .desktopNavItem
    @include outPad

    padding: 0.75rem
    transition: 0.2s ease

    &:not(.selected, :hover)
      opacity: 0.9

    &.selected
      padding: 0.75rem 1rem
      gap: 0.75rem

    &:hover, &.selected
      background: themes.$foregroundColor
      border-radius: 5rem
      transform-origin: left
      transform: scale(1.1)

      h3
        font-weight: 900

    svg
      width: 2rem
      height: 2rem

  @media (min-width: variables.$mobileWidth)
    .desktopNav
      display: flex
      flex-direction: column
</style>

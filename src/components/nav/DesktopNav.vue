<script setup lang="ts">
  import { BygPages } from '@/data/pages.ts'
  import { Icon } from '@iconify/vue'
  import HStack from '@/components/layout/HStack.vue'
  import router from '@/router.ts'
  import VStack from '@/components/layout/VStack.vue'
</script>

<template>
  <nav class="desktopNav">
    <RouterLink to="/">
      <HStack class="bygLogo">
        <img class="bygLogoImage" src="/favicon.ico" alt="Byg Icon" />
        <h1>Byg β</h1>
      </HStack>
    </RouterLink>

    <VStack>
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
  @use "@/styles/colors"

  .desktopNav
    display: none
    align-items: flex-start
    justify-content: space-between
    min-width: 12rem
    width: 16rem
    padding: var(--padding)
    height: calc(100vh - var(--padding)*2)

    border-right: 0.2rem solid colors.$foregroundColor

    .bygLogo
      align-items: center

      .bygLogoImage
        width: 2.5rem
        height: 2.5rem

  .desktopNavItem
    margin: 0 -0.75rem
    padding: 0.75rem
    transition: 0.2s ease

    &:hover, &.selected
      background: colors.$foregroundColor
      border-radius: 5rem

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

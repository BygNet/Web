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
      <h1 class="bygLogo">Byg β</h1>
    </RouterLink>

    <VStack>
      <RouterLink v-for="page in BygPages" :to="page.path">
        <HStack class="desktopNavItem">
          <Icon
            :icon="
              router.currentRoute.value.path === page.path
                ? page.icon.replace('line-duotone', 'bold-duotone')
                : page.icon
            "
          />
          <h3 :class="{ bold: router.currentRoute.value.path === page.path }">
            {{ page.title }}
          </h3>
        </HStack>
      </RouterLink>
    </VStack>

    <a href="https://github.com/BygNet">
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
    width: 16rem
    padding: var(--padding)
    height: calc(100vh - var(--padding)*2)

    border-right: 0.2rem solid colors.$foregroundColor

  .desktopNavItem
    margin: 0 -0.75rem
    padding: 0.75rem
    transition: 0.2s ease

    &:hover
      background: colors.$foregroundColor
      border-radius: 5rem

    svg
      width: 2rem
      height: 2rem

  @media (min-width: variables.$mobileWidth)
    .desktopNav
      display: flex
      flex-direction: column
</style>

<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import { BygPages } from '@/data/pages.ts'
  import router from '@/router.ts'
</script>

<template>
  <div class="bygMobileNav">
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
  @use "@/styles/colors"

  .bygMobileNav
    display: none
    position: sticky
    bottom: 0.5rem
    left: 0.5rem
    right: 0.5rem
    width: fit-content
    margin: auto
    background: colors.$foregroundColor
    backdrop-filter: blur(0.75rem)
    border-radius: 10rem
    padding: 0.25rem
    border: 0.2rem solid colors.$foregroundColor

    .mobileNavItems
      gap: 0.25rem

      .mobileNavItem
        align-items: center
        min-width: 3rem
        padding: 0.5rem 0.25rem
        gap: 0
        border-radius: 10rem

        &.selected
          padding: 0.5rem 0.75rem
          background: colors.$foregroundColor

        svg
          width: 1.5rem
          height: 1.5rem

        p
          font-size: x-small

  @media (max-width: variables.$mobileWidth)
    .bygMobileNav
      display: flex
</style>

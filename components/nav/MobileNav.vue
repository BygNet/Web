<script setup lang="ts">
import SafeLink from '@/components/base/SafeLink.vue'
import HStack from '@/components/layout/HStack.vue'
import VStack from '@/components/layout/VStack.vue'
import { type BygPageMeta, BygPages, ExplorePage } from '@/data/pages'
import { toggleCreateModal } from '@/utils/createModalManager'
import { isActive } from '@/utils/isActive'
import { useRoute } from '#app'

const route = useRoute()

const activePage = computed(() => {
  const matchingPage = [ ...BygPages ].find(page =>
    isActive(route.path, page.path)
  )

  return matchingPage ?? ExplorePage
})

function pageHref(page: BygPageMeta): string {
  return page.path
}

function badgeValue(page: BygPageMeta): number {
  return Math.max(0, page.badge?.value ?? 0)
}
</script>

<template>
  <div class="bygMobileNav background">
    <button class="createButton prominent large" @click="toggleCreateModal()">
      <Icon name="solar:pen-line-duotone" />
    </button>

    <HStack class="mobileNavItems glowEffect">
      <SafeLink
        no-preview
        v-for="page in [...BygPages, ExplorePage]"
        :to="pageHref(page)"
        class="mobileNavLink"
      >
        <VStack
          class="mobileNavItem"
          :class="{
            'selected glowEffect background': activePage.path === page.path,
          }"
        >
          <Icon
            :name="
              activePage.path === page.path
                ? page.icon.replace('line-duotone', 'bold-duotone')
                : page.icon
            "
          />
          <span v-if="badgeValue(page)" class="navBadge">
            {{ badgeValue(page) }}
          </span>
        </VStack>
      </SafeLink>
    </HStack>
  </div>
</template>

<style scoped lang="sass">
@use "@/styles/variables"

.bygMobileNav
  --bottom: calc(max(env(safe-area-inset-bottom), 0.75rem) - var(--padding))

  display: none
  flex-wrap: wrap
  align-items: flex-end
  gap: 0.5rem
  position: sticky
  bottom: 0
  padding-inline-start: max(env(safe-area-inset-left), var(--bottom))
  padding-inline-end: max(env(safe-area-inset-right), var(--bottom))
  z-index: 5001
  width: 100%
  border-radius: 0

  &::before
    background: linear-gradient(to top, var(--backgroundColor), transparent)
    opacity: 0.7

  .createButton
    margin-inline-end: 0.75rem

  .mobileNavItems
    position: relative
    width: 100%
    padding: 0.35rem
    gap: 0
    margin-bottom: var(--bottom)
    background: var(--foregroundColor)
    backdrop-filter: blur(0.5rem)

    &, &::before
      border-radius: 2.5rem

    :deep(.mobileNavLink)
      flex-grow: 1

    .mobileNavItem
      --buttonDarken: transparent

      position: relative
      align-items: center
      padding: 0.65rem 0.35rem
      gap: 0
      transition: 0.2s ease
      width: 100%

      &, &::before
        border-radius: 2.5rem

      &.selected
        background: var(--foregroundColor)

        &::before
          background: linear-gradient(135deg, var(--gradientOfTheDay))
          opacity: 0.3

      &:not(.selected)
        opacity: 0.6

      &:hover
        scale: 1.05
      &:active
        scale: 0.95

      span.iconify
        width: 2rem
        height: 2rem

      p
        font-size: 0.75rem

      .navBadge
        position: absolute
        top: -0.5rem
        right: -0.5rem
        min-width: 1.1rem
        padding: 0.25rem 0.5rem
        border-radius: 10rem
        background: var(--accentColor)
        font-size: small
        line-height: 1
        text-align: center

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

<script setup lang="ts">
  import { useI18n } from 'vue-i18n'
  import { ProgressiveBlur } from 'vue-progressive-blur'

  import SafeLink from '@/components/base/SafeLink.vue'
  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import {
    type BygPageMeta,
    BygPages,
    ExplorePage,
    MessagesPage,
  } from '@/data/pages'
  import { showingCreateModal } from '@/data/visibility'
  import { toggleCreateModal } from '@/utils/createModalManager'
  import { useEnv } from '@/utils/env'
  import { isActive } from '@/utils/isActive'
  import { useRoute } from '#app'

  const route = useRoute()
  const { t } = useI18n()
  // const { chatUrl } = useEnv()

  function pageHref(page: BygPageMeta): string {
    // Disable new chat for now
    // return page === MessagesPage ? chatUrl : page.path
    return page.path
  }

  function isExternalPage(page: BygPageMeta): boolean {
    return page === MessagesPage
  }

  function badgeValue(page: BygPageMeta): number {
    return Math.max(0, page.badge?.value ?? 0)
  }
</script>

<template>
  <div class="bygMobileNav background">
    <button
      class="createButton prominent large"
      @click="toggleCreateModal()"
      :class="{ open: showingCreateModal }"
    >
      <Icon name="mingcute:add-fill" />
      {{ t('common.createEllipsis') }}
    </button>

    <HStack class="mobileNavItems">
      <SafeLink
        v-for="page in [...BygPages, ExplorePage]"
        :to="pageHref(page)"
        class="mobileNavLink"
      >
        <VStack
          class="mobileNavItem"
          :class="{ selected: isActive(route.path, page.path) }"
        >
          <Icon
            :name="
              isActive(route.path, page.path)
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
      background: linear-gradient(to var(--trailing), var(--gradientOfTheDay))
      mask-image: linear-gradient(to top, black, transparent)
      opacity: 0.3

    .createButton
      span.iconify
        transition: 0.2s ease-in-out
      &.open
        span.iconify
          transform: rotate(45deg)

    .mobileNavItems
      width: 100%
      padding: 0.25rem
      gap: 0
      justify-content: space-around
      margin-bottom: var(--bottom)

      .mobileNavItem
        position: relative
        align-items: center
        padding: 0.45rem 0.35rem
        gap: 0
        border-radius: 10rem

        &:not(.selected)
          opacity: 0.6

        span.iconify
          width: 1.75rem
          height: 1.75rem

        p
          font-size: 0.75rem

        .navBadge
          position: absolute
          top: 0
          right: 0
          min-width: 1.1rem
          padding: 0.15rem
          border-radius: 10rem
          background: themes.$accentColor
          font-size: 0.65rem
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

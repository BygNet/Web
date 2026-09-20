<script setup lang="ts">
  import { useI18n } from 'vue-i18n'

  import SafeLink from '@/components/base/SafeLink.vue'
  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import AccountSwitcher from '@/components/nav/AccountSwitcher.vue'
  import {
    type BygPageMeta,
    CreatePage,
    DesktopPages,
    MessagesPage,
    SpacerPage,
  } from '@/data/pages'
  import { openCreateModal } from '@/utils/createModalManager'
  import { useEnv } from '@/utils/env'
  import { isActive } from '@/utils/isActive'
  import { useRoute } from '#app'
  import BygLogo from '~/components/brand/BygLogo.vue'

  const AppVersion = __AppVersion
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

  function create(page: BygPageMeta): void {
    if (page === CreatePage) openCreateModal()
  }
</script>

<template>
  <nav class="desktopNav background">
    <VStack class="header">
      <SafeLink to="/">
        <HStack class="bygLogo">
          <BygLogo class="bygLogoImage" />
        </HStack>
      </SafeLink>

      <VStack class="pages">
        <SafeLink
          v-for="page in DesktopPages"
          :key="page.path"
          :to="pageHref(page)"
          class="fullWidth"
          :disable="page === CreatePage"
          @click="create(page)"
        >
          <HStack
            v-if="page !== SpacerPage"
            class="desktopNavItem"
            :class="{ selected: isActive(route.path, page.path) }"
          >
            <div class="icon">
              <Icon
                :name="
                  isActive(route.path, page.path)
                    ? page.icon.replace('line-duotone', 'bold-duotone')
                    : page.icon
                "
              />
            </div>

            <h3 class="title">
              {{ t(page.titleKey) }}
            </h3>

            <span v-if="badgeValue(page)" class="navBadge">
              {{ badgeValue(page) }}
            </span>
          </HStack>

          <div v-else class="desktopSpacer" />
        </SafeLink>
      </VStack>
    </VStack>

    <VStack class="accountSection">
      <ClientOnly>
        <AccountSwitcher class="accountWidget" />
      </ClientOnly>

      <HStack class="footer fullWidth autoSpace">
        <a href="https://git.new/bygpl" target="_blank">
          <HStack>
            <Icon name="solar:code-line-duotone" />
            {{ t('common.github') }}
          </HStack>
        </a>

        {{ AppVersion }}
      </HStack>
    </VStack>
  </nav>
</template>

<style scoped lang="sass">
  @use "@/styles/variables"
  @use "@/styles/themes"

  .desktopNav
    display: none
    position: relative
    height: 100vh
    padding: calc(var(--padding) / 2)
    gap: 2rem
    overflow-x: hidden
    overflow-y: auto
    align-items: flex-start
    justify-content: space-between
    animation: slideIn 0.3s ease-in-out
    flex: 0 0 7rem
    width: 7rem
    min-width: 0
    transition: width 0.25s ease, flex-basis 0.25s ease

    &:not(:hover)
      .desktopNavItem
        &:hover,
        &.selected
          padding: 0

          .icon
            border-radius: 1.25rem
            padding: 0.45rem 0.65rem
            background-color: themes.$foregroundColor

    &:hover
      width: 18rem
      flex-basis: 18rem

      .desktopNavItem
        &:hover,
        &.selected
          opacity: 1
          background: themes.$foregroundColor
          box-shadow: inset 0 0.1rem 0.2rem themes.$foregroundColor

        .title
          width: 10rem
          opacity: 1
          transform: translateX(0)

      .bygLogo
        justify-content: flex-start

      .accountSection
        opacity: 1
        transform: translateY(0)
        pointer-events: auto

      .footer
        opacity: 1

    &::before
      background: linear-gradient(to bottom, var(--gradientOfTheDay))
      mask-image: linear-gradient(to var(--trailing), black, transparent)
      opacity: 0.3

  .header
    width: 100%
    gap: 1rem

  .bygLogo
    width: 100%
    padding: 0.35rem
    justify-content: center
    transition: justify-content 0.25s ease

    .bygLogoImage
      width: 4.5rem
      height: 2.5rem
      flex-shrink: 0
      mask-image: linear-gradient(to bottom, black, rgb(0 0 0 / 0.65))

  .pages
    position: relative
    width: 100%
    gap: 0.25rem

  .desktopSpacer
    height: 1rem
    cursor: default

  .desktopNavItem
    position: relative
    width: 100%
    height: 3rem
    padding: 0.45rem 0.65rem
    gap: 0.5rem
    border-radius: 1.25rem
    cursor: pointer
    opacity: 0.9
    overflow: hidden

    transition: background 0.2s ease, opacity 0.2s ease

    .icon
      transition: background-color 0.2s ease
      background-color: transparent

      span.iconify
        width: 1.85rem
        height: 1.85rem
        flex: 0 0 1.85rem

    .title
      width: 0
      margin: 0
      opacity: 0
      overflow: hidden
      white-space: nowrap
      transform: translateX(-0.25rem)
      transition: width 0.25s ease, opacity 0.15s ease, transform 0.25s ease

    .navBadge
      position: absolute
      top: 0.2rem
      right: 0.2rem
      min-width: 1.1rem
      padding: 0.15rem
      border-radius: 10rem
      background: themes.$accentColor
      font-size: 0.65rem
      line-height: 1
      text-align: center

  .accountSection
    width: 100%
    gap: 1rem
    opacity: 0
    transform: translateY(0.5rem)
    pointer-events: none
    transition: opacity 0.05s ease, transform 0.05s ease

  .footer
    opacity: 0
    transition: opacity 0.2s ease

  @keyframes slideIn
    from
      transform: translateX(-100%)
      opacity: 0.4

    to
      transform: translateX(0)
      opacity: 1

  @media (min-width: variables.$mobileWidth)
    .desktopNav
      display: flex
      flex-direction: column
</style>

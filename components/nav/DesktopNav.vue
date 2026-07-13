<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import { useI18n } from 'vue-i18n'

  import SafeLink from '@/components/base/SafeLink.vue'
  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import AccountSwitcher from '@/components/nav/AccountSwitcher.vue'
  import {
    type BygPageMeta,
    CreatePage,
    DesktopPages,
    SpacerPage,
  } from '@/data/pages'
  import { openCreateModal } from '@/utils/createModalManager'
  import { isActive } from '@/utils/isActive'
  import { useRoute } from '#app'
  import BygLogo from '~/components/brand/BygLogo.vue'

  const AppVersion = __AppVersion
  const route = useRoute()
  const { t } = useI18n()

  function create(page: BygPageMeta): void {
    if (page === CreatePage) {
      openCreateModal()
    } else {
      return
    }
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
          :to="page.path"
          class="fullWidth"
          :disable="page === CreatePage"
          @click="create(page)"
        >
          <HStack
            class="desktopNavItem"
            v-if="page !== SpacerPage"
            :class="{ selected: isActive(route.path, page.path) }"
          >
            <Icon
              :icon="
                isActive(route.path, page.path)
                  ? page.icon.replace('line-duotone', 'bold-duotone')
                  : page.icon
              "
            />
            <h3>
              {{ t(page.titleKey) }}
            </h3>
          </HStack>
          <div class="desktopSpacer" v-else />
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
            <Icon icon="solar:code-line-duotone" />
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
  @use "@/styles/utils"

  .desktopNav
    display: none
    position: relative
    align-items: flex-start
    justify-content: space-between
    min-width: 14rem
    width: 20rem
    flex-grow: 1
    gap: 2rem
    padding: calc(var(--padding) / 2)
    height: 100vh
    overflow-y: scroll
    animation: slideIn 0.3s ease-in-out

    @keyframes slideIn
      from
        transform: translateX(-100%)
        opacity: 0.4
      to
        transform: translateX(0)
        opacity: 1

    &::before
      background: linear-gradient(to bottom, var(--gradientOfTheDay))
      mask-image: linear-gradient(to var(--trailing), black, transparent)
      opacity: 0.3

    .header
      width: 100%
      gap: 1rem

    .bygLogo
      padding: 0.35rem

      .bygLogoImage
        width: 4.5rem
        height: 2.5rem
        mask-image: linear-gradient(to bottom, black, rgb(0 0 0 / 0.65))

  .desktopSpacer
    height: 1rem
    cursor: default

  .desktopNavItem
    padding: 0.45rem 0.65rem
    cursor: pointer
    width: 100%
    gap: 0.5rem
    border-radius: 1.25rem
    opacity: 0.9

    &, *
      transition: 0.2s ease

    &:hover, &.selected
      opacity: 1
      background: themes.$foregroundColor

    svg
      width: 1.85rem
      height: 1.85rem

  .pages
    position: relative
    width: 100%
    gap: 0.25rem

  .accountSection
    gap: 1rem
    width: 100%

  @media (min-width: variables.$mobileWidth)
    .desktopNav
      display: flex
      flex-direction: column
</style>

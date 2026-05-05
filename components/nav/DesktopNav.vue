<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import { useI18n } from 'vue-i18n'

  import SafeLink from '@/components/base/SafeLink.vue'
  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import AccountSwitcher from '@/components/nav/AccountSwitcher.vue'
  import { BygPages, ExplorePage, MorePages } from '@/data/pages'
  import { openCreateModal } from '@/utils/createModalManager'
  import { isActive } from '@/utils/isActive'
  import { useRoute } from '#app'

  const AppVersion = __AppVersion
  const route = useRoute()
  const { t } = useI18n()
</script>

<template>
  <nav class="desktopNav">
    <VStack class="header">
      <SafeLink to="/">
        <HStack class="bygLogo">
          <img class="bygLogoImage" src="/favicon.ico" alt="Byg Icon" />
          <h1>{{ t('common.brand') }}</h1>
        </HStack>
      </SafeLink>

      <button
        id="createButton"
        class="prominent large"
        @click="openCreateModal()"
      >
        <Icon icon="solar:pen-new-square-line-duotone" />
        {{ t('common.createEllipsis') }}
      </button>

      <VStack class="pages">
        <SafeLink
          v-for="page in [...BygPages, ...MorePages, ExplorePage]"
          :to="page.path"
          class="fullWidth"
        >
          <HStack
            class="desktopNavItem"
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
    align-items: flex-start
    justify-content: space-between
    min-width: 14rem
    width: 20rem
    flex-grow: 1
    gap: 2rem
    padding: calc(var(--padding) / 2)
    height: 100vh
    overflow-y: scroll
    background: linear-gradient(to left, themes.$backgroundColor, themes.$foregroundColor)
    animation: slideIn 0.3s ease-in-out

    @keyframes slideIn
      from
        transform: translateX(-100%)
        opacity: 0.4
      to
        transform: translateX(0)
        opacity: 1

    .header
      width: 100%
      gap: 1rem

    .bygLogo
      align-items: center

      .bygLogoImage
        width: 2.5rem
        height: 2.5rem

  .desktopNavItem
    padding: 0.35rem 0.5rem
    cursor: pointer
    width: 100%

    &, *
      transition: 0.2s ease

    &:not(.selected, :hover)
      opacity: 0.9

    &:hover, &.selected
      background: themes.$foregroundColor

      svg
        scale: 1.2

    &:hover
      padding: 0.5rem 0.75rem

    &.selected
      padding: 0.5rem 1rem

    svg
      width: 1.25rem
      height: 1.25rem

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

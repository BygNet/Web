<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import { type Ref, ref } from 'vue'

  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import { BygPages, MorePages } from '@/data/pages.ts'
  import router from '@/router.ts'
  import { openCreateModal } from '@/utils/createModalManager.ts'

  const AppVersion = __AppVersion
  const showingMoreItems: Ref<boolean> = ref(false)
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

      <HStack
        class="desktopNavItem"
        @click="showingMoreItems = !showingMoreItems"
        :class="{
          selected: MorePages.some(
            p => p.path === router.currentRoute.value.path
          ),
        }"
      >
        <Icon icon="solar:menu-dots-line-duotone" />
        <h3>More</h3>
      </HStack>

      <VStack
        class="morePages"
        v-if="showingMoreItems"
        @click="showingMoreItems = false"
      >
        <RouterLink v-for="page in MorePages" :to="page.path">
          <HStack class="moreDesktopNavItem">
            <Icon :icon="page.icon" />
            <h3>{{ page.title }}</h3>
          </HStack>
        </RouterLink>
      </VStack>
    </VStack>

    <HStack class="footer fullWidth autoSpace">
      <a href="https://git.new/bygpl" target="_blank">
        <HStack>
          <Icon icon="solar:code-line-duotone" />
          GitHub
        </HStack>
      </a>

      {{ AppVersion }}
    </HStack>
  </nav>
</template>

<style scoped lang="sass">
  @use "@/styles/variables"
  @use "@/styles/themes"
  @use "@/styles/utils"

  @mixin outPad
    margin: 0 -0.75rem

  .desktopNav
    display: none
    align-items: flex-start
    justify-content: space-between
    min-width: 14rem
    width: 20rem
    flex-grow: 1
    gap: 2rem
    padding: var(--padding)
    height: 100vh
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
    cursor: pointer

    &:not(.selected, :hover)
      opacity: 0.9

    &:hover, &.selected
      @include utils.itemBackground

      --cornerRadius: 5rem
      background: themes.$foregroundColor
      transform-origin: left
      transform: scale(1.1)

      h3
        font-weight: 900

    &.selected
      padding: 0.75rem 1rem

    svg
      width: 2rem
      height: 2rem

  .pages
    position: relative
    width: 100%

    .morePages
      position: absolute
      bottom: -5rem
      background: themes.$foregroundOpaque
      border-radius: 1.5rem
      width: 100%
      padding: 0.75rem

      svg
        width: 1.5rem
        height: 1.5rem

  @media (min-width: variables.$mobileWidth)
    .desktopNav
      display: flex
      flex-direction: column
</style>

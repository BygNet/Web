<script setup lang="ts">
  import type { BygProfile } from '@bygnet/types'
  import { Icon } from '@iconify/vue'
  import { computed, onMounted, onUnmounted, type Ref, ref, watch } from 'vue'

  import { logout } from '@/auth/logout'
  import { auth } from '@/auth/session'
  import ContentArea from '@/components/layout/ContentArea.vue'
  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import AccountSwitcher from '@/components/nav/AccountSwitcher.vue'
  import ProfileView from '@/components/profile/ProfileView.vue'
  import { fetchCurrentUserProfile } from '@/data/profiles'
  import { BygThemes, currentThemeKey, setTheme } from '@/data/themes.ts'
  import { title } from '@/data/title.ts'
  import {
    applyProfileThemeToDocument,
    clearDocumentProfileTheme,
  } from '@/utils/profileTheme.ts'
  import setHeadMeta from '@/utils/setHeadMeta.ts'
  import { navigateTo } from '#app'

  title.value = 'My Profile'
  setHeadMeta({ page: 'Profile', subtitle: 'Your Byg profile.' })
  const isLoggedIn = computed(() => !!auth.user)
  const hasAccounts = computed(() => auth.accounts.length > 0)
  const showingAppearances: Ref<boolean> = ref(false)
  const profile: Ref<BygProfile | null> = ref(null)
  const isPreviewingBaseTheme: Ref<boolean> = ref(false)
  const AppVersion = __AppVersion
  let themePreviewTimeout: number | null = null

  async function loadProfile(options: { force?: boolean } = {}): Promise<void> {
    profile.value = await fetchCurrentUserProfile(options)
  }

  async function doLogout() {
    await logout()
    await navigateTo({ name: 'social' })
  }

  function goLogin() {
    navigateTo({ name: 'login' })
  }

  function goSignup() {
    navigateTo({ name: 'signup' })
  }

  function goSettings() {
    navigateTo({ name: 'settings' })
  }

  function previewAndSetTheme(theme: (typeof BygThemes)[number]) {
    if (themePreviewTimeout != null) {
      window.clearTimeout(themePreviewTimeout)
    }

    isPreviewingBaseTheme.value = true
    setTheme(theme)
    clearDocumentProfileTheme()

    themePreviewTimeout = window.setTimeout(() => {
      isPreviewingBaseTheme.value = false
      applyProfileThemeToDocument(profile.value?.user.color)
      themePreviewTimeout = null
    }, 900)
  }

  onMounted(() => {
    if (isLoggedIn.value) {
      loadProfile()
    }
  })

  onUnmounted(() => {
    if (themePreviewTimeout != null) {
      window.clearTimeout(themePreviewTimeout)
    }
  })

  watch(
    () => auth.user?.id,
    async (nextId, previousId) => {
      if (!nextId) {
        profile.value = null
        return
      }
      if (nextId === previousId) return
      await loadProfile({ force: true })
    }
  )
</script>

<template>
  <ContentArea class="bygProfile">
    <HStack class="quickSettings autoSpace">
      <h3>Options</h3>

      <HStack>
        <button disabled>
          <Icon icon="solar:stars-line-duotone" />
          Byg Pro
        </button>

        <button @click="showingAppearances = true">
          <Icon icon="solar:pallete-2-line-duotone" />
          Appearance
        </button>

        <button @click="goSettings">
          <Icon icon="solar:settings-minimalistic-line-duotone" />
          Settings
        </button>
      </HStack>
    </HStack>

    <VStack v-if="showingAppearances" class="appearanceSidebar">
      <HStack class="autoSpace">
        <h2>Themes</h2>
        <button @click="showingAppearances = false">
          <Icon icon="mingcute:close-fill" />
        </button>
      </HStack>

      <VStack class="themeList">
        <HStack
          v-for="theme in BygThemes"
          class="bygTheme"
          @click="previewAndSetTheme(theme)"
        >
          <div
            class="previewCircle"
            :style="{ background: theme.colorPreview }"
            :class="{ selected: currentThemeKey === theme.key }"
          />

          <VStack class="themeInfo">
            <h4>{{ theme.title }}</h4>
            <p class="light">{{ theme.description }}</p>
          </VStack>
        </HStack>
      </VStack>
    </VStack>

    <!-- Logged out -->
    <VStack v-if="!isLoggedIn" class="guest">
      <h2>Welcome to Byg!</h2>
      <p>You are not logged in.</p>

      <HStack class="accountActions">
        <button @click="goLogin">
          <Icon icon="solar:login-2-line-duotone" />
          Log in
        </button>
        <button @click="goSignup">
          <Icon icon="solar:user-plus-line-duotone" />
          Sign up
        </button>
      </HStack>
    </VStack>

    <!-- Logged in -->
    <VStack class="fullWidth" v-else>
      <ProfileView
        v-if="profile"
        :user="profile.user"
        :is-own-profile="true"
        :apply-theme-to-document="!isPreviewingBaseTheme"
        :follower-count="profile.followerCount"
        :following-count="profile.followingCount"
        @edit-profile="goSettings"
      />
    </VStack>

    <VStack v-if="hasAccounts" class="accountSwitcherSection fullWidth">
      <HStack class="autoSpace">
        <h3>Accounts</h3>
      </HStack>
      <AccountSwitcher variant="profile" />
    </VStack>

    <h4>Byg Client: {{ AppVersion }}</h4>
  </ContentArea>
</template>

<style scoped lang="sass">
  @use "@/styles/utils"
  @use "@/styles/themes"

  .quickSettings
    margin-bottom: 0.5rem

  .guest, .quickSettings, .bygTheme
    @include utils.maxPostPaddedWidth
    @include utils.itemBackground

  .appearanceSidebar
    --padding: 0.75rem
    --margin: 1rem

    position: fixed
    top: env(safe-area-inset-top)
    bottom: 0
    right: 0
    height: calc(100vh - var(--padding)*2 - var(--margin)*2 - var(--tabBarHeight) - env(safe-area-inset-top) - env(safe-area-inset-bottom))
    backdrop-filter: blur(0.5rem)
    width: fit-content
    max-width: 90vw
    padding: var(--padding)
    margin: var(--margin)

    background: themes.$foregroundColor
    border-radius: 1.5rem
    z-index: 200
    animation: sidebarSlide 0.4s ease forwards

  @keyframes sidebarSlide
    0%
      transform: translateX(100%)
    100%
      transform: none

  .themeList
    flex: 1
    min-height: 0
    overflow-y: auto
    flex-wrap: nowrap

    .bygTheme
      gap: 1rem
      cursor: pointer

      .previewCircle
        width: 2rem
        height: 2rem
        border-radius: 50%
        mask: linear-gradient(to bottom right, black, rgba(0,0,0,0.8), black)

        &:not(.selected)
          margin: 0.25rem

        &.selected
          border: 0.25rem solid themes.$accentColor

      .themeInfo
        gap: 0

  .accountSwitcherSection
    @include utils.maxPostPaddedWidth
    @include utils.itemBackground
</style>

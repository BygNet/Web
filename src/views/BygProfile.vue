<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import { computed, type Ref, ref } from 'vue'
  import { useRouter } from 'vue-router'

  import { logout } from '@/auth/logout'
  import { auth } from '@/auth/session'
  import ContentArea from '@/components/layout/ContentArea.vue'
  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import { BygThemes, currentThemeKey, setTheme } from '@/data/themes.ts'
  import { title } from '@/data/title.ts'
  import setHeadMeta from '@/utils/setHeadMeta.ts'

  title.value = 'Profile'
  setHeadMeta({ page: 'Profile', subtitle: 'Your Byg profile.' })
  const router = useRouter()
  const isLoggedIn = computed(() => !!auth.user)
  const showingAppearances: Ref<boolean> = ref(false)
  const AppVersion = __AppVersion

  async function doLogout() {
    await logout()
    await router.push({ name: 'social' })
  }

  function goLogin() {
    router.push({ name: 'login' })
  }

  function goSignup() {
    router.push({ name: 'signup' })
  }
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
          @click="setTheme(theme)"
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
    <VStack v-else class="user">
      <h2>Hey!</h2>
      <p><strong>User #:</strong> {{ auth.user!.id }}</p>
      <p><strong>Email:</strong> {{ auth.user!.email }}</p>
      <p><strong>Username:</strong> {{ auth.user!.username }}</p>

      <button class="logout" @click="doLogout">
        <Icon icon="solar:logout-2-line-duotone" />
        Log out
      </button>
    </VStack>

    <h4>Byg Client: {{ AppVersion }}</h4>
  </ContentArea>
</template>

<style scoped lang="sass">
  @use "@/styles/utils"
  @use "@/styles/themes"

  .quickSettings
    margin-bottom: 0.5rem

  .guest, .user, .quickSettings, .bygTheme
    @include utils.maxPostPaddedWidth
    @include utils.itemBackground

  .logout
    margin-top: 1rem

  .appearanceSidebar
    --padding: 0.75rem
    --margin: 1rem

    position: fixed
    top: 0
    bottom: 0
    right: 0
    height: calc(100vh - var(--padding)*2 - var(--margin)*2 - var(--tabBarHeight))
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
</style>

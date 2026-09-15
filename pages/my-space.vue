<script setup lang="ts">
  import type { BygProfile } from '@bygnet/types'
  import { computed, onMounted, type Ref, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'

  import { auth } from '@/auth/session'
  import ContentArea from '@/components/layout/ContentArea.vue'
  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import AccountSwitcher from '@/components/nav/AccountSwitcher.vue'
  import ProfileView from '@/components/profile/ProfileView.vue'
  import { fetchCurrentUserProfile } from '@/data/profiles'
  import { title } from '@/data/title'
  import setHeadMeta from '@/utils/setHeadMeta'
  import { navigateTo } from '#app'
  import ThemePicker from '~/components/settings/ThemePicker.vue'

  const localePath = useLocalePath()
  const { t } = useI18n()

  title.value = t('nav.profile')
  setHeadMeta({
    page: t('nav.profile'),
    subtitle: t('ui.profilePage.subtitle'),
  })
  const isLoggedIn = computed(() => !!auth.user)
  const hasAccounts = computed(() => auth.accounts.length > 0)
  const showingAppearances: Ref<boolean> = ref(false)
  const profile: Ref<BygProfile | null> = ref(null)
  const isPreviewingBaseTheme: Ref<boolean> = ref(false)
  const AppVersion = __AppVersion

  async function loadProfile(options: { force?: boolean } = {}): Promise<void> {
    profile.value = await fetchCurrentUserProfile(options)
  }

  function goLogin() {
    navigateTo(localePath('login'))
  }

  function goSignup() {
    navigateTo(localePath('signup'))
  }

  function goSettings() {
    navigateTo(localePath('/settings'))
  }

  onMounted(() => {
    if (isLoggedIn.value) {
      loadProfile()
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
      <h3>{{ t('ui.profilePage.options') }}</h3>

      <HStack>
        <button disabled>
          <Icon name="solar:stars-line-duotone" />
          {{ t('ui.profilePage.pro') }}
        </button>

        <button @click="showingAppearances = true">
          <Icon name="solar:pallete-2-line-duotone" />
          {{ t('ui.profilePage.appearance') }}
        </button>

        <button @click="goSettings">
          <Icon name="solar:settings-minimalistic-line-duotone" />
          {{ t('ui.profilePage.settings') }}
        </button>
      </HStack>
    </HStack>

    <ThemePicker
      v-if="showingAppearances"
      :profile="profile"
      @previewing="isPreviewingBaseTheme = true"
      @done-previewing="isPreviewingBaseTheme = false"
    >
      <button @click="showingAppearances = false">
        <Icon name="mingcute:close-fill" />
      </button>
    </ThemePicker>

    <!-- Logged out -->
    <VStack v-if="!isLoggedIn" class="guest">
      <h2>{{ t('ui.profilePage.guestTitle') }}</h2>
      <p>{{ t('ui.profilePage.guestMessage') }}</p>

      <HStack class="accountActions">
        <button @click="goLogin">
          <Icon name="solar:login-2-line-duotone" />
          {{ t('common.login') }}
        </button>
        <button @click="goSignup">
          <Icon name="solar:user-plus-line-duotone" />
          {{ t('common.signup') }}
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

  .accountSwitcherSection
    @include utils.maxPostPaddedWidth
    @include utils.itemBackground
</style>

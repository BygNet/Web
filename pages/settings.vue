<script setup lang="ts">
  import type { BygAuthUser, BygProfile } from '@bygnet/types'
  import { Icon } from '@iconify/vue'
  import {
    computed,
    onMounted,
    onUnmounted,
    type Ref,
    ref,
    watchEffect,
  } from 'vue'

  definePageMeta({
    middleware: 'auth',
  })

  import { useI18n } from 'vue-i18n'

  import { api } from '@/api/client'
  import { auth, updateActiveUser } from '@/auth/session'
  import ContentArea from '@/components/layout/ContentArea.vue'
  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import ProfileView from '@/components/profile/ProfileView.vue'
  import { PageMetaByPath } from '@/data/pages'
  import { fetchCurrentUserProfile } from '@/data/profiles'
  import { taskList } from '@/data/tasks'
  import {
    currentThemeKey,
    isThemeDark,
    systemPrefersDark,
  } from '@/data/themes'
  import { showBackButton, title } from '@/data/title'
  import { capitalize } from '@/utils/formatters'
  import { buildProfileThemeVars } from '@/utils/profileTheme'
  import { setHeadMetaKeys } from '@/utils/setHeadMeta'
  import SafeLink from "~/components/base/SafeLink.vue";

  type SettingSection = 'profile' | 'subscription' | 'security' | 'interface' | 'advanced'

  interface TwoFactorSetup {
    secret: string
    manualEntryKey: string
    otpauthUrl: string
  }

  const { locale, locales, setLocale, t } = useI18n()
  const pageMeta = PageMetaByPath['/settings']!

  watchEffect(() => {
    title.value = t(pageMeta.titleKey)
  })
  setHeadMetaKeys({
    pageKey: pageMeta.titleKey,
    subtitleKey: pageMeta.descriptionKey,
  })

  const activeSection: Ref<SettingSection> = ref('profile')
  const profile: Ref<BygProfile | null> = ref(null)
  const isLoading: Ref<boolean> = ref(true)
  const isSaving: Ref<boolean> = ref(false)
  const saveMessage: Ref<string | null> = ref(null)

  const securityMessage = ref<string | null>(null)
  const securityError = ref<string | null>(null)
  const emailCode = ref('')
  const isResendingEmail = ref(false)
  const isVerifyingEmail = ref(false)
  const isLoadingTwoFactorSetup = ref(false)
  const isSavingTwoFactor = ref(false)
  const twoFactorCode = ref('')
  const twoFactorSetup = ref<TwoFactorSetup | null>(null)

  const bio: Ref<string> = ref('')
  const avatarUrl: Ref<string> = ref('')
  const bannerUrl: Ref<string> = ref('')
  const color: Ref<string> = ref('')

  const goToUrl: Ref<string> = ref('')

  const canEditProfileColor = computed(() => {
    const subscriptionState = profile.value?.user.subscriptionState
    return subscriptionState != null && subscriptionState !== 'free'
  })

  const isEmailVerified = computed(() => !auth.user?.emailVerificationCode)

  const previewThemeStyle = computed(() => {
    currentThemeKey.value
    systemPrefersDark.value
    return buildProfileThemeVars(color.value || null, isThemeDark())
  })

  const colorPickerValue = computed({
    get() {
      return color.value || '#e875b6'
    },
    set(value: string) {
      color.value = value
    },
  })

  const previewUser = computed(() => {
    const currentProfile = profile.value
    if (!currentProfile) return null

    return {
      ...currentProfile.user,
      bio: bio.value || null,
      avatarUrl: avatarUrl.value || null,
      bannerUrl: bannerUrl.value || null,
      color: color.value || null,
    }
  })

  function applyAuthUser(user: BygAuthUser): void {
    updateActiveUser(user)
  }

  function clearSecurityFeedback(): void {
    securityMessage.value = null
    securityError.value = null
  }

  async function loadProfile(options: { force?: boolean } = {}): Promise<void> {
    isLoading.value = true
    try {
      profile.value = await fetchCurrentUserProfile(options)
      if (!profile.value) return

      bio.value = profile.value.user.bio || ''
      avatarUrl.value = profile.value.user.avatarUrl || ''
      bannerUrl.value = profile.value.user.bannerUrl || ''
      color.value = profile.value.user.color || ''
    } finally {
      isLoading.value = false
    }
  }

  async function saveProfile() {
    taskList.value.push('saving')
    isSaving.value = true
    saveMessage.value = null
    try {
      const res = await api('/update-profile', {
        method: 'POST',
        body: JSON.stringify({
          bio: bio.value || null,
          avatarUrl: avatarUrl.value || null,
          bannerUrl: bannerUrl.value || null,
          ...(canEditProfileColor.value ? { color: color.value || null } : {}),
        }),
      })

      if (res.ok) {
        saveMessage.value = t('ui.settings.saveSuccess')
        setTimeout(() => {
          saveMessage.value = null
        }, 3000)
        await loadProfile({ force: true })
      } else if (res.status === 403) {
        saveMessage.value = t('ui.settings.savePremiumLocked')
      } else {
        saveMessage.value = t('ui.settings.saveFailed')
      }
    } finally {
      taskList.value.remove('saving')
      isSaving.value = false
    }
  }

  async function resendVerificationEmail(): Promise<void> {
    clearSecurityFeedback()
    isResendingEmail.value = true

    try {
      const res = await api('/auth/resend-email-verification', {
        method: 'POST',
      })

      if (!res.ok) {
        securityError.value = t('ui.settings.securityErrorEmailResend')
        return
      }

      securityMessage.value = t('ui.settings.securityMessageEmailSent')
    } finally {
      isResendingEmail.value = false
    }
  }

  async function verifyEmail(): Promise<void> {
    clearSecurityFeedback()
    isVerifyingEmail.value = true

    try {
      const res = await api('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({
          code: emailCode.value,
        }),
      })

      if (!res.ok) {
        securityError.value = t('ui.settings.securityErrorInvalidCode')
        return
      }

      if (auth.user) {
        applyAuthUser({
          ...auth.user,
          emailVerificationCode: null,
        })
      }

      emailCode.value = ''
      securityMessage.value = t('ui.settings.securityMessageEmailVerified')
    } finally {
      isVerifyingEmail.value = false
    }
  }

  async function loadTwoFactorSetup(): Promise<void> {
    clearSecurityFeedback()
    isLoadingTwoFactorSetup.value = true

    try {
      const res = await api('/auth/2fa/setup')

      if (!res.ok) {
        securityError.value = t('ui.settings.securityErrorSetup2fa')
        return
      }

      twoFactorSetup.value = await res.json()
      twoFactorCode.value = ''
    } finally {
      isLoadingTwoFactorSetup.value = false
    }
  }

  async function enableTwoFactor(): Promise<void> {
    if (!twoFactorSetup.value) return

    clearSecurityFeedback()
    isSavingTwoFactor.value = true

    try {
      const res = await api('/auth/2fa/enable', {
        method: 'POST',
        body: JSON.stringify({
          secret: twoFactorSetup.value.secret,
          code: twoFactorCode.value,
        }),
      })

      if (!res.ok) {
        securityError.value = t('ui.settings.securityErrorEnable2fa')
        return
      }

      applyAuthUser(await res.json())
      twoFactorSetup.value = null
      twoFactorCode.value = ''
      securityMessage.value = t('ui.settings.securityMessage2faEnabled')
    } finally {
      isSavingTwoFactor.value = false
    }
  }

  async function disableTwoFactor(): Promise<void> {
    clearSecurityFeedback()
    isSavingTwoFactor.value = true

    try {
      const res = await api('/auth/2fa/disable', {
        method: 'POST',
      })

      if (!res.ok) {
        securityError.value = t('ui.settings.securityErrorDisable2fa')
        return
      }

      applyAuthUser(await res.json())
      twoFactorSetup.value = null
      twoFactorCode.value = ''
      securityMessage.value = t('ui.settings.securityMessage2faDisabled')
    } finally {
      isSavingTwoFactor.value = false
    }
  }

  onMounted(() => {
    loadProfile()
    showBackButton.value = true
  })

  onUnmounted(() => {
    showBackButton.value = false
  })
</script>

<template>
  <ContentArea class="settingsPage">
    <HStack class="mainContainer">
      <VStack class="sidebar">
        <button
          @click="activeSection = 'profile'"
          :class="{ prominent: activeSection === 'profile' }"
          class="menuItem"
        >
          <Icon icon="solar:user-circle-line-duotone" />
          {{ t('ui.settings.sidebarProfile') }}
        </button>

        <button
          @click="activeSection = 'security'"
          :class="{ prominent: activeSection === 'security' }"
          class="menuItem"
        >
          <Icon icon="solar:shield-keyhole-line-duotone" />
          {{ t('ui.settings.sidebarSecurity') }}
        </button>

        <button
          @click="activeSection = 'subscription'"
          :class="{ prominent: activeSection === 'subscription' }"
          class="menuItem"
        >
          <Icon icon="solar:crown-star-line-duotone" />
          {{ t('ui.settings.sidebarSubscription') }}
        </button>

        <button
          @click="activeSection = 'interface'"
          :class="{ prominent: activeSection === 'interface' }"
          class="menuItem"
        >
          <Icon icon="solar:settings-line-duotone" />
          {{ t('ui.settings.sidebarInterface') }}
        </button>

        <button
          @click="activeSection = 'advanced'"
          :class="{ prominent: activeSection === 'advanced' }"
          class="menuItem"
        >
          <Icon icon="solar:settings-line-duotone" />
          {{ t('ui.settings.sidebarInterface') }}
        </button>
      </VStack>

      <VStack class="content">
        <VStack v-show="activeSection === 'profile'" class="section">
          <h2>{{ t('ui.settings.editProfile') }}</h2>

          <div v-if="isLoading" class="loading">
            {{ t('ui.settings.loading') }}
          </div>

          <VStack v-else class="formContainer">
            <VStack class="formGroup">
              <label>{{ t('ui.settings.bioLabel') }}</label>
              <textarea
                v-model="bio"
                :placeholder="t('ui.settings.bioPlaceholder')"
                rows="3"
              />
            </VStack>

            <VStack class="formGroup">
              <label>{{ t('ui.settings.avatarUrlLabel') }}</label>
              <input
                v-model="avatarUrl"
                type="url"
                :placeholder="t('ui.settings.avatarUrlPlaceholder')"
              />
              <div v-if="avatarUrl" class="preview">
                <img :src="avatarUrl" :alt="auth.user?.username" />
              </div>
            </VStack>

            <VStack class="formGroup">
              <label>{{ t('ui.settings.bannerUrlLabel') }}</label>
              <input
                v-model="bannerUrl"
                type="url"
                :placeholder="t('ui.settings.bannerUrlPlaceholder')"
              />
              <div v-if="bannerUrl" class="preview">
                <img :src="bannerUrl" :alt="auth.user?.username" />
              </div>
            </VStack>

            <VStack v-if="canEditProfileColor" class="formGroup">
              <label>{{ t('ui.settings.profileAccentLabel') }}</label>
              <HStack class="colorRow">
                <input
                  v-model="colorPickerValue"
                  type="color"
                  class="colorInput"
                />
                <input
                  v-model="color"
                  type="text"
                  placeholder="#e875b6"
                  maxlength="7"
                />
                <button @click="color = ''" type="button">
                  {{ t('ui.settings.reset') }}
                </button>
              </HStack>
              <p class="light">
                {{ t('ui.settings.profileAccentHelp') }}
              </p>
            </VStack>

            <VStack v-else class="formGroup">
              <label>{{ t('ui.settings.profileAccentLabel') }}</label>
              <p class="light">
                {{ t('ui.settings.profileAccentLocked') }}
              </p>
            </VStack>

            <VStack v-if="previewUser" class="formGroup previewGroup">
              <label>{{ t('ui.settings.preview') }}</label>
              <div
                class="profileThemePreview"
                :class="{ themedProfile: !!color }"
                :style="previewThemeStyle ?? undefined"
              >
                <ProfileView
                  :user="previewUser"
                  :follower-count="profile?.followerCount"
                  :following-count="profile?.followingCount"
                  :is-own-profile="true"
                  :apply-theme-to-document="false"
                  :show-actions="false"
                />
              </div>
            </VStack>

            <div v-if="saveMessage" :class="['message', { success: true }]">
              {{ saveMessage }}
            </div>

            <button
              @click="saveProfile"
              :disabled="isSaving"
              class="saveButton"
            >
              <Icon icon="solar:diskette-line-duotone" />
              {{
                isSaving
                  ? t('ui.settings.saving')
                  : t('ui.settings.saveChanges')
              }}
            </button>
          </VStack>
        </VStack>

        <VStack v-show="activeSection === 'security'" class="section">
          <h2>{{ t('ui.settings.securityTitle') }}</h2>

          <VStack class="securityCard">
            <HStack class="securityHeader">
              <Icon icon="solar:letter-line-duotone" />
              <VStack class="noSpace">
                <h3>{{ t('ui.settings.emailVerification') }}</h3>
                <p class="light">
                  {{
                    isEmailVerified
                      ? t('ui.settings.emailVerified')
                      : t('ui.settings.emailPending')
                  }}
                </p>
              </VStack>
            </HStack>

            <template v-if="!isEmailVerified">
              <label>
                {{ t('ui.settings.verificationCode') }}
                <input
                  v-model="emailCode"
                  type="text"
                  inputmode="numeric"
                  autocomplete="one-time-code"
                  maxlength="6"
                  :placeholder="t('ui.settings.verificationPlaceholder')"
                />
              </label>

              <HStack class="actionRow">
                <button
                  class="prominent"
                  @click="verifyEmail"
                  :disabled="isVerifyingEmail"
                >
                  {{
                    isVerifyingEmail
                      ? t('ui.settings.verifying')
                      : t('ui.settings.verifyEmail')
                  }}
                </button>

                <button
                  @click="resendVerificationEmail"
                  :disabled="isResendingEmail"
                >
                  {{
                    isResendingEmail
                      ? t('ui.settings.sending')
                      : t('ui.settings.resendCode')
                  }}
                </button>
              </HStack>
            </template>
          </VStack>

          <VStack class="securityCard">
            <HStack class="securityHeader">
              <Icon icon="solar:shield-keyhole-line-duotone" />
              <VStack class="noSpace">
                <h3>{{ t('ui.settings.authenticatorApp') }}</h3>
                <p class="light">
                  {{
                    auth.user?.twoFactorEnabled
                      ? t('ui.settings.authenticatorEnabled')
                      : t('ui.settings.authenticatorDisabled')
                  }}
                </p>
              </VStack>
            </HStack>

            <p class="description">
              {{ t('ui.settings.authenticatorDescription') }}
            </p>

            <template v-if="auth.user?.twoFactorEnabled">
              <button @click="disableTwoFactor" :disabled="isSavingTwoFactor">
                {{
                  isSavingTwoFactor
                    ? t('ui.settings.disabling')
                    : t('ui.settings.disable2fa')
                }}
              </button>
            </template>

            <template v-else>
              <button
                @click="loadTwoFactorSetup"
                :disabled="isLoadingTwoFactorSetup"
              >
                <Icon icon="solar:key-minimalistic-line-duotone" />
                {{
                  isLoadingTwoFactorSetup
                    ? t('ui.settings.generatingKey')
                    : twoFactorSetup
                      ? t('ui.settings.regenerateSetupKey')
                      : t('ui.settings.generateSetupKey')
                }}
              </button>

              <VStack v-if="twoFactorSetup" class="setupBox">
                <label>
                  {{ t('ui.settings.manualEntryKey') }}
                  <input :value="twoFactorSetup.manualEntryKey" readonly />
                </label>

                <label>
                  {{ t('ui.settings.authenticatorCode') }}
                  <input
                    v-model="twoFactorCode"
                    type="text"
                    inputmode="numeric"
                    autocomplete="one-time-code"
                    maxlength="6"
                    :placeholder="t('ui.settings.verificationPlaceholder')"
                  />
                </label>

                <a :href="twoFactorSetup.otpauthUrl" class="prominentLink">
                  {{ t('ui.settings.openAuthenticatorApp') }}
                </a>

                <button
                  class="prominent"
                  @click="enableTwoFactor"
                  :disabled="isSavingTwoFactor"
                >
                  <Icon icon="solar:lock-keyhole-line-duotone" />
                  {{
                    isSavingTwoFactor
                      ? t('ui.settings.enabling2fa')
                      : t('ui.settings.enable2fa')
                  }}
                </button>
              </VStack>
            </template>
          </VStack>

          <p v-if="securityMessage" class="message success">
            {{ securityMessage }}
          </p>
          <p v-if="securityError" class="message">
            {{ securityError }}
          </p>
        </VStack>

        <VStack v-show="activeSection === 'subscription'" class="section">
          <h2>{{ t('ui.settings.subscriptionTitle') }}</h2>

          <VStack v-if="profile" class="subscriptionInfo">
            <VStack class="subscriptionCard">
              <HStack class="subscriptionHeader">
                <Icon
                  class="subscriptionIcon"
                  icon="solar:crown-star-line-duotone"
                />

                <VStack class="noSpace">
                  <h3>{{ t('ui.settings.currentPlan') }}</h3>
                  <p class="light">
                    {{
                      capitalize(profile.user.subscriptionState).replace(
                        '_legacy',
                        ''
                      )
                    }}
                  </p>
                </VStack>
              </HStack>

              <p class="description">
                {{ t('ui.settings.upgradeDescription') }}
              </p>

              <button disabled class="upgradeButton">
                <Icon icon="solar:crown-star-line-duotone" />
                {{ t('ui.settings.upgradeComingSoon') }}
              </button>
            </VStack>
          </VStack>
        </VStack>

        <VStack v-show="activeSection === 'interface'" class="section">
          <h2>{{ t('ui.settings.interfaceTitle') }}</h2>

          <VStack class="interfaceCard">
            <HStack class="interfaceHeader">
              <Icon icon="solar:global-line-duotone" />
              <VStack class="noSpace">
                <h3>{{ t('ui.settings.languageTitle') }}</h3>
                <p class="light">{{ t('ui.settings.languageDescription') }}</p>
              </VStack>
            </HStack>

            <VStack class="languageGrid">
              <button
                v-for="lang in locales"
                :key="lang.code"
                @click="setLocale(lang.code)"
                :class="{ prominent: locale === lang.code }"
                class="languageButton"
              >
                {{ lang.name }}
              </button>
            </VStack>
          </VStack>
        </VStack>

        <VStack v-show="activeSection === 'advanced'" class="section">
          <h2>{{ t('ui.settings.advancedTitle') }}</h2>
          <input name="go" v-model="goToUrl" placeholder="Go to...">
          <HStack>
            <NuxtLink :to="goToUrl">
              <button>
                Go (DIRECT)
              </button>
            </NuxtLink>

            <SafeLink :to="goToUrl">
              <button class="prominent">
                Go (LOCALE)
              </button>
            </SafeLink>
          </HStack>
        </VStack>
      </VStack>
    </HStack>
  </ContentArea>
</template>

<style scoped lang="sass">
  @use "@/styles/utils"
  @use "@/styles/themes"

  .mainContainer
    width: 100%
    gap: 0.5rem
    align-items: flex-start

  .sidebar
    gap: 0.5rem
    min-width: 14rem
    flex-grow: 1

    .menuItem
      width: 100%
      justify-content: flex-start

  .content
    @include utils.itemBackground
    min-width: 15rem
    flex-grow: 2

  .section
    width: 100%
    gap: 1.5rem

  .formContainer
    width: 100%

    .formGroup
      width: 100%
      gap: 0.5rem

      textarea, input
        --padding: 0.25rem
        @include utils.maxPaddedWidth

    .colorRow
      width: 100%
      align-items: center
      gap: 0.75rem
      flex-wrap: wrap

      .colorInput
        width: 3.5rem
        min-width: 3.5rem
        height: 3rem
        padding: 0.2rem

    .previewGroup
      gap: 0.75rem

    .profileThemePreview
      width: 100%
      padding: 1rem
      border-radius: 1.5rem
      background: themes.$backgroundColor

    .preview img
      height: 4rem
      width: 4rem
      border-radius: 0.75rem

  .securityCard, .subscriptionCard
    gap: 1rem
    border-radius: 1rem
    background: color-mix(in srgb, var(--foreground) 3%, var(--background))

  .securityCard, .subscriptionCard, .interfaceCard
    gap: 1rem
    border-radius: 1rem
    background: color-mix(in srgb, var(--foreground) 3%, var(--background))

  .securityHeader, .subscriptionHeader
    align-items: center
    gap: 1rem

    svg
      width: 2.25rem
      height: 2.25rem

    .subscriptionIcon
      width: 4rem
      height: 4rem

  .interfaceHeader
    align-items: center
    gap: 1rem

    svg
      width: 2.25rem
      height: 2.25rem

  .languageGrid
    width: 100%
    display: grid
    grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr))
    gap: 0.75rem

  .setupBox
    width: 100%
    gap: 0.75rem

  .actionRow
    gap: 0.75rem
    flex-wrap: wrap

  .message
    color: #c33

    &.success
      color: #3c3

  @media (max-width: 900px)
    .mainContainer
      flex-direction: column
</style>

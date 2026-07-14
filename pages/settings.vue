<script setup lang="ts">
  import type { BygAuthUser, BygProfile } from '@bygnet/types'
  import { document } from 'posthog-js/lib/src/utils/globals'
  import { computed, onMounted, type Ref, ref, watchEffect } from 'vue'
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
  import { isThemeDark } from '@/data/themes'
  import { title } from '@/data/title'
  import { capitalize } from '@/utils/formatters'
  import { buildProfileThemeVars } from '@/utils/profileTheme'
  import { setHeadMetaKeys } from '@/utils/setHeadMeta'
  import SafeLink from '~/components/base/SafeLink.vue'
  import SettingsColorInput from '~/components/settings/SettingsColorInput.vue'
  import SettingsImageInput from '~/components/settings/SettingsImageInput.vue'
  import SettingsInput from '~/components/settings/SettingsInput.vue'
  import SettingsStatusIndicator from '~/components/settings/SettingsStatusIndicator.vue'
  import SettingsTextArea from '~/components/settings/SettingsTextArea.vue'

  definePageMeta({
    middleware: 'auth',
    showBackButton: true,
  })

  type SettingSection =
    | 'profile'
    | 'subscription'
    | 'security'
    | 'interface'
    | 'advanced'

  interface TwoFactorSetup {
    secret: string
    manualEntryKey: string
    otpauthUrl: string
  }
  interface SettingsPage {
    key: SettingSection
    icon: string
    titleKey: string
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
  const settingsPages: SettingsPage[] = [
    {
      key: 'profile',
      icon: 'solar:user-circle-line-duotone',
      titleKey: 'ui.settings.sidebarProfile',
    },
    {
      key: 'security',
      icon: 'solar:shield-keyhole-line-duotone',
      titleKey: 'ui.settings.sidebarSecurity',
    },
    {
      key: 'subscription',
      icon: 'solar:crown-star-line-duotone',
      titleKey: 'ui.settings.sidebarSubscription',
    },
    {
      key: 'interface',
      icon: 'solar:settings-line-duotone',
      titleKey: 'ui.settings.sidebarInterface',
    },
    {
      key: 'advanced',
      icon: 'solar:code-bold-duotone',
      titleKey: 'Advanced',
    },
  ]
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
  const displayName: Ref<string> = ref('')
  const pronouns: Ref<string> = ref('')
  const songLinkUrl: Ref<string> = ref('')
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
    return buildProfileThemeVars(color.value || null, isThemeDark())
  })

  const previewUser = computed(() => {
    const currentProfile = profile.value
    if (!currentProfile) return null

    return {
      ...currentProfile.user,
      displayName: displayName.value || null,
      pronouns: pronouns.value || null,
      songLinkUrl: songLinkUrl.value || null,
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

      displayName.value = profile.value.user.displayName || ''
      pronouns.value = profile.value.user.pronouns || ''
      songLinkUrl.value = profile.value.user.songLinkUrl || ''
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
          displayName: displayName.value || null,
          pronouns: pronouns.value || null,
          songLinkUrl: songLinkUrl.value || null,
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
      } else if (res.status === 400) {
        saveMessage.value = t('ui.settings.saveInvalidSongLink')
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
  })

  function toggleRtl(): void {
    if (import.meta.client && document) {
      document.documentElement.dir =
        document.documentElement.dir === 'rtl' ? 'ltr' : 'rtl'
    }
  }
</script>

<template>
  <ContentArea class="settingsPage">
    <HStack class="settingsTabBar">
      <button
        v-for="page in settingsPages"
        :key="page.key"
        @click="activeSection = page.key"
        :class="{ prominent: activeSection === page.key }"
        class="menuItem"
      >
        <Icon :name="page.icon" />
        {{ t(page.titleKey) }}
      </button>
    </HStack>

    <VStack class="content">
      <VStack v-show="activeSection === 'profile'" class="section">
        <div v-if="isLoading" class="loading">
          {{ t('ui.settings.loading') }}
        </div>

        <VStack v-else class="formContainer">
          <SettingsGroup title="ui.settings.editProfile">
            <SettingsInput
              label="ui.settings.displayNameLabel"
              placeholder="John Doe"
              v-model="displayName"
              type="text"
            />

            <SettingsInput
              label="ui.settings.pronounsLabel"
              placeholder="he/she/etc"
              v-model="pronouns"
              type="text"
            />

            <SettingsInput
              label="ui.settings.songLinkUrlLabel"
              placeholder="https://song.link/..."
              v-model="songLinkUrl"
              type="url"
              no-border
            />

            <p class="light">
              {{ t('ui.settings.songLinkUrlHelp') }}
            </p>
          </SettingsGroup>

          <SettingsGroup>
            <SettingsTextArea label="ui.settings.bioLabel" v-model="bio" />
          </SettingsGroup>

          <SettingsGroup>
            <SettingsImageInput
              label="ui.settings.avatarUrlLabel"
              placeholder="https://some.tld/example.jpg"
              v-model="avatarUrl"
            />
            <SettingsImageInput
              label="ui.settings.bannerUrlLabel"
              placeholder="https://some.tld/example.jpg"
              v-model="bannerUrl"
              no-border
            />
          </SettingsGroup>

          <SettingsGroup v-if="canEditProfileColor" title="Pro">
            <SettingsColorInput
              label="ui.settings.profileAccentLabel"
              v-model="color"
            />

            <button @click="color = ''" type="button">
              {{ t('ui.settings.reset') }}
            </button>

            <p class="light">
              {{ t('ui.settings.profileAccentHelp') }}
            </p>
          </SettingsGroup>

          <SettingsGroup v-else title="Pro">
            <label>{{ t('ui.settings.profileAccentLabel') }}</label>
            <p class="light">
              {{ t('ui.settings.profileAccentLocked') }}
            </p>
          </SettingsGroup>

          <SettingsGroup title="ui.settings.preview" plain>
            <div
              class="profileThemePreview"
              :class="{ themedProfile: !!color }"
              :style="previewThemeStyle ?? undefined"
            >
              <ProfileView
                v-if="previewUser"
                :user="previewUser"
                :follower-count="profile?.followerCount"
                :following-count="profile?.followingCount"
                :is-own-profile="true"
                :apply-theme-to-document="false"
                :show-actions="false"
              />
            </div>
          </SettingsGroup>

          <div v-if="saveMessage" :class="['message', { success: true }]">
            {{ saveMessage }}
          </div>

          <button @click="saveProfile" :disabled="isSaving" class="saveButton">
            <Icon name="solar:diskette-line-duotone" />
            {{
              isSaving ? t('ui.settings.saving') : t('ui.settings.saveChanges')
            }}
          </button>
        </VStack>
      </VStack>

      <VStack v-show="activeSection === 'security'" class="section">
        <SettingsGroup title="ui.settings.emailVerification">
          <SettingsStatusIndicator
            :status="
              isEmailVerified
                ? t('ui.settings.emailVerified')
                : t('ui.settings.emailPending')
            "
            :text="
              isEmailVerified
                ? t('ui.settings.emailVerified')
                : t('ui.settings.emailPending')
            "
            :enabled="isEmailVerified"
            icon="solar:letter-line-duotone"
            :no-border="isEmailVerified"
          />

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
        </SettingsGroup>

        <SettingsGroup title="ui.settings.authenticatorApp">
          <SettingsStatusIndicator
            :status="
              auth.user?.twoFactorEnabled
                ? t('ui.settings.authenticatorEnabled')
                : t('ui.settings.authenticatorDisabled')
            "
            :enabled="auth.user?.twoFactorEnabled ?? false"
            icon="solar:shield-keyhole-line-duotone"
          />

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
              <Icon name="solar:key-minimalistic-line-duotone" />
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
                <Icon name="solar:lock-keyhole-line-duotone" />
                {{
                  isSavingTwoFactor
                    ? t('ui.settings.enabling2fa')
                    : t('ui.settings.enable2fa')
                }}
              </button>
            </VStack>
          </template>
        </SettingsGroup>

        <p v-if="securityMessage" class="message success">
          {{ securityMessage }}
        </p>
        <p v-if="securityError" class="message">
          {{ securityError }}
        </p>
      </VStack>

      <VStack v-show="activeSection === 'subscription'" class="section">
        <SettingsGroup title="ui.settings.subscriptionTitle">
          <SettingsStatusIndicator
            icon="solar:crown-star-line-duotone"
            :status="capitalize(profile?.user.subscriptionState || 'free')"
            :enabled="
              !!profile?.user.subscriptionState &&
              profile?.user.subscriptionState !== 'free'
            "
          />
          <p class="description">
            {{ t('ui.settings.upgradeDescription') }}
          </p>

          <button disabled class="upgradeButton">
            <Icon name="solar:crown-star-line-duotone" />
            {{ t('ui.settings.upgradeComingSoon') }}
          </button>
        </SettingsGroup>
      </VStack>

      <VStack v-show="activeSection === 'interface'" class="section">
        <SettingsGroup title="ui.settings.languageTitle">
          <p class="light">{{ t('ui.settings.languageDescription') }}</p>
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
        </SettingsGroup>
      </VStack>

      <VStack v-show="activeSection === 'advanced'" class="section">
        <SettingsGroup title="Advanced Settings">
          <SettingsInput
            label="Navigate"
            placeholder="Go to..."
            v-model="goToUrl"
          />

          <HStack>
            <NuxtLink :to="goToUrl">
              <button>Go (DIRECT)</button>
            </NuxtLink>

            <SafeLink :to="goToUrl">
              <button class="prominent">Go (LOCALE)</button>
            </SafeLink>
          </HStack>
        </SettingsGroup>

        <SettingsGroup title="Design">
          <h1>H1</h1>
          <h2>H2</h2>
          <h3>H3</h3>
          <h4>H4</h4>
          <h5>H5</h5>
          <h6>H6</h6>
          <p>P</p>
        </SettingsGroup>

        <SettingsGroup title="i18n">
          <button @click="toggleRtl()">Toggle RTL</button>
        </SettingsGroup>
      </VStack>
    </VStack>
  </ContentArea>
</template>

<style scoped lang="sass">
  @use "@/styles/utils"
  @use "@/styles/themes"

  .settingsTabBar
    width: 100%
    flex-wrap: nowrap
    overflow: scroll
    padding: 0.5rem 0.5rem 1.5rem

    button
      text-wrap: nowrap

  .content
    min-width: 15rem
    flex-grow: 2
    width: 100%

  .section, .formContainer, .profileThemePreview
    width: 100%

  .languageGrid
    width: 100%
    display: grid
    grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr))
    gap: 0.5rem

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
</style>

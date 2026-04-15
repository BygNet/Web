<script setup lang="ts">
  import type { BygAuthUser, BygProfile } from '@bygnet/types'
  import { Icon } from '@iconify/vue'
  import { computed, onMounted, onUnmounted, type Ref, ref } from 'vue'

  definePageMeta({
    middleware: 'auth',
  })

  import { api } from '@/api/client'
  import { auth, updateActiveUser } from '@/auth/session'
  import ContentArea from '@/components/layout/ContentArea.vue'
  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import ProfileView from '@/components/profile/ProfileView.vue'
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
  import setHeadMeta from '@/utils/setHeadMeta'

  type SettingSection = 'profile' | 'subscription' | 'security'

  interface TwoFactorSetup {
    secret: string
    manualEntryKey: string
    otpauthUrl: string
  }

  title.value = 'Settings'
  setHeadMeta({ page: 'Settings', subtitle: 'Manage your account settings.' })

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
        saveMessage.value = 'Profile saved successfully!'
        setTimeout(() => {
          saveMessage.value = null
        }, 3000)
        await loadProfile({ force: true })
      } else if (res.status === 403) {
        saveMessage.value = 'Profile colors are only available for paid plans'
      } else {
        saveMessage.value = 'Failed to save profile'
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
        securityError.value = 'Could not resend the verification email'
        return
      }

      securityMessage.value = 'Verification email sent.'
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
        securityError.value = 'That email verification code is not valid'
        return
      }

      if (auth.user) {
        applyAuthUser({
          ...auth.user,
          emailVerificationCode: null,
        })
      }

      emailCode.value = ''
      securityMessage.value = 'Your email is verified.'
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
        securityError.value = 'Could not create a 2FA setup key'
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
        securityError.value = 'That authenticator code was not accepted'
        return
      }

      applyAuthUser(await res.json())
      twoFactorSetup.value = null
      twoFactorCode.value = ''
      securityMessage.value = 'Authenticator app 2FA is enabled.'
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
        securityError.value = 'Could not disable authenticator app 2FA'
        return
      }

      applyAuthUser(await res.json())
      twoFactorSetup.value = null
      twoFactorCode.value = ''
      securityMessage.value = 'Authenticator app 2FA is disabled.'
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
          Profile
        </button>

        <button
          @click="activeSection = 'security'"
          :class="{ prominent: activeSection === 'security' }"
          class="menuItem"
        >
          <Icon icon="solar:shield-keyhole-line-duotone" />
          Security
        </button>

        <button
          @click="activeSection = 'subscription'"
          :class="{ prominent: activeSection === 'subscription' }"
          class="menuItem"
        >
          <Icon icon="solar:crown-star-line-duotone" />
          Subscription
        </button>
      </VStack>

      <VStack class="content">
        <VStack v-show="activeSection === 'profile'" class="section">
          <h2>Edit Profile</h2>

          <div v-if="isLoading" class="loading">Loading...</div>

          <VStack v-else class="formContainer">
            <VStack class="formGroup">
              <label>Bio</label>
              <textarea
                v-model="bio"
                placeholder="Tell us about yourself..."
                rows="3"
              />
            </VStack>

            <VStack class="formGroup">
              <label>Avatar URL</label>
              <input
                v-model="avatarUrl"
                type="url"
                placeholder="https://example.com/avatar.jpg"
              />
              <div v-if="avatarUrl" class="preview">
                <img :src="avatarUrl" :alt="auth.user?.username" />
              </div>
            </VStack>

            <VStack class="formGroup">
              <label>Banner URL</label>
              <input
                v-model="bannerUrl"
                type="url"
                placeholder="https://example.com/banner.jpg"
              />
              <div v-if="bannerUrl" class="preview">
                <img :src="bannerUrl" :alt="auth.user?.username" />
              </div>
            </VStack>

            <VStack v-if="canEditProfileColor" class="formGroup">
              <label>Profile Accent</label>
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
                <button @click="color = ''" type="button">Reset</button>
              </HStack>
              <p class="light">
                This accent recolors your profile page for visitors.
              </p>
            </VStack>

            <VStack v-else class="formGroup">
              <label>Profile Accent</label>
              <p class="light">
                Upgrade your subscription to unlock a custom profile color.
              </p>
            </VStack>

            <VStack v-if="previewUser" class="formGroup previewGroup">
              <label>Preview</label>
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
              {{ isSaving ? 'Saving...' : 'Save Changes' }}
            </button>
          </VStack>
        </VStack>

        <VStack v-show="activeSection === 'security'" class="section">
          <h2>Security</h2>

          <VStack class="securityCard">
            <HStack class="securityHeader">
              <Icon icon="solar:letter-line-duotone" />
              <VStack class="noSpace">
                <h3>Email Verification</h3>
                <p class="light">
                  {{ isEmailVerified ? 'Verified' : 'Verification pending' }}
                </p>
              </VStack>
            </HStack>

            <template v-if="!isEmailVerified">
              <label>
                Verification Code
                <input
                  v-model="emailCode"
                  type="text"
                  inputmode="numeric"
                  autocomplete="one-time-code"
                  maxlength="6"
                  placeholder="123456"
                />
              </label>

              <HStack class="actionRow">
                <button
                  class="prominent"
                  @click="verifyEmail"
                  :disabled="isVerifyingEmail"
                >
                  {{ isVerifyingEmail ? 'Verifying...' : 'Verify Email' }}
                </button>

                <button
                  @click="resendVerificationEmail"
                  :disabled="isResendingEmail"
                >
                  {{ isResendingEmail ? 'Sending...' : 'Resend Code' }}
                </button>
              </HStack>
            </template>
          </VStack>

          <VStack class="securityCard">
            <HStack class="securityHeader">
              <Icon icon="solar:shield-keyhole-line-duotone" />
              <VStack class="noSpace">
                <h3>Authenticator App</h3>
                <p class="light">
                  {{
                    auth.user?.twoFactorEnabled ? 'Enabled' : 'Not enabled yet'
                  }}
                </p>
              </VStack>
            </HStack>

            <p class="description">
              Protect your login with a 6-digit TOTP code from an authenticator
              app.
            </p>

            <template v-if="auth.user?.twoFactorEnabled">
              <button @click="disableTwoFactor" :disabled="isSavingTwoFactor">
                {{ isSavingTwoFactor ? 'Disabling...' : 'Disable 2FA' }}
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
                    ? 'Generating Key...'
                    : twoFactorSetup
                      ? 'Regenerate Setup Key'
                      : 'Generate Setup Key'
                }}
              </button>

              <VStack v-if="twoFactorSetup" class="setupBox">
                <label>
                  Manual Entry Key
                  <input :value="twoFactorSetup.manualEntryKey" readonly />
                </label>

                <label>
                  Authenticator Code
                  <input
                    v-model="twoFactorCode"
                    type="text"
                    inputmode="numeric"
                    autocomplete="one-time-code"
                    maxlength="6"
                    placeholder="123456"
                  />
                </label>

                <a :href="twoFactorSetup.otpauthUrl" class="prominentLink">
                  Open In Authenticator App
                </a>

                <button
                  class="prominent"
                  @click="enableTwoFactor"
                  :disabled="isSavingTwoFactor"
                >
                  <Icon icon="solar:lock-keyhole-line-duotone" />
                  {{ isSavingTwoFactor ? 'Enabling...' : 'Enable 2FA' }}
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
          <h2>Subscription</h2>

          <VStack v-if="profile" class="subscriptionInfo">
            <VStack class="subscriptionCard">
              <HStack class="subscriptionHeader">
                <Icon
                  class="subscriptionIcon"
                  icon="solar:crown-star-line-duotone"
                />

                <VStack class="noSpace">
                  <h3>Current Plan</h3>
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
                Upgrade to unlock more premium features and support the Byg
                platform.
              </p>

              <button disabled class="upgradeButton">
                <Icon icon="solar:crown-star-line-duotone" />
                Upgrade (Coming Soon)
              </button>
            </VStack>
          </VStack>
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

  .securityHeader, .subscriptionHeader
    align-items: center
    gap: 1rem

    svg
      width: 2.25rem
      height: 2.25rem

    .subscriptionIcon
      width: 4rem
      height: 4rem

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

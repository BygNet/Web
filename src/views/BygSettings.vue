<script setup lang="ts">
  import type { BygProfile } from '@bygnet/types'
  import { Icon } from '@iconify/vue'
  import { onMounted, onUnmounted, type Ref, ref } from 'vue'

  import { api } from '@/api/client'
  import { auth } from '@/auth/session'
  import ContentArea from '@/components/layout/ContentArea.vue'
  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import { showBackButton, title } from '@/data/title.ts'
  import { capitalize } from '@/utils/formatters.ts'
  import setHeadMeta from '@/utils/setHeadMeta.ts'

  type SettingSection = 'profile' | 'subscription'

  title.value = 'Settings'
  setHeadMeta({ page: 'Settings', subtitle: 'Manage your account settings.' })

  const activeSection: Ref<SettingSection> = ref('profile')
  const profile: Ref<BygProfile | null> = ref(null)
  const isLoading: Ref<boolean> = ref(true)
  const isSaving: Ref<boolean> = ref(false)
  const saveMessage: Ref<string | null> = ref(null)

  // Form fields
  const bio: Ref<string> = ref('')
  const avatarUrl: Ref<string> = ref('')
  const bannerUrl: Ref<string> = ref('')

  async function loadProfile() {
    isLoading.value = true
    try {
      const res = await api('/profile-me')
      if (res.ok) {
        profile.value = (await res.json()) as BygProfile

        bio.value = profile.value.user.bio || ''
        avatarUrl.value = profile.value.user.avatarUrl || ''
        bannerUrl.value = profile.value.user.bannerUrl || ''
      }
    } finally {
      isLoading.value = false
    }
  }

  async function saveProfile() {
    isSaving.value = true
    saveMessage.value = null
    try {
      const res = await api('/update-profile', {
        method: 'POST',
        body: JSON.stringify({
          bio: bio.value || null,
          avatarUrl: avatarUrl.value || null,
          bannerUrl: bannerUrl.value || null,
        }),
      })

      if (res.ok) {
        saveMessage.value = 'Profile saved successfully!'
        setTimeout(() => {
          saveMessage.value = null
        }, 3000)
        await loadProfile()
      } else {
        saveMessage.value = 'Failed to save profile'
      }
    } finally {
      isSaving.value = false
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
      <!-- Sidebar -->
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
          @click="activeSection = 'subscription'"
          :class="{ prominent: activeSection === 'subscription' }"
          class="menuItem"
        >
          <Icon icon="solar:crown-star-line-duotone" />
          Subscription
        </button>
      </VStack>

      <!-- Content -->
      <VStack class="content">
        <!-- Profile Section -->
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

        <!-- Subscription Section -->
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

      textarea, input
        --padding: 0.25rem
        @include utils.maxPaddedWidth

    .preview img
      height: 4rem
      width: 4rem
      border-radius: 0.75rem

  .subscriptionHeader
    .subscriptionIcon
      width: 4rem
      height: 4rem

  .message
    color: #c33

    &.success
      color: #3c3
</style>

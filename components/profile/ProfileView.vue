<script setup lang="ts">
  import type { BygUser } from '@bygnet/types'
  import { Icon } from '@iconify/vue'
  import { computed, onUnmounted, type Ref, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'

  import { api } from '@/api/client'
  import { auth } from '@/auth/session'
  import SafeLink from '@/components/base/SafeLink.vue'
  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import ReportButton from '@/components/posts/ReportButton.vue'
  import UsernameView from '@/components/posts/UsernameView.vue'
  import SongLink from '@/components/profile/SongLink.vue'
  import { currentThemeKey, systemPrefersDark } from '@/data/themes'
  import { capitalize } from '@/utils/formatters'
  import {
    applyProfileThemeToDocument,
    clearDocumentProfileTheme,
  } from '@/utils/profileTheme'
  import { navigateTo } from '#app'

  const localePath = useLocalePath()
  const { t } = useI18n()
  const props = withDefaults(
    defineProps<{
      user: BygUser
      isOwnProfile?: boolean
      isFollowing?: boolean
      followerCount?: number
      followingCount?: number
      applyThemeToDocument?: boolean
      showActions?: boolean
    }>(),
    {
      applyThemeToDocument: true,
      showActions: true,
    }
  )

  const emit = defineEmits<{
    follow: []
  }>()

  const isLoading: Ref<boolean> = ref(false)
  const isOwnProfileResolved = computed(() => {
    if (props.isOwnProfile) return true
    if (!auth.user) return false
    return auth.user.id === props.user.id
  })

  const joinDate = computed(() => {
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'long',
    }).format(new Date(props.user.createdAt))
  })

  const displayName = computed(() => props.user.displayName?.trim() ?? '')
  const pronouns = computed(() => props.user.pronouns?.trim() ?? '')

  async function handleFollow() {
    if (!auth.user) {
      await navigateTo(localePath('login'))
      return
    }
    if (isOwnProfileResolved.value) {
      console.error('Unable to follow: cannot follow your own profile')
      return
    }
    isLoading.value = true
    try {
      const res = await api(`/follow-user/${props.user.id}`, {
        method: 'POST',
      })
      if (res.ok) {
        emit('follow')
      }
    } finally {
      isLoading.value = false
    }
  }

  watch(
    () => [ props.user.color, props.applyThemeToDocument ] as const,
    ([ color, shouldApply ]) => {
      if (!shouldApply) {
        clearDocumentProfileTheme()
        return
      }

      applyProfileThemeToDocument(color)
    },
    { immediate: true }
  )

  watch(
    () => [ currentThemeKey.value, systemPrefersDark.value ] as const,
    () => {
      if (!props.applyThemeToDocument) return
      applyProfileThemeToDocument(props.user.color)
    }
  )

  onUnmounted(() => {
    if (props.applyThemeToDocument) {
      clearDocumentProfileTheme()
    }
  })
</script>

<template>
  <HStack class="profileCardContainer">
    <VStack class="profileCard">
      <!-- Banner -->
      <div
        v-if="user.bannerUrl"
        class="banner"
        :style="{ backgroundImage: `url(${user.bannerUrl})` }"
      />
      <div v-else class="bannerPlaceholder" />

      <!-- Avatar and Info -->
      <VStack class="profileContent">
        <HStack class="avatarSection">
          <img
            v-if="user.avatarUrl"
            :src="user.avatarUrl"
            :alt="`${user.username}'s avatar`"
            class="avatar"
          />
          <div v-else class="avatarPlaceholder">
            <Icon icon="solar:user-circle-line-duotone" />
          </div>

          <VStack class="userInfo noSpace">
            <p v-if="displayName" class="displayName">
              {{ displayName }}
            </p>
            <UsernameView
              :name="user.username"
              :avatar-url="user.avatarUrl"
              :subscription-state="user.subscriptionState"
              display-mode
            />
            <p v-if="pronouns" class="light pronounsLabel">
              {{ pronouns }}
            </p>
            <p class="light">
              {{ t('ui.profile.joinedLabel', { date: joinDate }) }}
            </p>
          </VStack>
        </HStack>

        <HStack
          v-if="!isOwnProfileResolved && showActions"
          class="actionButtons autoSpace"
        >
          <HStack>
            <button
              @click="handleFollow"
              :disabled="isLoading"
              :class="{ following: isFollowing }"
            >
              <Icon
                :icon="
                  isFollowing
                    ? 'solar:check-circle-line-duotone'
                    : 'solar:user-plus-line-duotone'
                "
              />
              {{
                isFollowing ? t('ui.profile.following') : t('ui.profile.follow')
              }}
            </button>

            <SafeLink :to="'/messages?with=' + user.username">
              <button>
                <Icon icon="solar:plain-line-duotone" />
                {{ t('ui.profile.chat') }}
              </button>
            </SafeLink>
          </HStack>

          <ReportButton />
        </HStack>

        <SafeLink to="/settings">
          <button v-if="isOwnProfileResolved && showActions" class="editButton">
            <Icon icon="solar:pen-2-line-duotone" />
            Edit Profile
          </button>
        </SafeLink>

        <!-- Bio & Sub -->
        <p class="light">Byg {{ capitalize(user.subscriptionState) }}</p>
        <p v-if="user.bio" class="bio">
          {{ user.bio }}
        </p>

        <SongLink v-if="user.songLinkUrl" :url="user.songLinkUrl" />

        <!-- Stats -->
        <HStack class="stats">
          <VStack class="stat">
            <strong>{{ followingCount ?? 0 }}</strong>
            <p class="light">Following</p>
          </VStack>
          <VStack class="stat">
            <strong>{{ followerCount ?? 0 }}</strong>
            <p class="light">Followers</p>
          </VStack>
        </HStack>
      </VStack>
    </VStack>
  </HStack>
</template>

<style scoped lang="sass">
  @use "@/styles/utils"
  @use "@/styles/themes"

  .profileCardContainer
    width: 100%
    justify-content: stretch

  .profileCard
    @include utils.itemBackground

    width: 100%
    gap: 0
    overflow: hidden
    margin-bottom: 1rem
    padding: 0

    .banner, .bannerPlaceholder
      width: 100%
      aspect-ratio: 3/1
      background-size: cover
      background-position: center
      mask: linear-gradient(to bottom, black, transparent)

    .bannerPlaceholder
      background: linear-gradient(135deg, themes.$accentColor 0%, rgba(0,0,0,0.1) 100%)

    .profileContent
      padding: var(--padding)
      margin-top: -2.5rem
      gap: 1rem
      width: 100%

      .avatarSection
        gap: 1rem
        align-items: flex-end

        .avatar, .avatarPlaceholder
          width: 6rem
          height: 6rem
          border-radius: 50%
          background: themes.$backgroundColor
          flex-shrink: 0

        .avatar
          object-fit: cover

        .avatarPlaceholder
          display: flex
          align-items: center
          justify-content: center

          svg
            width: 2.5rem
            height: 2.5rem
            opacity: 0.5

      .bio
        line-height: 1.5

      .displayName
        margin: 0 0 -0.75rem
        font-size: 1.2rem
        font-weight: 700
        max-width: 100%
        overflow: hidden
        text-overflow: ellipsis
        white-space: nowrap

      .pronounsLabel
        margin: 0

      .stats
        gap: 2rem
        padding-top: 1rem

      .stat
        gap: 0.25rem
</style>

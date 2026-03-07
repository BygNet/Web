<script setup lang="ts">
  import type { BygUser } from '@bygnet/types'
  import { Icon } from '@iconify/vue'
  import { computed, type Ref, ref } from 'vue'

  import { api } from '@/api/client'
  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import UsernameView from '@/components/posts/UsernameView.vue'

  const props = defineProps<{
    user: BygUser
    isOwnProfile?: boolean
    isFollowing?: boolean
    followerCount?: number
    followingCount?: number
  }>()

  const emit = defineEmits<{
    follow: []
    editProfile: []
  }>()

  const isLoading: Ref<boolean> = ref(false)

  const joinDate = computed(() => {
    return new Date(props.user.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    })
  })

  async function handleFollow() {
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
            <UsernameView
              :name="user.username"
              :avatar-url="user.avatarUrl"
              :subscription-state="user.subscriptionState"
              display-mode
            />
            <p class="light">Joined {{ joinDate }}</p>
          </VStack>

          <HStack v-if="!isOwnProfile" class="actionButtons">
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
              {{ isFollowing ? 'Following' : 'Follow' }}
            </button>
          </HStack>
        </HStack>

        <button
          v-if="isOwnProfile"
          class="editButton"
          @click="emit('editProfile')"
        >
          <Icon icon="solar:pen-2-line-duotone" />
          Edit Profile
        </button>

        <!-- Bio -->
        <p v-if="user.bio" class="bio">{{ user.bio }}</p>

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

  .banner, .bannerPlaceholder
    width: 100%
    aspect-ratio: 3/1
    background-size: cover
    background-position: center

  .bannerPlaceholder
    background: linear-gradient(135deg, themes.$accentColor 0%, rgba(0,0,0,0.1) 100%)

  .profileContent
    padding: 0 0.5rem 0.5rem
    margin-top: -1.5rem
    gap: 1rem

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

  .stats
    gap: 2rem
    padding-top: 1rem

  .stat
    gap: 0.25rem
</style>

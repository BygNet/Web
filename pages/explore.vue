<script setup lang="ts">
import type { BygAsk, BygPost, BygProfile } from '@bygnet/types'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { api } from '@/api/client'
import { auth } from '@/auth/session'
import AppsGrid from '@/components/apps/AppsGrid.vue'
import SafeLink from '@/components/base/SafeLink.vue'
import ContentArea from '@/components/layout/ContentArea.vue'
import HStack from '@/components/layout/HStack.vue'
import VStack from '@/components/layout/VStack.vue'
import { getMostVisitedApps } from '@/data/appUsage'
import { fetchCurrentUserAsks } from '@/data/asks'
import { PageMetaByPath } from '@/data/pages'
import { fetchCurrentUserProfile } from '@/data/profiles'
import { title } from '@/data/title'
import { setHeadMetaKeys } from '@/utils/setHeadMeta'
import { navigateTo } from '#app'

const { t } = useI18n()
const localePath = useLocalePath()
const pageMeta = PageMetaByPath['/explore']!

const posts = ref<BygPost[]>([])
const asks = ref<BygAsk[]>([])
const profile = ref<BygProfile | null>(null)
const loadingPosts = ref(true)
const postsError = ref(false)
const searchQuery = ref('')
const suggestedApps = ref(getMostVisitedApps())

const isLoggedIn = computed(() => !!auth.user)

watch(
  () => auth.user?.id,
  async () => {
    await loadUserWidgets()
  },
  { immediate: true }
)

watch(
  () => t(pageMeta.titleKey),
  pageTitle => {
    title.value = pageTitle
  },
  { immediate: true }
)

setHeadMetaKeys({
  pageKey: pageMeta.titleKey,
  subtitleKey: pageMeta.descriptionKey,
})

async function loadPosts(): Promise<void> {
  loadingPosts.value = true
  postsError.value = false

  try {
    const response = await api('/latest-posts')
    if (!response.ok) throw new Error('Failed to load posts')
    posts.value = ((await response.json()) as BygPost[]).slice(0, 3)
  } catch {
    postsError.value = true
  } finally {
    loadingPosts.value = false
  }
}

async function loadUserWidgets(): Promise<void> {
  if (!auth.user) {
    asks.value = []
    profile.value = null
    return
  }

  const [ profileResult, asksResult ] = await Promise.allSettled([
    fetchCurrentUserProfile(),
    fetchCurrentUserAsks(),
  ])

  profile.value =
    profileResult.status === 'fulfilled' ? profileResult.value : null
  asks.value =
    asksResult.status === 'fulfilled' ? asksResult.value.slice(0, 5) : []
}

async function submitSearch(): Promise<void> {
  const query = searchQuery.value.trim()
  if (!query) return

  await navigateTo(localePath(`/search/results?q=${encodeURIComponent(query)}`))
}

function refreshSuggestedApps(): void {
  window.setTimeout(() => {
    suggestedApps.value = getMostVisitedApps()
  }, 0)
}

function settingsPath(section: 'profile' | 'interface'): string {
  return `/settings#${section}`
}

onMounted(() => {
  void loadPosts()
  refreshSuggestedApps()
})
</script>

<template>
  <ContentArea class="bygExplore" left-align>
    <div class="exploreDashboard">
      <section class="allAppsWidget">
        <AppsGrid />
      </section>

      <section class="dashboardWidget postsWidget">
        <HStack class="widgetHeading autoSpace">
          <h2>{{ t('ui.exploreDashboard.latestPosts') }}</h2>

          <SafeLink class="prominentLink" to="/">
            {{ t('common.open') }}
          </SafeLink>
        </HStack>

        <VStack v-if="loadingPosts" class="widgetLoading">
          <p class="light">{{ t('ui.exploreDashboard.loading') }}</p>
        </VStack>

        <VStack v-else-if="postsError" class="widgetEmpty">
          <Icon name="solar:danger-triangle-line-duotone" />
          <p>{{ t('ui.exploreDashboard.latestPostsError') }}</p>
        </VStack>

        <VStack v-else-if="posts.length" class="previewList">
          <SafeLink
            v-for="post in posts"
            :key="post.id"
            class="postPreview fullWidth"
            :to="`/details/${post.id}`"
          >
            <VStack class="fullWidth">
              <h3>{{ post.title }}</h3>
              <p>{{ post.content }}</p>
            </VStack>
          </SafeLink>
        </VStack>

        <p v-else class="light widgetEmptyText">
          {{ t('ui.exploreDashboard.latestPostsEmpty') }}
        </p>
      </section>

      <section v-if="isLoggedIn" class="dashboardWidget asksWidget">
        <HStack class="widgetHeading autoSpace">
          <h2>{{ t('ui.exploreDashboard.latestAsks') }}</h2>
          <SafeLink class="prominentLink" to="/asks">
            {{ t('common.open') }}
          </SafeLink>
        </HStack>

        <VStack v-if="asks.length" class="previewList">
          <SafeLink
            v-for="ask in asks"
            :key="ask.id"
            class="askPreview"
            to="/asks"
          >
            <p>{{ ask.content }}</p>
          </SafeLink>
        </VStack>

        <p v-else class="light widgetEmptyText">
          {{ t('ui.exploreDashboard.latestAsksEmpty') }}
        </p>
      </section>

      <section class="dashboardWidget searchWidget">
        <h2>{{ t('ui.exploreDashboard.searchTitle') }}</h2>

        <form class="dashboardSearch" @submit.prevent="submitSearch">
          <HStack>
            <input
              v-model="searchQuery"
              :placeholder="t('ui.exploreDashboard.searchPlaceholder')"
              :aria-label="t('ui.exploreDashboard.searchPlaceholder')"
            />

            <button class="prominent" type="submit">
              {{ t('ui.exploreDashboard.searchButton') }}
            </button>
          </HStack>
        </form>
      </section>

      <section class="dashboardWidget profileWidget">
        <VStack class="profilePreview">
          <template v-if="profile">
            <HStack class="profilePreviewIdentity">
              <img
                v-if="profile.user.avatarUrl"
                :src="profile.user.avatarUrl"
                :alt="`${profile.user.username}'s avatar`"
              />
              <div v-else class="profileAvatarPlaceholder">
                <Icon name="solar:user-circle-line-duotone" />
              </div>

              <VStack class="noSpace">
                <strong>
                  {{ profile.user.displayName || profile.user.username }}
                </strong>

                <span class="light">@{{ profile.user.username }}</span>
              </VStack>
            </HStack>

            <p v-if="profile.user.bio" class="profileBio">
              {{ profile.user.bio }}
            </p>
          </template>

          <HStack class="fullWidth autoSpace">
            <template v-if="profile">
              <SafeLink :to="settingsPath('profile')">
                <button>
                  <Icon name="solar:pen-2-line-duotone" />
                  {{ t('ui.exploreDashboard.editProfile') }}
                </button>
              </SafeLink>
            </template>

            <SafeLink :to="settingsPath('interface')">
              <button>
                <Icon name="solar:pallete-2-line-duotone" />
                {{ t('ui.exploreDashboard.themeSettings') }}
              </button>
            </SafeLink>
          </HStack>
        </VStack>
      </section>

      <section class="appsWidget">
        <div class="suggestedApps">
          <SafeLink
            v-for="app in suggestedApps"
            :key="app.path"
            class="suggestedApp"
            :to="app.path"
            @click="refreshSuggestedApps"
          >
            <span class="suggestedAppIcon" :style="{ '--tint': app.color }">
              <Icon :name="app.icon" />
            </span>
          </SafeLink>
        </div>
      </section>
    </div>
  </ContentArea>
</template>

<style scoped lang="sass">
@use "@/styles/themes"
@use "@/styles/utils"

.exploreDashboard
  display: grid
  grid-template-columns: repeat(12, minmax(0, 1fr))
  align-items: start
  gap: 0.5rem
  width: 100%

.dashboardWidget
  @include utils.itemBackground

  display: flex
  flex-direction: column
  gap: 0.5rem
  min-width: 0
  height: 100%
  padding: 1rem

  h2, h3, p
    margin: 0

  h2
    font-size: 1.2rem

.allAppsWidget
  margin: 3rem 0

.searchWidget, .allAppsWidget
  grid-column: 1 / -1

.postsWidget, .profileWidget
  grid-column: span 7

.asksWidget, .appsWidget
  grid-column: span 5

.dashboardSearch
  display: flex
  gap: 0.5rem

  input
    min-width: 0
    flex: 1

  button
    flex: 0 0 auto

.previewList
  gap: 0

.postPreview, .askPreview
  width: 100%
  padding: 0.75rem 0
  border-bottom: 0.1rem solid themes.$foregroundColor
  color: inherit
  text-decoration: none

  &:first-child
    padding-top: 0

  &:last-child
    padding-bottom: 0
    border-bottom: 0

.postPreview
  h3
    margin-top: 0.25rem
    overflow: hidden
    text-overflow: ellipsis
    white-space: nowrap
    transition: color 0.2s ease
    max-width: 100%

  p
    display: -webkit-box
    margin-top: 0.25rem
    overflow: hidden
    -webkit-box-orient: vertical
    -webkit-line-clamp: 2
    opacity: 0.65
    line-height: 1.35


.askPreview
  justify-content: flex-start

.askPreview p
  display: -webkit-box
  margin-top: 0.35rem
  overflow: hidden
  -webkit-box-orient: vertical
  -webkit-line-clamp: 2
  line-height: 1.35

.widgetEmpty, .widgetLoading
  align-items: center
  justify-content: center
  min-height: 7rem
  width: 100%
  text-align: center

  > span.iconify
    width: 2rem
    height: 2rem
    color: themes.$accentColor

.widgetEmptyText
  padding: 1rem 0
  text-align: center

.profilePreview
  gap: 1rem

.profilePreviewIdentity
  align-items: center

  img, .profileAvatarPlaceholder
    width: 3.5rem
    height: 3.5rem
    border-radius: 1.2rem

  img
    object-fit: cover

  .profileAvatarPlaceholder
    display: grid
    place-items: center
    background: themes.$foregroundOpaque

    > span.iconify
      width: 2rem
      height: 2rem

.profileBio
  display: -webkit-box
  overflow: hidden
  -webkit-box-orient: vertical
  -webkit-line-clamp: 3
  line-height: 1.4

.appsWidget
  margin: auto
  justify-content: center
  align-items: center

.suggestedApps
  flex-direction: row

.suggestedApp
  display: flex
  align-items: center
  min-width: 0
  gap: 0.5rem
  padding: 0.5rem
  border-radius: 1rem
  transition: 0.2s ease

  &:hover
    scale: 1.1

.suggestedAppIcon
  display: grid
  flex: 0 0 auto
  place-items: center
  width: 4rem
  height: 4rem
  border-radius: 1.5rem
  background: linear-gradient(to bottom, var(--tint), hsl(from var(--tint) calc(h - 40) s l))
  box-shadow: 0 0 1rem color-mix(in srgb, var(--tint) 35%, transparent)

  > span.iconify
    width: 2.5rem
    height: 2.5rem

@media (max-width: 55rem)
  .postsWidget, .asksWidget, .profileWidget, .appsWidget
    grid-column: span 6

  .allAppsWidget
    margin: 1rem 0


@media (max-width: 38rem)
  .postsWidget, .asksWidget, .profileWidget, .appsWidget
    grid-column: 1 / -1

  .dashboardSearch
    flex-wrap: wrap

  .dashboardSearch input
    flex-basis: 100%

  .allAppsWidget
    margin: 0.75rem 0
</style>

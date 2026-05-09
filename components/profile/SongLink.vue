<script setup lang="ts">
  import type { BygSongLinkInfo } from '@bygnet/types'
  import { Icon } from '@iconify/vue'
  import { computed, onBeforeUnmount, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'

  import ContextMenu from '@/components/base/ContextMenu.vue'
  import ContextMenuItem from '@/components/base/ContextMenuItem.vue'
  import HStack from '@/components/layout/HStack.vue'
  import { fetchSongLinkInfo } from '@/data/songLink'

  interface SongLinkActionItem {
    key: string
    title: string
    icon: string
    url: string
  }

  const props = defineProps<{
    url: string
  }>()

  const { t } = useI18n()
  const isLoading = ref(false)
  const info = ref<BygSongLinkInfo | null>(null)
  const menuOpen = ref(false)
  const buttonRoot = ref<HTMLElement | null>(null)
  const youtubeFrame = ref<HTMLIFrameElement | null>(null)
  const isPlaying = ref(false)
  const youtubeUrl = computed(() => {
    const youtubeLink = (info.value?.links ?? []).find(link => {
      const platform = link.platform.trim().toLowerCase()

      return (
        platform === 'youtube' ||
        platform === 'youtubemusic' ||
        platform === 'youtube_music' ||
        platform === 'youtube-music'
      )
    })

    return youtubeLink?.url ?? null
  })

  const youtubeEmbedUrl = computed(() => {
    const url = youtubeUrl.value
    if (!url) return null

    try {
      const parsed = new URL(url)

      let videoId: string | null = null

      if (parsed.hostname.includes('youtu.be')) {
        videoId = parsed.pathname.slice(1)
      } else {
        videoId = parsed.searchParams.get('v')
      }

      if (!videoId) return null

      return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=0&controls=0&rel=0`
    } catch {
      return null
    }
  })
  const hasValidUrl = computed(() =>
    isValidSongLinkUrl(normalizeUrl(props.url))
  )

  function normalizeUrl(url: string): string {
    return url.trim()
  }

  function isValidSongLinkUrl(url: string): boolean {
    try {
      const parsed = new URL(url)
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return false
      }

      const host = parsed.hostname.toLowerCase()
      return (
        host === 'song.link' ||
        host === 'www.song.link' ||
        host === 'odesli.co' ||
        host === 'www.odesli.co'
      )
    } catch {
      return false
    }
  }

  function postYoutubeCommand(command: string): void {
    const frame = youtubeFrame.value
    if (!frame?.contentWindow) return

    frame.contentWindow.postMessage(
      JSON.stringify({
        event: 'command',
        func: command,
        args: [],
      }),
      '*'
    )
  }

  function togglePlayback(event: MouseEvent): void {
    event.stopPropagation()

    if (!youtubeEmbedUrl.value) return

    if (isPlaying.value) {
      postYoutubeCommand('pauseVideo')
      isPlaying.value = false
    } else {
      postYoutubeCommand('playVideo')
      isPlaying.value = true
    }
  }

  function platformIcon(platform: string): string {
    onBeforeUnmount(() => {
      postYoutubeCommand('pauseVideo')
    })
    const normalized = platform.trim().toLowerCase()

    switch (normalized) {
      case 'spotify':
        return 'simple-icons:spotify'
      case 'applemusic':
      case 'apple_music':
      case 'apple-music':
        return 'simple-icons:applemusic'
      case 'youtube':
        return 'simple-icons:youtube'
      case 'youtubemusic':
      case 'youtube_music':
      case 'youtube-music':
        return 'simple-icons:youtubemusic'
      case 'soundcloud':
        return 'simple-icons:soundcloud'
      case 'amazonmusic':
      case 'amazon_music':
      case 'amazon-music':
        return 'simple-icons:amazonmusic'
      case 'tidal':
        return 'simple-icons:tidal'
      case 'deezer':
        return 'simple-icons:deezer'
      case 'pandora':
        return 'simple-icons:pandora'
      case 'yandex':
        return 'fa7-brands:yandex'
      default:
        return 'solar:music-notes-line-duotone'
    }
  }

  function songLinkPrimaryIcon(): string {
    const primaryPlatform = info.value?.links[0]?.platform
    return primaryPlatform
      ? platformIcon(primaryPlatform)
      : 'solar:music-notes-line-duotone'
  }

  async function loadSongInfo(): Promise<void> {
    const normalizedUrl = normalizeUrl(props.url)
    if (!normalizedUrl) {
      info.value = null
      return
    }

    if (!isValidSongLinkUrl(normalizedUrl)) {
      info.value = null
      return
    }

    isLoading.value = true
    try {
      info.value = await fetchSongLinkInfo(normalizedUrl)
    } finally {
      isLoading.value = false
    }
  }

  watch(
    () => props.url,
    () => {
      menuOpen.value = false
      loadSongInfo()
    },
    { immediate: true }
  )

  const actionItems = computed<SongLinkActionItem[]>(() => {
    const normalizedUrl = normalizeUrl(props.url)
    if (!normalizedUrl || !isValidSongLinkUrl(normalizedUrl)) return []

    const fallback: SongLinkActionItem = {
      key: 'song-link',
      title: t('ui.profile.openSongLink'),
      icon: 'solar:link-minimalistic-2-line-duotone',
      url: normalizedUrl,
    }

    const platformItems = (info.value?.links ?? []).map(link => ({
      key: `${link.platform}:${link.url}`,
      title: t('ui.profile.openOnPlatform', { platform: link.displayName }),
      icon: platformIcon(link.platform),
      url: link.url,
    }))

    return [ fallback, ...platformItems ]
  })

  const pillTitle = computed(() => {
    if (isLoading.value) {
      return t('ui.profile.songLoading')
    }

    const title = info.value?.title?.trim()
    const artist = info.value?.artistName?.trim()

    if (title && artist) return `${title} · ${artist}`
    if (title) return title
    if (artist) return artist
    return t('ui.profile.songOpen')
  })

  function openExternal(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  function handlePillClick(): void {
    if (actionItems.value.length < 1) return

    if (actionItems.value.length < 2) {
      const onlyAction = actionItems.value[0]
      if (onlyAction) {
        openExternal(onlyAction.url)
      }
      return
    }

    menuOpen.value = !menuOpen.value
  }

  function handleAction(item: SongLinkActionItem): void {
    menuOpen.value = false
    openExternal(item.url)
  }
</script>

<template>
  <HStack class="songLinkWidget" v-if="hasValidUrl">
    <button
      ref="buttonRoot"
      type="button"
      class="songButton"
      @click="handlePillClick"
    >
      <HStack class="songPillContent">
        <img v-if="info" :src="info.thumbnailUrl" alt="album art" />
        <Icon v-else :icon="songLinkPrimaryIcon()" />

        <span class="songLabel">{{ pillTitle }}</span>
        <Icon
          v-if="actionItems.length > 1"
          icon="solar:alt-arrow-down-line-duotone"
          class="caretIcon"
        />
      </HStack>
    </button>

    <button
      v-if="youtubeEmbedUrl"
      type="button"
      class="playButton"
      @click="togglePlayback"
    >
      <Icon
        :icon="
          isPlaying ? 'solar:pause-line-duotone' : 'solar:play-line-duotone'
        "
      />
    </button>

    <ContextMenu
      :open="menuOpen"
      :anchor="buttonRoot"
      :title="t('ui.profile.songLinksMenuTitle')"
      @close="menuOpen = false"
    >
      <ContextMenuItem
        v-for="item in actionItems"
        :key="item.key"
        :title="item.title"
        :icon="item.icon"
        @click="handleAction(item)"
      />
    </ContextMenu>
    <iframe
      v-if="youtubeEmbedUrl"
      ref="youtubeFrame"
      class="hiddenYoutubeFrame"
      :src="youtubeEmbedUrl"
      allow="autoplay"
      tabindex="-1"
    />
  </HStack>
</template>

<style scoped lang="sass">
  .songLinkWidget
    position: relative
    display: flex
    justify-content: flex-start

  .songButton
    position: relative
    border-radius: 999px
    max-width: 100%

  .songPillContent
    align-items: center
    gap: 0.5rem
    flex-wrap: nowrap

  .songLabel
    max-width: min(34rem, calc(100vw - 8rem))
    overflow: hidden
    text-overflow: ellipsis
    white-space: nowrap

  .caretIcon
    opacity: 0.6

  .hiddenYoutubeFrame
    position: fixed
    width: 1px
    height: 1px
    opacity: 0
    pointer-events: none
    border: none
</style>

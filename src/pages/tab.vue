<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

  import ContentArea from '@/components/layout/ContentArea.vue'
  import HStack from '@/components/layout/HStack.vue'
  import Modal from '@/components/layout/Modal.vue'
  import VStack from '@/components/layout/VStack.vue'
  import { showingNavigation } from '@/data/visibility'
  import setHeadMeta from '@/utils/setHeadMeta'

  interface FavoriteItem {
    id: string
    title: string
    url: string
  }

  interface WallpaperPayload {
    download_url?: string
    author?: string
  }

  const FAVORITES_STORAGE_KEY = 'bygTabFavorites'
  const WALLPAPER_STORAGE_KEY = 'bygTabWallpaper'
  const CUSTOM_WALLPAPER_STORAGE_KEY = 'bygTabCustomWallpaper'
  const DEFAULT_FAVORITES: FavoriteItem[] = [
    { id: createId(), title: 'Byg', url: 'https://byg.a35.dev/' },
    { id: createId(), title: 'Gmail', url: 'https://mail.google.com' },
    { id: createId(), title: 'YouTube', url: 'https://youtube.com' },
    { id: createId(), title: 'GitHub', url: 'https://github.com' },
  ]
  const WALLPAPER_ROTATION_MS = 1000 * 60 * 10
  const CLOCK_TICK_MS = 1000

  const query = ref('')
  const now = ref(new Date())
  const favorites = ref<FavoriteItem[]>(loadFavorites())
  const favoriteTitle = ref('')
  const favoriteUrl = ref('')
  const editingFavoriteId = ref<string | null>(null)
  const showingEditorModal = ref(false)
  const favoriteError = ref('')
  const wallpaperUrl = ref(loadSavedWallpaper())
  const customWallpaperUrl = ref(loadCustomWallpaper())
  const wallpaperInput = ref(loadCustomWallpaper())
  const wallpaperError = ref('')
  const wallpaperLoading = ref(false)
  const brokenFavicons = ref<Record<string, boolean>>({})

  let clockTimer: number | undefined
  let wallpaperTimer: number | undefined

  const greeting = computed(() => {
    const hour = now.value.getHours()
    let timeOfDay: string

    switch (true) {
      case hour >= 5 && hour < 12:
        timeOfDay = 'morning'
        break
      case hour >= 12 && hour < 17:
        timeOfDay = 'afternoon'
        break
      case hour >= 17 && hour < 22:
        timeOfDay = 'evening'
        break
      default:
        timeOfDay = 'night'
    }

    return `Good ${timeOfDay}, it's`
  })

  const formattedTime = computed(() =>
    now.value.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  )

  const formattedDate = computed(() =>
    now.value.toLocaleDateString([], {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })
  )

  const isEditingFavorite = computed(() => !!editingFavoriteId.value)

  setHeadMeta({
    page: 'Tab',
    subtitle: 'Start your internet journey with Byg Tab.',
  })

  watch(
    favorites,
    value => {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(value))
    },
    { deep: true }
  )

  watch(wallpaperUrl, value => {
    if (!value) {
      localStorage.removeItem(WALLPAPER_STORAGE_KEY)
      return
    }

    localStorage.setItem(WALLPAPER_STORAGE_KEY, value)
  })

  watch(customWallpaperUrl, value => {
    if (!value) {
      localStorage.removeItem(CUSTOM_WALLPAPER_STORAGE_KEY)
      return
    }

    localStorage.setItem(CUSTOM_WALLPAPER_STORAGE_KEY, value)
  })

  onMounted(() => {
    showingNavigation.value = false

    clockTimer = window.setInterval(() => {
      now.value = new Date()
    }, CLOCK_TICK_MS)

    if (customWallpaperUrl.value) {
      wallpaperUrl.value = customWallpaperUrl.value
    } else {
      void updateWallpaper()
    }

    wallpaperTimer = window.setInterval(() => {
      void updateWallpaper()
    }, WALLPAPER_ROTATION_MS)
  })

  onUnmounted(() => {
    showingNavigation.value = true

    if (clockTimer) window.clearInterval(clockTimer)
    if (wallpaperTimer) window.clearInterval(wallpaperTimer)
  })

  async function submitSearch() {
    if (!query.value.trim()) return

    await navigateTo({
      path: '/search/results',
      query: { q: query.value.trim() },
    })
  }

  function startFavoriteEdit(favorite: FavoriteItem) {
    showingEditorModal.value = true
    editingFavoriteId.value = favorite.id
    favoriteTitle.value = favorite.title
    favoriteUrl.value = favorite.url
    favoriteError.value = ''
  }

  function openEditorModal() {
    showingEditorModal.value = true
  }

  function closeEditorModal() {
    showingEditorModal.value = false
    resetFavoriteForm()
    wallpaperError.value = ''
  }

  function resetFavoriteForm() {
    editingFavoriteId.value = null
    favoriteTitle.value = ''
    favoriteUrl.value = ''
    favoriteError.value = ''
  }

  function saveFavorite() {
    const title = favoriteTitle.value.trim()
    const normalizedUrl = normalizeUrl(favoriteUrl.value)

    if (!title || !normalizedUrl) {
      favoriteError.value = 'Enter a title and a valid URL.'
      return
    }

    favoriteError.value = ''

    if (editingFavoriteId.value) {
      favorites.value = favorites.value.map(favorite =>
        favorite.id === editingFavoriteId.value
          ? { ...favorite, title, url: normalizedUrl }
          : favorite
      )
    } else {
      favorites.value = [
        ...favorites.value,
        {
          id: createId(),
          title,
          url: normalizedUrl,
        },
      ]
    }

    resetFavoriteForm()
  }

  function removeFavorite(id: string) {
    favorites.value = favorites.value.filter(favorite => favorite.id !== id)

    if (editingFavoriteId.value === id) resetFavoriteForm()
  }

  async function updateWallpaper() {
    if (customWallpaperUrl.value) {
      wallpaperUrl.value = customWallpaperUrl.value
      wallpaperLoading.value = false
      return
    }

    wallpaperLoading.value = true

    try {
      const page = Math.max(1, Math.floor(Math.random() * 30))
      const response = await fetch(
        `https://picsum.photos/v2/list?page=${page}&limit=100`
      )
      if (!response.ok) throw new Error('Wallpaper request failed')

      const payload = (await response.json()) as WallpaperPayload[]
      const candidates = payload.filter(item => !!item.download_url)
      if (!candidates.length)
        throw new Error('No wallpaper candidates available')

      const wallpaper =
        candidates[Math.floor(Math.random() * candidates.length)] ?? null
      if (!wallpaper) throw new Error('No wallpaper selected')

      wallpaperUrl.value = `${wallpaper.download_url}?blur=0`
    } catch (error) {
      console.error('Failed to update wallpaper', error)

      if (!wallpaperUrl.value) {
        wallpaperUrl.value =
          'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80'
      }
    } finally {
      wallpaperLoading.value = false
    }
  }

  function createId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID()
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  }

  function normalizeUrl(input: string): string | null {
    const trimmed = input.trim()
    if (!trimmed) return null

    if (trimmed.startsWith('/')) return trimmed

    const withProtocol = /^[a-z]+:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`

    try {
      return new URL(withProtocol).toString()
    } catch {
      return null
    }
  }

  function normalizeImageUrl(input: string): string | null {
    const normalizedUrl = normalizeUrl(input)

    if (!normalizedUrl || normalizedUrl.startsWith('/')) return null

    return normalizedUrl
  }

  function loadFavorites(): FavoriteItem[] {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY)
    if (!raw) return DEFAULT_FAVORITES

    try {
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return DEFAULT_FAVORITES

      const sanitized = parsed
        .map(item => {
          if (!item || typeof item !== 'object') return null

          const title = typeof item.title === 'string' ? item.title.trim() : ''
          const url =
            typeof item.url === 'string' ? normalizeUrl(item.url) : null

          if (!title || !url) return null

          return {
            id:
              typeof item.id === 'string' && item.id.trim()
                ? item.id
                : createId(),
            title,
            url,
          }
        })
        .filter((item): item is FavoriteItem => !!item)

      return sanitized.length ? sanitized : DEFAULT_FAVORITES
    } catch {
      return DEFAULT_FAVORITES
    }
  }

  function loadSavedWallpaper(): string {
    return localStorage.getItem(WALLPAPER_STORAGE_KEY) ?? ''
  }

  function loadCustomWallpaper(): string {
    return localStorage.getItem(CUSTOM_WALLPAPER_STORAGE_KEY) ?? ''
  }

  function saveCustomWallpaper() {
    const normalizedUrl = normalizeImageUrl(wallpaperInput.value)

    if (!normalizedUrl) {
      wallpaperError.value = 'Enter a valid image URL.'
      return
    }

    wallpaperError.value = ''
    customWallpaperUrl.value = normalizedUrl
    wallpaperUrl.value = normalizedUrl
    wallpaperInput.value = normalizedUrl
  }

  function resetCustomWallpaper() {
    customWallpaperUrl.value = ''
    wallpaperInput.value = ''
    wallpaperError.value = ''
    void updateWallpaper()
  }

  function getFaviconUrl(url: string): string | null {
    if (url.startsWith('/')) return null

    try {
      const parsed = new URL(url)
      return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=64`
    } catch {
      return null
    }
  }

  function markFaviconBroken(id: string) {
    brokenFavicons.value = {
      ...brokenFavicons.value,
      [id]: true,
    }
  }

  function showFavicon(favorite: FavoriteItem): boolean {
    return !!getFaviconUrl(favorite.url) && !brokenFavicons.value[favorite.id]
  }

  function favoriteMonogram(title: string): string {
    return title
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase() ?? '')
      .join('')
  }
</script>

<template>
  <ContentArea
    class="bygTab"
    hide-terms-link
    :style="wallpaperUrl ? { '--wallpaper-image': `url(${wallpaperUrl})` } : {}"
  >
    <div class="wallpaperLayer" :class="{ ready: !!wallpaperUrl }" />
    <div class="wallpaperTint" />

    <div class="tabShell">
      <section class="heroPanel">
        <p class="greeting">{{ greeting }}</p>
        <p class="dateLabel">{{ formattedDate }}</p>
        <h1 class="clock">{{ formattedTime }}</h1>

        <form class="searchForm" @submit.prevent="submitSearch">
          <HStack class="searchInputWrap">
            <input
              v-model="query"
              class="searchInput"
              placeholder="Search with Byg..."
            />

            <button class="prominent">Search</button>
          </HStack>
        </form>
      </section>

      <section class="favoritesPanel">
        <HStack class="panelHeader">
          <h2>Favorites</h2>
        </HStack>

        <div class="favoritesGrid">
          <VStack
            v-for="favorite in favorites"
            :key="favorite.id"
            class="favoriteCard"
          >
            <details class="favoriteMenu">
              <summary>...</summary>

              <div class="favoriteMenuActions">
                <button @click="startFavoriteEdit(favorite)">
                  <Icon icon="solar:pen-line-duotone" />
                  Edit
                </button>
                <button @click="removeFavorite(favorite.id)">
                  <Icon icon="solar:trash-bin-trash-line-duotone" />
                  Remove
                </button>
              </div>
            </details>

            <a :href="favorite.url" target="_blank" rel="noreferrer">
              <VStack class="content">
                <img
                  v-if="showFavicon(favorite)"
                  :src="getFaviconUrl(favorite.url) ?? undefined"
                  :alt="`${favorite.title} favicon`"
                  class="favoriteIcon"
                  @error="markFaviconBroken(favorite.id)"
                />
                <span v-else class="favoriteIcon favoriteFallback">
                  {{ favoriteMonogram(favorite.title) }}
                </span>

                <span class="favoriteTitle">{{ favorite.title }}</span>
              </VStack>
            </a>
          </VStack>
        </div>
      </section>

      <button class="editPageButton prominent large" @click="openEditorModal">
        <Icon icon="solar:pen-line-duotone" />
      </button>
    </div>

    <Modal independent v-if="showingEditorModal" class="editorModal">
      <VStack class="editorModalContent">
        <HStack class="editorHeader autoSpace">
          <h2>Customize</h2>

          <button @click="closeEditorModal">
            <Icon icon="mingcute:close-fill" />
          </button>
        </HStack>

        <VStack class="editorSection">
          <h3>{{ isEditingFavorite ? 'Edit favorite' : 'Add favorite' }}</h3>

          <form class="favoriteForm" @submit.prevent="saveFavorite">
            <input
              v-model="favoriteTitle"
              type="text"
              placeholder="Favorite title"
              maxlength="40"
            />

            <input
              v-model="favoriteUrl"
              type="text"
              placeholder="https://example.com"
            />

            <button class="prominent">
              {{ isEditingFavorite ? 'Save' : 'Add' }}
            </button>
          </form>

          <p v-if="favoriteError" class="favoriteError">{{ favoriteError }}</p>

          <button
            v-if="isEditingFavorite"
            class="editorSecondaryButton"
            @click="resetFavoriteForm"
          >
            <Icon icon="mingcute:close-fill" />
            Cancel Edit
          </button>
        </VStack>

        <VStack class="editorSection">
          <h3>Wallpaper</h3>

          <form class="wallpaperForm" @submit.prevent="saveCustomWallpaper">
            <input
              v-model="wallpaperInput"
              type="text"
              placeholder="Custom wallpaper image URL"
            />

            <button
              class="transparent"
              v-if="customWallpaperUrl"
              @click="resetCustomWallpaper"
            >
              Use Default Wallpaper
            </button>

            <button class="prominent">
              <Icon icon="solar:diskette-line-duotone" />
              Set Wallpaper
            </button>
          </form>

          <p v-if="wallpaperError" class="favoriteError">
            {{ wallpaperError }}
          </p>
        </VStack>
      </VStack>
    </Modal>
  </ContentArea>
</template>

<style scoped lang="sass">
  @use "@/styles/utils"
  @use "@/styles/themes"

  .bygTab
    background-image: var(--wallpaper-image), linear-gradient(135deg, #20344b, #0e1624 65%, #081018)
    background-position: center
    background-size: cover
    background-repeat: no-repeat

  .wallpaperLayer,
  .wallpaperTint
    position: absolute
    inset: -2rem
    border-radius: 0

  .wallpaperLayer
    background-image: var(--wallpaper-image), linear-gradient(135deg, #20344b, #0e1624 65%, #081018)
    background-position: center
    background-size: cover
    filter: saturate(1.08)
    transform: scale(1.03)
    opacity: 0.75
    transition: opacity 0.45s ease

    &.ready
      opacity: 1

  .wallpaperTint
    background: linear-gradient(180deg, rgb(24 22 32 / 0.4), rgb(51 44 62 / 0.78))
    backdrop-filter: blur(0.25rem)

  .tabShell
    position: relative
    width: min(76rem, 100%)
    min-height: 100vh
    padding: 3rem 0
    justify-content: center
    gap: 2rem

  .heroPanel,
  .favoritesPanel
    width: 100%
    padding: 1rem 0

  .clock
    margin: 0 0 1rem
    font-size: clamp(3rem, 10vw, 6.5rem)
    font-weight: 700
    letter-spacing: 0
    line-height: 1

  .dateLabel
    margin: 0
    opacity: 0.78
    font-size: 3rem

  .greeting
    font-size: clamp(1.5rem, 4vw, 2.6rem)
    font-weight: 700

  .searchForm
    width: 100%

  .searchInputWrap
    justify-content: center

  .favoriteError
    margin: 0
    color: #ffd4d4

  .editorModal
    z-index: 100

    .editorModalContent
      @include utils.itemBackground

      width: min(44rem, calc(100vw - 2rem))
      z-index: 101

      .editorSection
        flex-wrap: nowrap
        width: 100%

        form
          width: 100%
          display: flex
          flex-direction: row
          gap: 0.5rem

          *:not(button)
            flex-grow: 1

  .favoritesGrid
    display: grid
    grid-template-columns: repeat(auto-fill, minmax(6rem, 1fr))
    gap: 1rem

  .favoriteCard
    position: relative

    &:hover .favoriteMenu
      display: block

    .content
      align-items: center

      .favoriteIcon
        width: 3.5rem
        height: 3.5rem
        border-radius: 1rem
        background: themes.$foregroundColor
        object-fit: cover

      .favoriteFallback
        display: inline-flex
        align-items: center
        justify-content: center
        font-size: 1rem
        font-weight: 700

    .favoriteMenu
      display: none
      position: absolute
      top: 0
      right: 0

      &[open]
        .favoriteMenuActions
          display: flex

      summary
        display: flex
        align-items: center
        justify-content: center
        list-style: none
        width: 2rem
        height: 2rem
        border-radius: 50%
        background: themes.$foregroundColor
        cursor: pointer
        user-select: none

        &::-webkit-details-marker
          display: none

      .favoriteMenuActions
        display: none
        gap: 0.1rem
        position: absolute
        top: calc(100% + 0.4rem)
        right: 0
        width: 8rem
        padding: 0.5rem
        background: themes.$foregroundColor
        border: themes.$foregroundColor
        backdrop-filter: blur(1rem)
        border-radius: 1.5rem

        button
          width: 100%
          justify-content: flex-start
          background: transparent

  .editPageButton
    position: fixed
    right: 1.5rem
    bottom: 1.5rem

  @media (max-width: 60rem)
    .favoriteForm,
    .wallpaperForm
      grid-template-columns: 1fr

  @media (max-width: 40rem)
    .tabShell
      padding: 1rem 0

    .heroPanel,
    .favoritesPanel
      padding: 0.5rem 0

    .editorHeader
      flex-direction: column
      align-items: flex-start

    .editPageButton
      right: 1rem
      bottom: 1rem
</style>

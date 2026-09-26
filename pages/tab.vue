<script setup lang="ts">
  import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

  import ContentArea from '@/components/layout/ContentArea.vue'
  import HStack from '@/components/layout/HStack.vue'
  import Modal from '@/components/layout/Modal.vue'
  import VStack from '@/components/layout/VStack.vue'
  import setHeadMeta from '@/utils/setHeadMeta'

  definePageMeta({ layout: 'plain' })

  interface FavoriteItem {
    id: string
    title: string
    url: string
  }

  const FAVORITES_STORAGE_KEY = 'bygTabFavorites'
  const DEFAULT_FAVORITES: FavoriteItem[] = [
    { id: createId(), title: 'Byg', url: 'https://byg.gg/' },
    { id: createId(), title: 'Gmail', url: 'https://mail.google.com' },
    { id: createId(), title: 'YouTube', url: 'https://youtube.com' },
    { id: createId(), title: 'GitHub', url: 'https://github.com' },
  ]
  const CLOCK_TICK_MS = 1000

  const favoritesCookie = useCookie<FavoriteItem[]>(FAVORITES_STORAGE_KEY, {
    default: () => DEFAULT_FAVORITES,
  })
  const query = ref('')
  const now = ref(new Date())
  const favorites = ref<FavoriteItem[]>(favoritesCookie.value)
  const favoriteTitle = ref('')
  const favoriteUrl = ref('')
  const editingFavoriteId = ref<string | null>(null)
  const showingEditorModal = ref(false)
  const favoriteError = ref('')
  const brokenFavicons = ref<Record<string, boolean>>({})

  let clockTimer: number | undefined

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
      favoritesCookie.value = value
    },
    { deep: true }
  )

  onMounted(() => {
    clockTimer = window.setInterval(() => {
      now.value = new Date()
    }, CLOCK_TICK_MS)
  })

  onUnmounted(() => {
    if (clockTimer) window.clearInterval(clockTimer)
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
  <ContentArea class="bygTab" hide-terms-link>
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
                  <Icon name="solar:pen-line-duotone" />
                  Edit
                </button>
                <button @click="removeFavorite(favorite.id)">
                  <Icon name="solar:trash-bin-trash-line-duotone" />
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
        <Icon name="solar:pen-line-duotone" />
      </button>
    </div>

    <Modal :visible="showingEditorModal" class="editorModal">
      <VStack class="editorModalContent">
        <HStack class="editorHeader autoSpace">
          <h2>Customize</h2>

          <button @click="closeEditorModal">
            <Icon name="mingcute:close-fill" />
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

          <p v-if="favoriteError" class="favoriteError">
            {{ favoriteError }}
          </p>

          <button
            v-if="isEditingFavorite"
            class="editorSecondaryButton"
            @click="resetFavoriteForm"
          >
            <Icon name="mingcute:close-fill" />
            Cancel Edit
          </button>
        </VStack>
      </VStack>
    </Modal>
  </ContentArea>
</template>

<style scoped lang="sass">
  @use "@/styles/utils"
  @use "@/styles/themes"

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
    .favoriteForm
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

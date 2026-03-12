<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import {computed, onMounted, onUnmounted, type Ref, ref, watch} from 'vue'
  import { useRoute, useRouter } from 'vue-router'

  import ContentArea from '@/components/layout/ContentArea.vue'
  import EmptyState from '@/components/layout/EmptyState.vue'
  import ErrorState from '@/components/layout/ErrorState.vue'
  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import { fetchBygSearch } from '@/data/search'
  import { title } from '@/data/title.ts'
  import type {
    BygSearchCategory,
    BygSearchResponse,
    BygSearchResult,
  } from '@/types/search'
  import setHeadMeta from '@/utils/setHeadMeta.ts'
  import {showingNavigation} from "@/data/visibility.ts";

  interface SearchCategoryOption {
    id: BygSearchCategory
    label: string
    icon: string
  }

  const searchCategoryOptions: SearchCategoryOption[] = [
    {
      id: 'web',
      label: 'Web',
      icon: 'solar:global-line-duotone',
    },
    {
      id: 'images',
      label: 'Images',
      icon: 'solar:gallery-round-line-duotone',
    },
    {
      id: 'videos',
      label: 'Videos',
      icon: 'solar:clapperboard-play-line-duotone',
    },
    {
      id: 'music',
      label: 'Music',
      icon: 'solar:music-note-2-line-duotone',
    },
    {
      id: 'news',
      label: 'News',
      icon: 'solar:document-text-line-duotone',
    },
    {
      id: 'science',
      label: 'Science',
      icon: 'solar:test-tube-line-duotone',
    },
    {
      id: 'files',
      label: 'Files',
      icon: 'solar:file-text-line-duotone',
    },
    {
      id: 'social',
      label: 'Social',
      icon: 'solar:users-group-two-rounded-line-duotone',
    },
  ]

  const starterSuggestions = [
    'latest AI news',
    'ambient music playlists',
    'beautiful wallpapers',
    'typescript tips',
    'open source social media projects',
  ]

  title.value = 'Search'
  setHeadMeta({
    page: 'Search',
    subtitle: 'Search the web, images, videos, music and more with Byg Search.',
  })

  const route = useRoute()
  const router = useRouter()

  const query: Ref<string> = ref('')
  const selectedCategory: Ref<BygSearchCategory> = ref('web')
  const page: Ref<number> = ref(1)
  const loading: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)
  const searchResponse: Ref<BygSearchResponse | null> = ref(null)

  onMounted(() => {
    showingNavigation.value = false
  })

  onUnmounted(() => {
    showingNavigation.value = true
  })

  const selectedCategoryLabel = computed(() => {
    return (
      searchCategoryOptions.find(
        option => option.id === selectedCategory.value
      )?.label ?? 'Web'
    )
  })

  const hasResults = computed(() => {
    return (searchResponse.value?.results.length ?? 0) > 0
  })

  const isImageCategory = computed(() => {
    return selectedCategory.value === 'images'
  })

  const activeSuggestions = computed(() => {
    if (!searchResponse.value) return []
    return searchResponse.value.suggestions.slice(0, 6)
  })

  function categoryFromRoute(rawCategory: unknown): BygSearchCategory {
    const normalized =
      typeof rawCategory === 'string' ? rawCategory.trim().toLowerCase() : ''
    if (searchCategoryOptions.some(option => option.id === normalized)) {
      return normalized as BygSearchCategory
    }
    return 'web'
  }

  function pageFromRoute(rawPage: unknown): number {
    const parsed =
      typeof rawPage === 'string' ? Number(rawPage) : Number.NaN
    if (!Number.isFinite(parsed)) return 1
    return Math.max(1, Math.trunc(parsed))
  }

  function hostnameFromUrl(urlValue: string): string {
    try {
      return new URL(urlValue).hostname.replace(/^www\./, '')
    } catch {
      return urlValue
    }
  }

  async function applyRouteSearch(): Promise<void> {
    const nextQuery =
      typeof route.query.q === 'string' ? route.query.q.trim() : ''
    const nextCategory = categoryFromRoute(route.query.category)
    const nextPage = pageFromRoute(route.query.page)

    query.value = nextQuery
    selectedCategory.value = nextCategory
    page.value = nextPage

    if (!nextQuery) {
      loading.value = false
      error.value = null
      searchResponse.value = null
      return
    }

    loading.value = true
    error.value = null

    const loadedSearch = await fetchBygSearch({
      query: nextQuery,
      category: nextCategory,
      page: nextPage,
      safeSearch: 1,
    })

    loading.value = false

    if (!loadedSearch) {
      error.value = 'Failed to load Byg Search results.'
      return
    }

    searchResponse.value = loadedSearch
  }

  async function pushRouteSearchState(
    nextQuery: string,
    nextCategory: BygSearchCategory,
    nextPage: number
  ): Promise<void> {
    if (!nextQuery.trim()) {
      await router.replace({
        name: 'search',
        query: {
          category: nextCategory === 'web' ? undefined : nextCategory,
        },
      })
      return
    }

    await router.replace({
      name: 'search',
      query: {
        q: nextQuery.trim(),
        category: nextCategory === 'web' ? undefined : nextCategory,
        page: nextPage > 1 ? String(nextPage) : undefined,
      },
    })
  }

  async function submitSearch(): Promise<void> {
    await pushRouteSearchState(query.value, selectedCategory.value, 1)
  }

  async function pickCategory(category: BygSearchCategory): Promise<void> {
    selectedCategory.value = category
    await pushRouteSearchState(query.value, category, 1)
  }

  async function pickSuggestion(suggestion: string): Promise<void> {
    query.value = suggestion
    await pushRouteSearchState(suggestion, selectedCategory.value, 1)
  }

  async function goToPreviousPage(): Promise<void> {
    if (page.value <= 1 || loading.value) return
    await pushRouteSearchState(query.value, selectedCategory.value, page.value - 1)
  }

  async function goToNextPage(): Promise<void> {
    if (loading.value || !query.value.trim()) return
    await pushRouteSearchState(query.value, selectedCategory.value, page.value + 1)
  }

  watch(
    () => [ route.query.q, route.query.category, route.query.page ] as const,
    async () => {
      await applyRouteSearch()
    },
    { immediate: true }
  )
</script>

<template>
  <ContentArea>
    <RouterLink to="/search">
      <VStack class="logo">
        <h1>Byg Search</h1>
        <h3 class="light">Search the web privately.</h3>
      </VStack>
    </RouterLink>

    <VStack class="searchHeaderCard">
      <form class="searchForm" @submit.prevent="submitSearch">
        <HStack class="searchInputWrap">
          <input
            v-model="query"
            class="searchInput"
            placeholder="Search with Byg..."
            aria-label="Search query"
          />

          <button class="prominent searchSubmitButton" :disabled="loading">
            <Icon icon="solar:minimalistic-magnifer-line-duotone" />
            {{ loading ? 'Searching...' : 'Search' }}
          </button>
        </HStack>
      </form>

      <HStack class="searchCategoryBar">
        <button
          v-for="category in searchCategoryOptions"
          :key="category.id"
          class="searchCategoryButton"
          :class="{ prominent: selectedCategory === category.id }"
          @click="pickCategory(category.id)"
          :disabled="loading"
        >
          <Icon :icon="category.icon" />
          {{ category.label }}
        </button>
      </HStack>
    </VStack>

    <ErrorState v-if="error" :message="error" />

    <EmptyState
      v-else-if="loading"
      :message="`Searching ${selectedCategoryLabel.toLowerCase()}...`"
    />

    <VStack v-else-if="!searchResponse" class="searchLandingCard">
      <Icon icon="solar:rocket-2-line-duotone" />
      <h3>Start searching with Byg Search</h3>
      <p class="light">Try one of these ideas:</p>

      <HStack class="starterSuggestionGrid">
        <button
          v-for="suggestion in starterSuggestions"
          :key="suggestion"
          class="starterSuggestionButton"
          @click="pickSuggestion(suggestion)"
        >
          <Icon icon="solar:bolt-circle-line-duotone" />
          {{ suggestion }}
        </button>
      </HStack>
    </VStack>

    <VStack v-else-if="!hasResults" class="searchLandingCard">
      <Icon icon="solar:ghost-smile-line-duotone" />
      <h3>No results found</h3>
      <p class="light">
        Try different wording, switch category, or search without filters.
      </p>

      <HStack class="starterSuggestionGrid" v-if="activeSuggestions.length > 0">
        <button
          v-for="suggestion in activeSuggestions"
          :key="suggestion"
          class="starterSuggestionButton"
          @click="pickSuggestion(suggestion)"
        >
          <Icon icon="solar:restart-line-duotone" />
          {{ suggestion }}
        </button>
      </HStack>
    </VStack>

    <VStack v-else class="searchResultsSection">
      <HStack class="resultsMeta autoSpace">
        <p>
          {{ searchResponse.totalResults?.toLocaleString() ?? '?' }}
          results for <b>{{ searchResponse.query }}</b>
        </p>
        <p class="light">~{{ searchResponse.tookMs }} ms</p>
      </HStack>

      <HStack class="answerRow" v-if="searchResponse.answers.length > 0">
        <Icon icon="solar:lightbulb-line-duotone" />
        <p>{{ searchResponse.answers[0] }}</p>
      </HStack>

      <HStack class="suggestionRow" v-if="activeSuggestions.length > 0">
        <button
          v-for="suggestion in activeSuggestions"
          :key="suggestion"
          class="suggestionButton"
          @click="pickSuggestion(suggestion)"
        >
          <Icon icon="solar:refresh-circle-line-duotone" />
          {{ suggestion }}
        </button>
      </HStack>

      <div class="imageResultGrid" v-if="isImageCategory">
        <a
          v-for="result in searchResponse.results"
          :key="result.url"
          class="imageResultCard"
          :href="result.url"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div class="imagePreview">
            <img
              v-if="result.thumbnailUrl"
              :src="result.thumbnailUrl"
              :alt="result.title"
              loading="lazy"
            />
            <div class="imagePreviewFallback" v-else>
              <Icon icon="solar:gallery-wide-line-duotone" />
            </div>
          </div>

          <VStack class="imageCardMeta">
            <h3>{{ result.title }}</h3>
            <p class="light">{{ hostnameFromUrl(result.url) }}</p>
          </VStack>
        </a>
      </div>

      <VStack v-else class="resultList">
        <a
          v-for="result in searchResponse.results"
          :key="result.url"
          class="resultCard"
          :href="result.url"
          target="_blank"
          rel="noopener noreferrer"
        >
          <HStack class="resultHeading">
            <Icon icon="solar:global-line-duotone" />
            <h3>{{ result.title }}</h3>
          </HStack>

          <p class="light resultSnippet">
            {{ result.snippet || 'Open this result' }}
          </p>

          <HStack class="resultFooter autoSpace">
            <p>{{ hostnameFromUrl(result.url) }}</p>
            <p class="light">
              {{ result.engine ?? result.engines[0] ?? 'Byg Search' }}
            </p>
          </HStack>
        </a>
      </VStack>

      <HStack class="paginationBar autoSpace">
        <button :disabled="page <= 1 || loading" @click="goToPreviousPage">
          <Icon icon="solar:arrow-left-line-duotone" />
          Previous
        </button>
        <p class="light">Page {{ page }}</p>
        <button :disabled="loading" @click="goToNextPage">
          Next
          <Icon icon="solar:arrow-right-line-duotone" />
        </button>
      </HStack>
    </VStack>
  </ContentArea>
</template>

<style scoped lang="sass">
  @use "@/styles/themes"
  @use "@/styles/variables"

  .logo
    align-items: center
    gap: 0

    h1
      font-size: 3rem
      font-style: italic

  .searchHeaderCard, .searchLandingCard, .searchResultsSection
    width: 100%
    max-width: 70rem
    border-radius: 1.5rem
    margin: 0.75rem 0

  .searchHeaderCard
    gap: 0.75rem

    .searchForm
      width: 100%
      height: auto
      gap: 0.5rem

      .searchInputWrap
        width: 100%
        flex-wrap: nowrap
        gap: 0.5rem

        .searchInput
          flex: 1 1 auto
          min-width: 0
          padding: 0.75rem 1rem
          border-radius: 1rem

        .searchSubmitButton
          flex-shrink: 0
          white-space: nowrap
          padding: 0.75rem 1rem

    .searchCategoryBar
      width: 100%
      gap: 0.5rem

      .searchCategoryButton
        padding: 0.5rem 0.75rem

  .searchLandingCard
    align-items: center
    text-align: center
    gap: 0.75rem

    .starterSuggestionGrid
      width: 100%
      justify-content: center

      .starterSuggestionButton
        padding: 0.5rem 0.75rem

  .searchResultsSection
    gap: 0.75rem

    .resultsMeta
      width: 100%
      align-items: center

      p
        margin: 0

    .answerRow
      width: 100%
      padding: 0.75rem
      border-radius: 1rem
      background: themes.$foregroundOpaque
      align-items: center

      p
        margin: 0

    .suggestionRow
      width: 100%
      gap: 0.5rem

      .suggestionButton
        padding: 0.45rem 0.7rem

    .resultList
      width: 100%
      gap: 0.5rem

      .resultCard
        width: 100%
        background: themes.$foregroundColor
        border: 0.1rem solid themes.$foregroundOpaque
        border-radius: 1rem
        padding: 0.9rem
        align-items: flex-start
        text-align: left
        gap: 0.45rem

        .resultHeading
          width: 100%
          flex-wrap: nowrap
          align-items: center
          gap: 0.35rem

          h3
            margin: 0
            min-width: 0
            overflow: hidden
            text-overflow: ellipsis
            white-space: nowrap

        .resultSnippet
          margin: 0
          width: 100%
          display: -webkit-box
          -webkit-line-clamp: 3
          -webkit-box-orient: vertical
          overflow: hidden

        .resultFooter
          width: 100%
          p
            margin: 0

    .imageResultGrid
      display: grid
      width: 100%
      grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr))
      gap: 0.6rem

      .imageResultCard
        display: flex
        flex-direction: column
        background: themes.$foregroundColor
        border: 0.1rem solid themes.$foregroundOpaque
        border-radius: 1rem
        overflow: hidden
        text-align: left
        gap: 0

        .imagePreview
          width: 100%
          aspect-ratio: 4 / 3
          background: themes.$foregroundOpaque
          border-radius: 0
          overflow: hidden

          img
            width: 100%
            height: 100%
            object-fit: cover
            border-radius: 0

          .imagePreviewFallback
            width: 100%
            height: 100%
            justify-content: center

            svg
              width: 2rem
              height: 2rem

        .imageCardMeta
          width: 100%
          padding: 0.65rem
          gap: 0.15rem
          align-items: flex-start

          h3, p
            margin: 0
            width: 100%
            overflow: hidden
            text-overflow: ellipsis
            white-space: nowrap

    .paginationBar
      width: 100%
      align-items: center

      p
        margin: 0

  @media (max-width: variables.$mobileWidth)
    .searchHeaderCard
      .searchForm
        .searchInputWrap
          flex-wrap: wrap

          .searchSubmitButton
            width: 100%

    .searchResultsSection
      .resultList
        .resultCard
          .resultHeading h3
            white-space: normal
</style>

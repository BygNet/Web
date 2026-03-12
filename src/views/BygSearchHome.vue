<script setup lang="ts">
  import { onMounted, onUnmounted, ref } from 'vue'
  import { useRouter } from 'vue-router'

  import ContentArea from '@/components/layout/ContentArea.vue'
  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import { showingNavigation } from '@/data/visibility.ts'

  const router = useRouter()
  const query = ref('')

  async function submitSearch() {
    if (!query.value.trim()) return

    await router.push({
      name: 'search-results',
      query: { q: query.value },
    })
  }

  onMounted(() => {
    showingNavigation.value = false
  })

  onUnmounted(() => {
    showingNavigation.value = true
  })
</script>

<template>
  <ContentArea class="searchHome">
    <VStack class="homeWrap">
      <div class="bygLogo">
        <h1>Byg Search</h1>
        <h3 class="light">Search the web privately.</h3>
        <p class="light">Byg does not store your search history.</p>
      </div>

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
    </VStack>
  </ContentArea>
</template>

<style scoped lang="sass">
  .homeWrap
    flex-wrap: nowrap
    align-items: center
    gap: 1.5rem
    margin-top: 30vh
    width: 100%

    .bygLogo
      h1
        font-size: 4rem
        font-style: italic

    .searchForm
      width: 55rem
      max-width: 100%

  @media (max-width: 40rem)
    .homeWrap
      .bygLogo
        h1
          font-size: 2rem
</style>

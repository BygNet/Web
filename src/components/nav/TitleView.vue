<script setup lang="ts">
import {Icon} from "@iconify/vue";
import { title, showBackButton } from '@/data/title.ts'
  import HStack from '@/components/layout/HStack.vue'
  import { useRouter } from 'vue-router'

  const router = useRouter()
</script>

<template>
  <header class="titleView">
    <HStack>
      <button @click="router.back()" v-if="showBackButton" class="backButton">
        <Icon icon="solar:arrow-left-line-duotone" />
      </button>
      <h2>{{ title }}</h2>
    </HStack>
  </header>
</template>

<style scoped lang="sass">
  @use "@/styles/colors"

  .titleView
    position: sticky
    top: 0
    z-index: 101
    background: linear-gradient(to bottom, colors.$backgroundColor, transparent)
    padding: 0.5rem var(--padding) 1rem
    margin-bottom: -1rem

  button.backButton
    padding: 0.75rem

    svg
      width: 1.5rem !important
      height: 1.5rem !important
</style>

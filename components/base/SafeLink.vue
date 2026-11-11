<script setup lang="ts">
import { computed, useAttrs } from 'vue'

import { recordAppVisit } from '@/data/appUsage'

interface Props {
  to: string
  external?: boolean
  newTab?: boolean
  custom?: boolean
  disable?: boolean
  noPreview?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  external: false,
  newTab: false,
  noPreview: false,
})

const localePath = useLocalePath()
const attrs = useAttrs()

const href = computed(() => {
  if (props.external) return props.to

  if (props.to.startsWith('#')) {
    return {
      hash: props.to,
    }
  }

  return localePath(props.to)
})

const isExternal = computed(() => props.external || props.to.startsWith('http'))

function trackNavigation(): void {
  if (!isExternal.value) recordAppVisit(props.to)
}
</script>

<template>
  <div v-if="disable" class="noLink" v-bind="attrs">
    <slot />
  </div>

  <!-- NORMAL LINK (auto navigation) -->
  <NuxtLink
    v-else-if="!isExternal && !custom"
    v-bind="attrs"
    :to="href"
    @click="trackNavigation"
    :target="newTab ? '_blank' : null"
    :rel="newTab ? 'noopener noreferrer' : undefined"
    :class="{ noPreview }"
  >
    <slot />
  </NuxtLink>

  <!-- CUSTOM MODE (manual navigation) -->
  <NuxtLink
    v-else-if="!isExternal && custom"
    v-bind="attrs"
    :to="href"
    custom
    @click="trackNavigation"
    v-slot="slotProps"
    :class="{ noPreview }"
  >
    <slot v-bind="slotProps" />
  </NuxtLink>

  <!-- EXTERNAL -->
  <a
    v-else
    v-bind="attrs"
    :href="typeof href === 'string' ? href : href.hash"
    :target="newTab ? '_blank' : undefined"
    :rel="newTab ? 'noopener noreferrer' : undefined"
    :class="{ noPreview }"
  >
    <slot />
  </a>
</template>

<style lang="sass">
.noPreview
  -webkit-touch-callout: none
  -webkit-tap-highlight-color: transparent
  -webkit-user-select: none
  -webkit-user-drag: none
</style>

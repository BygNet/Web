<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  to: string
  external?: boolean
  newTab?: boolean
  custom?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  external: false,
  newTab: false,
})

const localePath = useLocalePath()

const href = computed(() => {
  if (props.external) return props.to
  return localePath(props.to)
})

const isExternal = computed(() => props.external || props.to.startsWith('http'))
</script>

<template>
  <!-- NORMAL LINK (auto navigation) -->
  <NuxtLink
    v-if="!isExternal && !custom"
    :to="href"
    :target="newTab ? '_blank' : null"
    :rel="newTab ? 'noopener noreferrer' : undefined"
  >
    <slot />
  </NuxtLink>

  <!-- CUSTOM MODE (manual navigation) -->
  <NuxtLink
    v-else-if="!isExternal && custom"
    :to="href"
    custom
    v-slot="slotProps"
  >
    <slot v-bind="slotProps" />
  </NuxtLink>

  <!-- EXTERNAL -->
  <a
    v-else
    :href="href"
    :target="newTab ? '_blank' : undefined"
    :rel="newTab ? 'noopener noreferrer' : undefined"
  >
    <slot />
  </a>
</template>

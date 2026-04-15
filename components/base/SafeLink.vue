<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  to: string
  external?: boolean
  newTab?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  external: false,
  newTab: false,
})

const { locale } = useI18n()

const href = computed(() => {
  if (props.external) {
    return props.to
  }

  // For internal links, prepend locale if not default
  if (locale.value !== 'en') {
    return `/${locale.value}${props.to}`
  }
  return props.to
})

const isExternal = computed(() => props.external || props.to.startsWith('http'))
</script>

<template>
  <NuxtLink
    v-if="!isExternal"
    :to="href"
    :target="newTab ? '_blank' : null"
    :rel="newTab ? 'noopener noreferrer' : undefined"
  >
    <slot />
  </NuxtLink>

  <a
    v-else
    :href="href"
    :target="newTab ? '_blank' : undefined"
    :rel="newTab ? 'noopener noreferrer' : undefined"
  >
    <slot />
  </a>
</template>

<script setup lang="ts">
  import { computed, useAttrs } from 'vue'

  interface Props {
    to: string
    external?: boolean
    newTab?: boolean
    custom?: boolean
    disable?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    external: false,
    newTab: false,
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

  const isExternal = computed(
    () => props.external || props.to.startsWith('http')
  )
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
    :target="newTab ? '_blank' : null"
    :rel="newTab ? 'noopener noreferrer' : undefined"
  >
    <slot />
  </NuxtLink>

  <!-- CUSTOM MODE (manual navigation) -->
  <NuxtLink
    v-else-if="!isExternal && custom"
    v-bind="attrs"
    :to="href"
    custom
    v-slot="slotProps"
  >
    <slot v-bind="slotProps" />
  </NuxtLink>

  <!-- EXTERNAL -->
  <a
    v-else
    v-bind="attrs"
    :href="href"
    :target="newTab ? '_blank' : undefined"
    :rel="newTab ? 'noopener noreferrer' : undefined"
  >
    <slot />
  </a>
</template>

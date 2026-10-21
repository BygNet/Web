<script setup lang="ts">
  import { onMounted } from 'vue'

  definePageMeta({ showBackButton: false })

  onMounted(() => {
    const script = document.createElement('script')
    script.src =
      'https://yastatic.net/s3/passport-sdk/autofill/v1/sdk-suggest-token-with-polyfills-latest.js'
    script.async = true
    script.onload = () => {
      window.YaSendSuggestToken?.(window.location.origin, { flag: true })
    }
    document.head.appendChild(script)
  })
</script>

<template>
  <span aria-hidden="true" />
</template>

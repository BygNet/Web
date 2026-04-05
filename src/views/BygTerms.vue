<script setup lang="ts">
  import { marked } from 'marked'
  import { onMounted, onUnmounted, ref } from 'vue'

  import ContentArea from '@/components/layout/ContentArea.vue'
  import VStack from '@/components/layout/VStack.vue'
  import { showBackButton, title } from '@/data/title'
  import { sanitizeHtml } from '@/utils/sanitizeHtml'
  import setHeadMeta from '@/utils/setHeadMeta'

  setHeadMeta({
    page: 'Terms',
    subtitle: 'Byg Terms of Service.',
  })
  title.value = 'Terms'
  showBackButton.value = true
  const tosHtml = ref('')

  onMounted(async () => {
    const res = await fetch('/tos.md')
    const md = await res.text()
    const rendered = await marked.parse(md)
    tosHtml.value = sanitizeHtml(rendered)
  })

  onUnmounted(() => {
    showBackButton.value = false
  })
</script>

<template>
  <ContentArea class="bygTos">
    <VStack class="noSpace">
      <span v-html="tosHtml" />
    </VStack>
  </ContentArea>
</template>

<script setup lang="ts">
  import DOMPurify from 'dompurify'
  import { marked } from 'marked'
  import { onMounted, ref } from 'vue'

  import ContentArea from '@/components/layout/ContentArea.vue'
  import VStack from "@/components/layout/VStack.vue";
  import {showBackButton, title} from "@/data/title.ts";

  title.value = "Terms"
  showBackButton.value = true
  const tosHtml = ref('')

  onMounted(async () => {
    const res = await fetch('/tos.md')
    const md = await res.text()
    const rendered = await marked.parse(md)
    tosHtml.value = DOMPurify.sanitize(rendered)
  })
</script>

<template>
  <ContentArea class="bygTos">
    <VStack class="noSpace">
      <span v-html="tosHtml" />
    </VStack>
  </ContentArea>
</template>

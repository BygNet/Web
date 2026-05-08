<script setup lang="ts">
  import DOMPurify from 'dompurify'
  import { marked } from 'marked'
  import { onMounted, ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  import ContentArea from '@/components/layout/ContentArea.vue'
  import VStack from '@/components/layout/VStack.vue'
  import { title } from '@/data/title'
  import setHeadMeta from '@/utils/setHeadMeta'

  const { t } = useI18n()

  setHeadMeta({
    page: t('pages.terms.title'),
    subtitle: t('pages.terms.description'),
  })

  definePageMeta({ showBackButton: true })

  title.value = t('pages.terms.title')

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

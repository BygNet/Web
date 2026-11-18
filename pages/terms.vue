<script setup lang="ts">
import DOMPurify from 'dompurify'
import { marked } from 'marked'
import { onMounted, ref } from 'vue'

import ContentArea from '@/components/layout/ContentArea.vue'
import VStack from '@/components/layout/VStack.vue'
import { title } from '@/data/title'
import setHeadMeta from '@/utils/setHeadMeta'
import Divider from '~/components/layout/Divider.vue'

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

interface SimpleTermsItem {
  title: string
  description: string
  icon: string
  color: string
}

const SimpleTermsItems: SimpleTermsItem[] = [
  {
    title: 'Be yourself',
    description: "Use your own account and don't impersonate others.",
    icon: 'solar:user-check-rounded-line-duotone',
    color: '#ff2365',
  },
  {
    title: 'Be respectful',
    description:
      'No harassment, threads, illegal content, or malicious activity.',
    icon: 'solar:hearts-line-duotone',
    color: '#ffde37',
  },
  {
    title: 'Your content is yours',
    description: 'You retain ownership and responsibility of what you publish.',
    icon: 'solar:shield-user-line-duotone',
    color: '#7c44ff',
  },
  {
    title: 'Things can change',
    description: 'Features may evolve, change, or become unavailable.',
    icon: 'solar:clock-circle-line-duotone',
    color: '#9e4560',
  },
  {
    title: 'Play fair',
    description: "Don't exploit, disrupt, or abuse Byg and Byg Infra.",
    icon: 'solar:star-2-line-duotone',
    color: '#656046',
  },
  {
    title: 'You can leave',
    description: 'Request permanent content deletion at hi@byg.gg.',
    icon: 'solar:trash-bin-minimalistic-line-duotone',
    color: '#544a6c',
  },
]
</script>

<template>
  <ContentArea class="bygTos" left-align hide-terms-link>
    <VStack class="fullWidth">
      <h3>Simple Terms</h3>
      <p class="disclaimer">
        This is a simplified overview of the terms, NOT legal advice.
      </p>

      <div class="termsGrid">
        <VStack
          v-for="item in SimpleTermsItems"
          class="termsItem background"
          :style="{ '--tint': item.color }"
        >
          <Icon :name="item.icon" class="termsIcon" />

          <VStack class="noSpace">
            <h4>{{ item.title }}</h4>
            <p>{{ item.description }}</p>
          </VStack>
        </VStack>
      </div>

      <h4>Byg and Privacy</h4>
      <p>Byg and certain third parties have access to user data.</p>
      <p>This includes, but is not limited to,</p>
      <ul>
        <li>Emails</li>
        <li>Usernames</li>
        <li>Content you post</li>
        <li>IP Addresses</li>
      </ul>
    </VStack>

    <Divider />

    <h3>Full Terms</h3>
    <VStack class="noSpace">
      <span v-html="tosHtml" />
    </VStack>
  </ContentArea>
</template>

<style scoped lang="sass">
@use "@/styles/utils"

.disclaimer
  font-size: 75%
  opacity: 0.5

.termsGrid
  display: grid
  width: 100%
  grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr))
  gap: 0.5rem
  align-items: stretch

  .termsItem
    @include utils.glowEffect

    position: relative
    padding: 0.75rem
    gap: 0 !important
    border-radius: 1.25rem
    justify-content: space-between

    h4
      margin: 0

    .termsIcon
      width: 2rem
      height: 2rem
      margin-block-end: 1rem

  .termsItem::before
    border-radius: 1.25rem
    background: var(--tint)
    opacity: 0.2
</style>

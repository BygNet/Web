<script setup lang="ts">
import type { NuxtError } from '#app'
import { useHead } from '#imports'
import ContentArea from '~/components/layout/ContentArea.vue'
import VStack from '~/components/layout/VStack.vue'
import { title } from '~/data/title.ts'
import Default from '~/layouts/default.vue'

const props = defineProps<{
  error: NuxtError
}>()

const { t } = useI18n()

useHead(() => ({
  htmlAttrs: {
    class: 'dark',
  },
}))

title.value = String(props.error.status)
</script>

<template>
  <Default>
    <ContentArea>
      <VStack class="errorContent">
        <h1>{{ error.message }}</h1>

        <NuxtLink to="/" @click="clearError({ redirect: '/' })">
          <button class="prominent">
            <Icon name="solar:home-angle-line-duotone" />
            {{ t('common.home') }}
          </button>
        </NuxtLink>
      </VStack>
    </ContentArea>
  </Default>
</template>

<style scoped lang="sass">
.errorContent
  width: 100%
</style>

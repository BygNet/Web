<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import { useI18n } from 'vue-i18n'

  import ContentArea from '@/components/layout/ContentArea.vue'
  import HStack from '@/components/layout/HStack.vue'
  import { title } from '@/data/title'
  import SafeLink from '@/components/base/SafeLink.vue'

  const { t } = useI18n()
  title.value = t('ui.afterLogin.title')
</script>

<template>
  <ContentArea class="afterLogin">
    <section>
      <img src="/logos/BygLogo.png" alt="Byg Logo" class="logo" />

      <h1>{{ t('ui.afterLogin.heading') }}</h1>
      <p>{{ t('ui.afterLogin.description') }}</p>
    </section>

    <section>
      <h2>{{ t('ui.afterLogin.ctaTitle') }}</h2>
      <p>{{ t('ui.afterLogin.ctaDescription') }}</p>

      <HStack>
        <SafeLink to="/">
          <button>
            <Icon icon="solar:rocket-line-duotone" />
            {{ t('ui.afterLogin.getStarted') }}
          </button>
        </SafeLink>

        <SafeLink to="/pages/my-space">
          <button class="prominent">
            <Icon icon="solar:settings-line-duotone" />
            {{ t('ui.afterLogin.customizeProfile') }}
          </button>
        </SafeLink>
      </HStack>
    </section>
  </ContentArea>
</template>

<style scoped lang="sass">
  :deep(.afterLogin)
    gap: 1.5rem

  section
    display: flex
    flex-direction: column
    gap: 0.5rem
    align-items: center
    justify-content: center
    text-align: center

    .logo
      width: 10rem
      height: 10rem
</style>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  import { signup } from '@/auth/signup'
  import SafeLink from '@/components/base/SafeLink.vue'
  import ContentArea from '@/components/layout/ContentArea.vue'
  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import { title } from '@/data/title'
  import { navigateTo } from '#app'

  definePageMeta({ showBackButton: true })

  const localePath = useLocalePath()
  const { t } = useI18n()

  title.value = t('auth.signup')
  const email = ref('')
  const username = ref('')
  const password = ref('')
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function submit() {
    error.value = null
    loading.value = true

    try {
      await signup(email.value, username.value, password.value)
      await navigateTo(localePath('/'))
    } catch {
      error.value = t('auth.signupPage.signupFailed')
    } finally {
      loading.value = false
    }
  }
</script>

<template>
  <ContentArea class="signup">
    <HStack class="loginItems">
      <form @submit.prevent="submit" class="loginForm">
        <label>
          {{ t('auth.email') }}
          <input v-model="email" type="email" autocomplete="email" required />
        </label>

        <label>
          {{ t('auth.username') }}
          <input
            v-model="username"
            type="text"
            autocomplete="username"
            required
          />
        </label>

        <label>
          {{ t('auth.password') }}
          <input
            v-model="password"
            type="password"
            autocomplete="new-password"
            required
          />
        </label>

        <button type="submit" :disabled="loading">
          <Icon name="solar:user-plus-line-duotone" />
          {{
            loading ? t('auth.signupPage.creatingAccount') : t('auth.signup')
          }}
        </button>

        <p v-if="error" class="error">
          {{ error }}
        </p>
      </form>

      <VStack class="accountSide">
        <h2>{{ t('auth.signupPage.sideTitle') }}</h2>
        <p>{{ t('auth.signupPage.sideMessage') }}</p>

        <ul>
          <li>{{ t('auth.signupPage.sideItemPost') }}</li>
          <li>{{ t('auth.signupPage.sideItemUpload') }}</li>
          <li>{{ t('auth.signupPage.sideItemLinks') }}</li>
        </ul>

        <p>{{ t('auth.signupPage.sideMore') }}</p>
      </VStack>
    </HStack>

    <h3 class="centerText">
      {{ t('auth.alreadyHaveAccount') }}
      <SafeLink class="prominentLink" to="/login">
        {{ t('auth.login') }}
      </SafeLink>
    </h3>
  </ContentArea>
</template>

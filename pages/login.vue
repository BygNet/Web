<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import { ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  import { login } from '@/auth/login'
  import SafeLink from '@/components/base/SafeLink.vue'
  import ContentArea from '@/components/layout/ContentArea.vue'
  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import { taskList } from '@/data/tasks'
  import { title } from '@/data/title'
  import { navigateTo } from '#app'

  definePageMeta({ showBackButton: true })

  const localePath = useLocalePath()
  const { t } = useI18n()

  title.value = t('auth.login')
  const email = ref('')
  const password = ref('')
  const twoFactorCode = ref('')
  const loading = ref(false)
  const error = ref<string | null>(null)
  const requiresTwoFactor = ref(false)

  async function submit() {
    error.value = null
    loading.value = true
    taskList.value.push('login')

    try {
      const result = await login(
        email.value,
        password.value,
        requiresTwoFactor.value ? twoFactorCode.value : undefined
      )

      if (result === 'two-factor-required') {
        requiresTwoFactor.value = true
        error.value = t('auth.loginPage.twoFactorPrompt')
        return
      }

      await navigateTo(localePath('/'))
    } catch {
      error.value = requiresTwoFactor.value
        ? t('auth.loginPage.invalidTwoFactor')
        : t('auth.invalidCredentials')
    } finally {
      loading.value = false
      taskList.value.remove('login')
    }
  }
</script>

<template>
  <ContentArea class="login">
    <HStack class="loginItems">
      <form @submit.prevent="submit" class="loginForm">
        <VStack class="loginFormItems">
          <label>
            {{ t('auth.email') }}
            <input v-model="email" type="email" autocomplete="email" required />
          </label>

          <label>
            {{ t('auth.password') }}
            <input
              v-model="password"
              type="password"
              autocomplete="current-password"
              required
            />
          </label>

          <label v-if="requiresTwoFactor">
            {{ t('auth.loginPage.twoFactorCode') }}
            <input
              v-model="twoFactorCode"
              type="text"
              inputmode="numeric"
              autocomplete="one-time-code"
              maxlength="6"
              required
            />
          </label>
        </VStack>

        <VStack class="loginFormItems">
          <button type="submit" :disabled="loading">
            <Icon icon="solar:login-2-line-duotone" />
            {{ loading ? t('auth.loginPage.loggingIn') : t('auth.login') }}
          </button>

          <p v-if="error" class="error">
            {{ error }}
          </p>
        </VStack>
      </form>

      <VStack class="accountSide">
        <h2>{{ t('auth.loginPage.sideTitle') }}</h2>
        <p>{{ t('auth.loginPage.sideMessage') }}</p>
        <ul>
          <li>
            {{ t('auth.loginPage.supportPrefix') }}
            <a href="mailto:ash@a35.dev" class="prominentLink">
              {{ t('auth.loginPage.supportLink') }} </a
            >.
          </li>
        </ul>

        <p>{{ t('auth.loginPage.thanks') }}</p>
      </VStack>
    </HStack>

    <h3 class="centerText">
      {{ t('auth.dontHaveAccount') }}
      <SafeLink class="prominentLink" to="/signup">
        {{ t('auth.loginPage.createAccountLink') }}
      </SafeLink>
    </h3>
  </ContentArea>
</template>

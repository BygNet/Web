<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import { ref } from 'vue'

  import { login } from '@/auth/login'
  import ContentArea from '@/components/layout/ContentArea.vue'
  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import { taskList } from '@/data/tasks.ts'
  import { title } from '@/data/title.ts'
  import { navigateTo } from '#app'

  title.value = 'Login'
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
        error.value = 'Enter your authenticator app code to continue'
        return
      }

      await navigateTo({ name: 'after-login' })
    } catch {
      error.value = requiresTwoFactor.value
        ? 'Invalid authenticator code'
        : 'Invalid email or password'
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
            Email
            <input v-model="email" type="email" autocomplete="email" required />
          </label>

          <label>
            Password
            <input
              v-model="password"
              type="password"
              autocomplete="current-password"
              required
            />
          </label>

          <label v-if="requiresTwoFactor">
            Authenticator Code
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
            {{ loading ? 'Logging In…' : 'Log In' }}
          </button>

          <p v-if="error" class="error">
            {{ error }}
          </p>
        </VStack>
      </form>

      <VStack class="accountSide">
        <h2>Return to Byg.</h2>
        <p>We're happy to see you again!</p>
        <ul>
          <li>
            Facing issues?
            <a href="mailto:ash@a35.dev" class="prominentLink">Email us</a>.
          </li>
        </ul>

        <p>Thank you!</p>
      </VStack>
    </HStack>

    <h3 class="centerText">
      Don't have an account?
      <RouterLink class="prominentLink" to="/signup">Create one</RouterLink>
    </h3>
  </ContentArea>
</template>

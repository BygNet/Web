<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'

  import { login } from '@/auth/login'
  import ContentArea from '@/components/layout/ContentArea.vue'
  import VStack from '@/components/layout/VStack.vue'
  import { title } from '@/data/title.ts'

  title.value = 'Login'
  const router = useRouter()
  const email = ref('')
  const password = ref('')
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function submit() {
    error.value = null
    loading.value = true

    try {
      await login(email.value, password.value)
      await router.push({ name: 'profile' })
    } catch {
      error.value = 'Invalid email or password'
    } finally {
      loading.value = false
    }
  }
</script>

<template>
  <ContentArea class="login">
    <div class="loginItems">
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
    </div>

    <h3>
      Don't have an account?
      <RouterLink class="prominentLink" to="/signup">Create one</RouterLink>
    </h3>
  </ContentArea>
</template>

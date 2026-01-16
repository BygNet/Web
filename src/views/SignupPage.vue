<script setup lang="ts">
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'

  import { signup } from '@/auth/signup'
  import ContentArea from '@/components/layout/ContentArea.vue'
  import VStack from '@/components/layout/VStack.vue'
  import { title } from '@/data/title.ts'

  title.value = 'Signup'
  const router = useRouter()
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
      await router.push({ name: 'profile' })
    } catch {
      error.value = 'Signup failed'
    } finally {
      loading.value = false
    }
  }
</script>

<template>
  <ContentArea class="signup">
    <div class="loginItems">
      <form @submit.prevent="submit" class="loginForm">
        <label>
          Email
          <input v-model="email" type="email" autocomplete="email" required />
        </label>

        <label>
          Username
          <input
            v-model="username"
            type="text"
            autocomplete="username"
            required
          />
        </label>

        <label>
          Password
          <input
            v-model="password"
            type="password"
            autocomplete="new-password"
            required
          />
        </label>

        <button type="submit" :disabled="loading">
          {{ loading ? 'Creating account…' : 'Sign up' }}
        </button>

        <p v-if="error" class="error">
          {{ error }}
        </p>
      </form>

      <VStack class="accountSide">
        <h2>Your Byg account.</h2>
        <p>With your account, you can:</p>

        <ul>
          <li>Post content</li>
          <li>Upload images</li>
          <li>Create link lists</li>
        </ul>

        <p>and much more!</p>
      </VStack>
    </div>
  </ContentArea>
</template>

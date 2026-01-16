<script setup lang="ts">
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'

  import { signup } from '@/auth/signup'

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
  <div class="signup">
    <h1>Create account</h1>

    <form @submit.prevent="submit">
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
  </div>
</template>

<style scoped lang="sass">
  .signup
    max-width: 420px
    margin: 4rem auto
    padding: 2rem
    display: flex
    flex-direction: column
    gap: 1.5rem

  h1
    text-align: center

  form
    display: flex
    flex-direction: column
    gap: 1rem

  label
    display: flex
    flex-direction: column
    gap: 0.25rem

  input
    padding: 0.5rem
    font-size: 1rem

  button
    padding: 0.6rem
    font-size: 1rem
    cursor: pointer

  .error
    color: red
    text-align: center
</style>

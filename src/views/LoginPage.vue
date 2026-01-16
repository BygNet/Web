<script setup lang="ts">
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'

  import { login } from '@/auth/login'

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
  <div class="login">
    <h1>Login</h1>

    <form @submit.prevent="submit">
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

      <button type="submit" :disabled="loading">
        {{ loading ? 'Logging in…' : 'Login' }}
      </button>

      <p v-if="error" class="error">
        {{ error }}
      </p>
    </form>
  </div>
</template>

<style scoped lang="sass">
  .login
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

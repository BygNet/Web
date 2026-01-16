<script setup lang="ts">
  import { computed } from 'vue'
  import { useRouter } from 'vue-router'

  import { logout } from '@/auth/logout'
  import { auth } from '@/auth/session'

  const router = useRouter()

  const isLoggedIn = computed(() => !!auth.user)

  async function doLogout() {
    await logout()
    await router.push({ name: 'social' })
  }

  function goLogin() {
    router.push({ name: 'login' })
  }

  function goSignup() {
    router.push({ name: 'signup' })
  }
</script>

<template>
  <div class="profile">
    <h1>Profile</h1>

    <!-- Logged out -->
    <div v-if="!isLoggedIn" class="guest">
      <p>You are not logged in.</p>

      <div class="actions">
        <button @click="goLogin">Log in</button>
        <button @click="goSignup">Sign up</button>
      </div>
    </div>

    <!-- Logged in -->
    <div v-else class="user">
      <p><strong>ID:</strong> {{ auth.user!.id }}</p>
      <p><strong>Email:</strong> {{ auth.user!.email }}</p>
      <p><strong>Username:</strong> {{ auth.user!.username }}</p>

      <button class="logout" @click="doLogout">Log out</button>
    </div>
  </div>
</template>

<style scoped lang="sass">
  .profile
    max-width: 520px
    margin: 4rem auto
    padding: 2rem
    display: flex
    flex-direction: column
    gap: 1.5rem

  h1
    text-align: center

  .guest,
  .user
    display: flex
    flex-direction: column
    gap: 1rem
    align-items: center

  .actions
    display: flex
    gap: 1rem

  button
    padding: 0.6rem 1rem
    font-size: 1rem
    cursor: pointer

  .logout
    margin-top: 1rem
</style>

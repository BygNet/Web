<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import { computed } from 'vue'
  import { useRouter } from 'vue-router'

  import { logout } from '@/auth/logout'
  import { auth } from '@/auth/session'
  import ContentArea from '@/components/layout/ContentArea.vue'
  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import { title } from '@/data/title.ts'
  import setHeadMeta from '@/utils/setHeadMeta.ts'

  title.value = 'Profile'
  setHeadMeta({ page: 'Profile', subtitle: 'Your Byg profile.' })
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
  <ContentArea class="bygProfile">
    <!-- Logged out -->
    <VStack v-if="!isLoggedIn" class="guest">
      <h2>Welcome to Byg!</h2>
      <p>You are not logged in.</p>

      <HStack class="accountActions">
        <button @click="goLogin">
          <Icon icon="solar:login-2-line-duotone" />
          Log in
        </button>
        <button @click="goSignup">
          <Icon icon="solar:user-plus-line-duotone" />
          Sign up
        </button>
      </HStack>
    </VStack>

    <!-- Logged in -->
    <VStack v-else class="user">
      <h2>Hey!</h2>
      <p><strong>User #:</strong> {{ auth.user!.id }}</p>
      <p><strong>Email:</strong> {{ auth.user!.email }}</p>
      <p><strong>Username:</strong> {{ auth.user!.username }}</p>

      <button class="logout" @click="doLogout">
        <Icon icon="solar:logout-2-line-duotone" />
        Log out
      </button>
    </VStack>
  </ContentArea>
</template>

<style scoped lang="sass">
  @use "@/styles/utils"

  .guest, .user
    @include utils.maxPostPaddedWidth
    @include utils.itemBackground

  .logout
    margin-top: 1rem
</style>

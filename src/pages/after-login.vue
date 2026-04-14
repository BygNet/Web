<script setup lang="ts">
  import { Icon } from '@iconify/vue'

  import ContentArea from '@/components/layout/ContentArea.vue'
  import HStack from '@/components/layout/HStack.vue'
  import { title } from '@/data/title.ts'

  title.value = 'Welcome!'
</script>

<template>
  <ContentArea class="afterLogin">
    <section>
      <img src="/logos/BygLogo.png" alt="Byg Logo" class="logo" />

      <h1>Welcome to Byg!</h1>
      <p>Browse posts, send messages, and search the web freely with Byg.</p>
    </section>

    <section>
      <h2>Let's go!</h2>
      <p>Customize your profile, or start immediately.</p>

      <HStack>
        <RouterLink to="/">
          <button>
            <Icon icon="solar:rocket-line-duotone" />
            Get Started
          </button>
        </RouterLink>

        <RouterLink to="/me">
          <button class="prominent">
            <Icon icon="solar:settings-line-duotone" />
            Customize Profile
          </button>
        </RouterLink>
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

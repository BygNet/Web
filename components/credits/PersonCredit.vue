<script setup lang="ts">
  import { Icon } from '@iconify/vue'

  import UsernameView from '@/components/posts/UsernameView.vue'

  defineProps<{
    avatarUrl?: string
    name: string
    role: string
    bygUsername?: string
    homepage?: string
  }>()
</script>

<template>
  <div class="personCredit">
    <div class="avatar">
      <img v-if="avatarUrl" :src="avatarUrl" :alt="name" />

      <div class="placeholder" v-else>
        <Icon icon="solar:user-rounded-line-duotone" />
      </div>
    </div>

    <h5>{{ name }}</h5>
    <UsernameView v-if="bygUsername" :name="bygUsername" minimal />
    <a v-if="homepage" :href="homepage" target="_blank">
      <button class="link">
        <Icon icon="solar:link-minimalistic-2-line-duotone" />
        Homepage
      </button>
    </a>
    <p>{{ role }}</p>
  </div>
</template>

<style scoped lang="sass">
  @use "@/styles/themes"

  .personCredit
    justify-content: flex-start
    height: 100%

    .avatar
      border-radius: 50%
      overflow: hidden

      img, .placeholder
        width: 6rem
        height: 6rem
        background: themes.$foregroundColor
        justify-content: center

        svg
          width: 3rem
          height: 3rem

    .link
      margin: 0.25rem 0
      padding: 0.2rem 0.5rem
      gap: 0.1rem
</style>

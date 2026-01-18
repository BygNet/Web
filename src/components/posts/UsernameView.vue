<script setup lang="ts">
  import { onMounted, type Ref,ref } from 'vue'
  import {Icon} from "@iconify/vue";

  import HStack from '@/components/layout/HStack.vue'
  import { OfficialUsers } from '@/data/users.ts'

  const props = defineProps<{
    name: string
    verified?: boolean
  }>()

  const isOfficial: Ref<boolean> = ref(false)

  onMounted(() => {
    isOfficial.value = OfficialUsers.includes(props.name)
  })
</script>

<template>
  <HStack class="userName">
    <p>
      <span class="at">@</span>
      <span class="name">{{ name }}</span>
    </p>

    <!-- Authenticity badges -->
    <HStack class="badge staff" v-if="isOfficial">
      <Icon icon="solar:shield-check-line-duotone" />
      Official
    </HStack>

    <HStack class="badge verified" v-if="verified">
      <Icon icon="solar:verified-check-line-duotone" />
    </HStack>
  </HStack>
</template>

<style scoped lang="sass">
  @use "@/styles/colors"

  .userName
    gap: 0.25rem

    .at
      opacity: 0.5

    .badge
      gap: 0
      background: colors.$accentColor

      &.staff
        padding: 0.15rem 0.35rem
      &.verified
        padding: 0.35rem

      svg
        width: 1rem
        height: 1rem
</style>

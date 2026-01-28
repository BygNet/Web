<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import { onMounted, type Ref, ref } from 'vue'

  import HStack from '@/components/layout/HStack.vue'
  import { StaffUsers } from '@/data/users.ts'

  const props = defineProps<{
    name: string
    verified?: boolean
  }>()

  const isStaff: Ref<boolean> = ref(false)

  onMounted(() => {
    isStaff.value = StaffUsers.includes(props.name)
  })
</script>

<template>
  <HStack class="userName">
    <p>
      <span class="at">@</span>
      <span class="name">{{ name }}</span>
    </p>

    <!-- Authenticity badges -->
    <HStack class="badge staff" v-if="isStaff">
      <Icon icon="solar:shield-check-line-duotone" />
      Staff
    </HStack>

    <HStack class="badge verified" v-if="verified">
      <Icon icon="solar:verified-check-line-duotone" />
    </HStack>
  </HStack>
</template>

<style scoped lang="sass">
  @use "@/styles/themes"

  .userName
    gap: 0.25rem

    .at
      opacity: 0.5

    .badge
      gap: 0
      background: themes.$accentColor

      &.staff
        padding: 0.15rem 0.35rem
      &.verified
        padding: 0.35rem

      svg
        width: 1rem
        height: 1rem
</style>

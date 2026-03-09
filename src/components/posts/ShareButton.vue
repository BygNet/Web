<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import { onMounted, type Ref, ref } from 'vue'

  import { openShareModal } from '@/data/share'
  import type { BygShareableContent } from '@/types/messages'
  import { formatNumber, formatStat } from '@/utils/formatters.ts'

  const props = defineProps<{
    shares: number
    shareItem: BygShareableContent
    compact?: boolean
  }>()

  const shareCount: Ref<number> = ref(0)

  onMounted(() => {
    shareCount.value = props.shares
  })

  function share(): void {
    openShareModal(props.shareItem, {
      onShared: () => {
        shareCount.value++
      },
    })
  }
</script>

<template>
  <button class="shareButton" @click="share">
    <Icon icon="solar:share-line-duotone" />
    {{ compact ? formatStat(shareCount) : formatNumber(shareCount) }}
  </button>
</template>

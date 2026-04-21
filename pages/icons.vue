<script setup lang="ts">
  import { type Ref, ref } from 'vue'
  import ContentArea from "~/components/layout/ContentArea.vue";
  import { icons } from "@iconify-json/solar";
  import HStack from "~/components/layout/HStack.vue";
  import type {IconifyIcon} from "@iconify/types";

  const selectedIcon: Ref<IconifyIcon | undefined> = ref(undefined)
  const selectedIconName: Ref<string | undefined> = ref(undefined)

  function selectIcon(icon: IconifyIcon, name: string): void {
    selectedIcon.value = icon
    selectedIconName.value = name
  }
</script>

<template>
  <ContentArea class="bygIconViewer">
    <HStack v-if="selectedIcon" class="iconViewer">
      <svg width="24" height="24" viewBox="0 0 24 24" class="iconPreview" v-html="selectedIcon.body" />
      <p>{{ selectedIconName }}</p>
    </HStack>

    <HStack class="bygIconGrid">
      <div v-for="(icon, key) in icons.icons" class="iconContainer" @click="selectIcon(icon, key as string)">
        <svg width="24" height="24" viewBox="0 0 24 24" class="icon" v-html="icon.body" />
      </div>
    </HStack>
  </ContentArea>
</template>

<style scoped lang="sass">
  @use "@/styles/themes"

  .bygIconViewer
    .bygIconGrid
      display: grid
      grid-template-columns: repeat(auto-fill, 4rem)
      width: 100%
      height: calc(100vh - 5rem - 6rem - 4rem)
      overflow: scroll
      margin-top: 6rem

      .iconContainer
        padding: 0.5rem
        cursor: pointer

        &:hover
          background: themes.$foregroundColor

        .icon
          width: 3rem
          height: 3rem

    .iconViewer
      position: absolute
      top: 0
      left: 0
      right: 0
      margin: auto
      background: themes.$foregroundColor
      max-width: 45rem
      padding: 0.5rem

      p
        user-select: all
        -webkit-user-select: all

      .iconPreview
        width: 4rem
        height: 4rem
</style>

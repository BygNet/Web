<script setup lang="ts">

import HStack from "@/components/layout/HStack.vue";
import {setFlag} from "@/utils/setUserFlag.ts";

const emit = defineEmits(['close'])

function close() {
  setFlag('showCookieBanner', false)
  emit('close')
}
</script>

<template>
    <div class="cookieBanner">
      <h2>We wanted to give you cookies, but...</h2>

      <p>We had some cookies in the jar for you, but ashie ate them all.</p>
      <p>There's still one left, but that's just there to keep you logged in.</p>
      <p>Wanna try out private search too? Check out <RouterLink to="/search" class="prominentLink">Byg Search</RouterLink>.</p>

      <HStack class="fullWidth autoSpace actions">
        <button class="transparent" @click="close()">Damn</button>
        <button class="prominent" @click="close()">Aww, okay</button>
      </HStack>
    </div>
</template>

<style scoped lang="sass">
  @use "@/styles/themes"

  .cookieBanner
    position: fixed
    left: 0
    right: 0
    bottom: env(safe-area-inset-bottom, 0)
    background: themes.$foregroundOpaque
    border-radius: 0
    align-items: flex-start
    padding: 1.5rem
    animation: cookiesSlideIn 1s ease-in-out
    gap: 0.75rem

    .actions
      margin-top: 1rem

    @keyframes cookiesSlideIn
      from
        transform: translateY(100%)
      to
        transform: translateY(0)
</style>
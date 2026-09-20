<script setup lang="ts">
  import type { BygPost } from '@bygnet/types'

  const props = defineProps<{
    post: BygPost
  }>()

  const content = props.post.content?.replace(/\n{2,}/g, '\n\n')
</script>

<template>
  <div class="container">
    <img src="/logos/BygLogo.png" class="bygLogo" />

    <p class="info">@{{ post.author }} • {{ formatDate(post.createdDate) }}</p>
    <h1 class="title">{{ post.title }}</h1>

    <p v-if="content" class="content">
      {{ content }}
    </p>

    <div class="statsBar">
      <div class="likes stat">
        <img class="icon" src="/icons/heart.png" />
        <span class="count">{{ post.likes }}</span>
      </div>

      <div class="shares stat">
        <img class="icon" src="/icons/share.png" />
        <span class="count">{{ post.shares }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    position: relative;
    padding: 60px;
    background: #170023;
    color: #dad8db;
    font-family: 'Wix Madefor Text', 'Inter', sans-serif;
  }

  .bygLogo {
    position: absolute;
    top: 60px;
    right: 60px;
    z-index: 10;
    width: 52px;
    height: 52px;
  }

  .info {
    font-size: 36px;
    opacity: 0.6;
    margin-bottom: 12px;
  }

  .title {
    font-size: 72px;
    font-weight: bold;
    margin: 0 0 24px;
    line-height: 1.1;
    text-align: center;
    text-wrap: balance;
  }

  .content {
    font-size: 48px;
    opacity: 0.9;
    margin-top: 16px;
    text-align: start;
    white-space: pre-wrap;
    word-break: break-word;
    overflow-wrap: anywhere;
  }

  .statsBar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 24px;
    padding: 60px;
    background: linear-gradient(to top, #170023, transparent);
  }

  .stat {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 24px;
    background: #4a3e50;
    flex: none;
    border-radius: 100px;
  }

  .icon {
    width: 64px;
    height: 64px;
  }

  .count {
    display: flex;
    font-size: 36px;
  }
</style>

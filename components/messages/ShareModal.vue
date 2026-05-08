<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import { computed, onMounted, type Ref, ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  import { api } from '@/api/client'
  import { auth } from '@/auth/session'
  import HStack from '@/components/layout/HStack.vue'
  import Modal from '@/components/layout/Modal.vue'
  import VStack from '@/components/layout/VStack.vue'
  import { fetchMessageShareTargets, sendMessage } from '@/data/messages'
  import {
    activeShareRequest,
    closeShareModal,
    notifyShareCompleted,
    showingShareModal,
  } from '@/data/share'
  import type { BygMessageShareTarget } from '@/types/messages'
  import { navigateTo } from '#app'

  const localePath = useLocalePath()
  const { t } = useI18n()

  const loadingTargets: Ref<boolean> = ref(false)
  const sendingUserId: Ref<number | null> = ref(null)
  const targets: Ref<BygMessageShareTarget[]> = ref([])
  const statusMessage: Ref<string | null> = ref(null)

  const shareItem = computed(() => activeShareRequest.value?.item ?? null)

  async function loadShareTargets(): Promise<void> {
    if (!auth.user) {
      targets.value = []
      return
    }

    loadingTargets.value = true
    try {
      targets.value = await fetchMessageShareTargets({
        force: true,
      })
    } finally {
      loadingTargets.value = false
    }
  }

  async function shareUsingSystemSheet(): Promise<void> {
    if (!shareItem.value) return

    statusMessage.value = null

    try {
      const response = await api(
        `${shareItem.value.shareApiPath}/${shareItem.value.id}`
      )
      if (!response.ok) {
        statusMessage.value = t('ui.share.statusFailedShareLink')
        return
      }

      const shareUrl = await response.text()

      if (navigator.share) {
        await navigator.share({
          url: shareUrl,
        })
      } else {
        await navigator.clipboard.writeText(shareUrl)
        statusMessage.value = t('ui.share.statusLinkCopied')
      }

      notifyShareCompleted()
      closeShareModal()
    } catch {
      statusMessage.value = t('ui.share.statusUnableShareSheet')
    }
  }

  async function sendShareToTarget(
    target: BygMessageShareTarget
  ): Promise<void> {
    if (!shareItem.value) return

    sendingUserId.value = target.userId
    statusMessage.value = null

    const payload =
      shareItem.value.type === 'post'
        ? {
            recipientId: target.userId,
            sharedPostId: shareItem.value.id,
          }
        : {
            recipientId: target.userId,
            sharedImageId: shareItem.value.id,
          }

    const sentMessage = await sendMessage(payload)
    sendingUserId.value = null

    if (!sentMessage) {
      statusMessage.value = t('ui.share.statusFailedSendToUser', {
        username: `@${target.username}`,
      })
      return
    }

    notifyShareCompleted()
    closeShareModal()
  }

  async function openLogin(): Promise<void> {
    closeShareModal()
    await navigateTo(localePath('login'))
  }

  onMounted(() => {
    loadShareTargets()
  })
</script>

<template>
  <Modal :visible="showingShareModal">
    <VStack class="shareModal">
      <HStack class="fullWidth autoSpace">
        <h2>{{ t('ui.share.title') }}</h2>
        <button @click="closeShareModal()">
          <Icon icon="mingcute:close-fill" />
        </button>
      </HStack>

      <VStack v-if="shareItem" class="shareItemPreview">
        <h3>{{ shareItem.title }}</h3>
        <p class="light">{{ t('ui.share.by') }} {{ shareItem.author }}</p>

        <img
          v-if="shareItem.type === 'image' && shareItem.imageUrl"
          :src="shareItem.imageUrl"
          :alt="shareItem.title"
        />
        <p v-else-if="shareItem.content" class="sharedContentPreview">
          {{ shareItem.content }}
        </p>
      </VStack>

      <button class="fullWidth" @click="shareUsingSystemSheet">
        <Icon icon="solar:share-line-duotone" />
        {{ t('ui.share.shareToOtherApps') }}
      </button>

      <VStack class="targetsSection fullWidth">
        <HStack class="fullWidth autoSpace">
          <h3>{{ t('ui.share.sendInChat') }}</h3>
          <button @click="loadShareTargets">
            <Icon icon="solar:refresh-line-duotone" />
          </button>
        </HStack>

        <VStack v-if="!auth.user" class="fullWidth emptyTargets">
          <p class="light">{{ t('ui.share.loginPrompt') }}</p>
          <button class="prominent" @click="openLogin">
            <Icon icon="solar:login-2-line-duotone" />
            {{ t('ui.share.loginButton') }}
          </button>
        </VStack>

        <p v-else-if="loadingTargets" class="light">
          {{ t('ui.share.loadingContacts') }}
        </p>

        <p v-else-if="targets.length < 1" class="light">
          {{ t('ui.share.noContacts') }}
        </p>

        <template v-else>
          <button
            v-for="target in targets"
            :key="target.userId"
            class="targetButton fullWidth"
            :disabled="sendingUserId === target.userId"
            @click="sendShareToTarget(target)"
          >
            <HStack class="fullWidth autoSpace">
              <HStack class="targetMain">
                <img
                  v-if="target.avatarUrl"
                  :src="target.avatarUrl"
                  :alt="t('ui.share.avatarAlt', { username: target.username })"
                />
                <Icon
                  v-else
                  class="targetAvatarFallback"
                  icon="solar:user-circle-line-duotone"
                />

                <VStack class="targetInfo noSpace">
                  <p>@{{ target.username }}</p>
                  <p class="light">
                    {{
                      target.source === 'recent'
                        ? t('ui.share.recentlyMessaged')
                        : t('ui.share.following')
                    }}
                  </p>
                </VStack>
              </HStack>

              <HStack class="targetMeta noSpace">
                <Icon
                  v-if="target.subscriptionState !== 'free'"
                  icon="solar:crown-star-line-duotone"
                />
                <Icon icon="solar:plain-line-duotone" />
              </HStack>
            </HStack>
          </button>
        </template>
      </VStack>

      <p class="light" v-if="statusMessage">
        {{ statusMessage }}
      </p>
    </VStack>
  </Modal>
</template>

<style scoped lang="sass">
  @use "@/styles/utils"

  .shareModal
    @include utils.itemBackground
    width: 24rem
    max-width: calc(100vw - 1rem)
    padding: 1rem
    border-radius: 2rem
    align-items: flex-start
    gap: 0.75rem

  .shareItemPreview
    align-items: flex-start
    gap: 0

    img
      width: 100%
      border-radius: 0.75rem
      margin-top: 0.5rem

    .sharedContentPreview
      width: 100%
      max-height: 5rem
      overflow: hidden
      opacity: 0.9

  .targetsSection
    align-items: flex-start
    gap: 0.4rem

  .emptyTargets
    align-items: flex-start

  .targetButton
    justify-content: flex-start
    padding: 0.5rem 0.6rem

    .targetMain
      align-items: center

      img, .targetAvatarFallback
        width: 1.35rem
        height: 1.35rem
        border-radius: 50%

      .targetInfo
        align-items: flex-start
        gap: 0

    .targetMeta
      align-items: center
</style>

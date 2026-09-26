<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import SettingsGroup from '@/components/settings/SettingsGroup.vue'
  import {
    type BygSession,
    fetchSessions,
    revokeSession,
    setSessionExpiry,
  } from '@/data/sessions'

  const sessions = ref<BygSession[]>([])
  const loading = ref(true)
  const busy = ref<string | null>(null)
  const { t } = useI18n()

  function countryFlag(code: string | null): string {
    if (!code || code.length !== 2) return 'solar:global-line-duotone'
    return `circle-flags:${code.toLowerCase()}`
  }

  function sessionDate(value: string): string {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value))
  }

  async function refresh(): Promise<void> {
    loading.value = true
    sessions.value = await fetchSessions()
    loading.value = false
  }

  async function toggleExpiry(session: BygSession): Promise<void> {
    busy.value = session.id
    await setSessionExpiry(session, session.expiresAt !== null)
    busy.value = null
  }

  async function remove(session: BygSession): Promise<void> {
    busy.value = session.id
    const removed = await revokeSession(session)
    if (removed)
      sessions.value = sessions.value.filter(item => item.id !== session.id)
    busy.value = null
  }

  onMounted(refresh)
</script>

<template>
  <SettingsGroup title="ui.settings.sessions.title">
    <p class="light">
      {{ t('ui.settings.sessions.description') }}
    </p>

    <VStack v-if="loading" class="sessionsList">
      <p>{{ t('ui.settings.sessions.loading') }}</p>
    </VStack>

    <VStack v-else class="sessionsList">
      <VStack v-for="session in sessions" :key="session.id" class="sessionItem">
        <HStack class="fullWidth autoSpace sessionHeader">
          <HStack>
            <Icon
              :name="countryFlag(session.countryCode)"
              class="sessionFlag"
            />

            <strong>
              {{
                session.deviceLabel || t('ui.settings.sessionsUnknownDevice')
              }}
            </strong>

            <span v-if="session.current" class="currentPill">
              {{ t('ui.settings.sessions.thisDevice') }}
            </span>
          </HStack>
        </HStack>

        <p class="light">
          {{ session.countryName || t('ui.settings.sessions.unknownCountry') }}
          <span v-if="session.ipAddress"> · {{ session.ipAddress }}</span>
          ·
          {{
            t('ui.settings.sessions.lastUsed', {
              date: sessionDate(session.lastUsedAt),
            })
          }}
        </p>

        <HStack class="fullWidth autoSpace sessionExpiry">
          <span
            >{{
              session.expiresAt
                ? t('ui.settings.sessions.expires', {
                    date: sessionDate(session.expiresAt),
                  })
                : t('ui.settings.sessions.neverExpires')
            }}
          </span>
        </HStack>

        <HStack class="fullWidth autoSpace actions">
          <button @click="remove(session)" :disabled="busy === session.id">
            <Icon name="solar:trash-bin-minimalistic-line-duotone" />
            {{ t('ui.settings.sessions.remove') }}
          </button>

          <button
            @click="toggleExpiry(session)"
            :disabled="busy === session.id"
            class="prominent"
          >
            <Icon name="solar:clock-circle-line-duotone" />
            {{
              session.expiresAt
                ? t('ui.settings.sessions.disableExpiry')
                : t('ui.settings.sessions.enableExpiry')
            }}
          </button>
        </HStack>
      </VStack>
    </VStack>
  </SettingsGroup>
</template>

<style scoped lang="sass">
  @use '@/styles/utils'

  .sessionsList
    width: 100%

  .sessionItem
    width: 100%
    gap: 0.35rem
    border-radius: 0

    &:not(:last-child)
      @include utils.listItemBorder
      padding-bottom: 0.75rem
      margin-bottom: 0.5rem


  .sessionHeader, .sessionExpiry
    gap: 0.5rem

  .sessionFlag
    font-size: 1.35rem

  .currentPill
    padding: 0.2rem 0.45rem
    border-radius: 1rem
    background: var(--accentColor)
    font-size: 0.75rem
</style>

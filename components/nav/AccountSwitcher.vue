<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import { computed, ref } from 'vue'

  import { logout } from '@/auth/logout'
  import { auth, removeAccount, setActiveAccount } from '@/auth/session'
  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import UsernameView from '@/components/posts/UsernameView.vue'

  const localePath = useLocalePath()

  const props = defineProps<{
    variant?: 'sidebar' | 'profile'
  }>()

  const showingAccounts = ref(false)

  const accounts = computed(() => {
    return [ ...auth.accounts ].sort((a, b) => b.lastUsed - a.lastUsed)
  })

  const activeAccount = computed(() => {
    if (auth.activeAccountId === null) return null
    return (
      accounts.value.find(account => account.id === auth.activeAccountId) ??
      null
    )
  })

  const isExpanded = computed(() => {
    return props.variant === 'profile' ? true : showingAccounts.value
  })

  function toggleExpanded(): void {
    if (props.variant === 'profile') return
    showingAccounts.value = !showingAccounts.value
  }

  async function switchAccount(accountId: number): Promise<void> {
    if (auth.activeAccountId === accountId) return
    setActiveAccount(accountId)
    showingAccounts.value = false
  }

  function removeLocalAccount(accountId: number): void {
    removeAccount(accountId)
  }

  async function addAccount(): Promise<void> {
    await navigateTo(localePath('/login'))
  }

  async function addSignup(): Promise<void> {
    await navigateTo(localePath('/signup'))
  }

  async function logoutActive(): Promise<void> {
    await logout()
  }
</script>

<template>
  <VStack class="accountSwitcher" :class="variant">
    <button
      v-if="activeAccount"
      class="activeAccountButton"
      @click="toggleExpanded"
      :disabled="variant === 'profile'"
    >
      <HStack class="activeAccountMain">
        <VStack class="accountInfo noSpace">
          <UsernameView
            :name="activeAccount.user.username"
            minimal
            hide-follow-button
          />
          <p class="light">{{ activeAccount.user.email }}</p>
        </VStack>
      </HStack>

      <Icon
        v-if="variant !== 'profile'"
        class="toggleIcon"
        :class="{ open: isExpanded }"
        icon="solar:alt-arrow-down-line-duotone"
      />
    </button>

    <VStack v-else class="emptyAccountState">
      <p class="light">No accounts connected yet.</p>
      <HStack class="emptyActions autoSpace fullWidth">
        <button @click="addAccount">
          <Icon icon="solar:login-2-line-duotone" />
          Log in
        </button>
        <button class="prominent" @click="addSignup">
          <Icon icon="solar:user-plus-line-duotone" />
          Sign up
        </button>
      </HStack>
    </VStack>

    <VStack v-if="isExpanded && accounts.length" class="accountList">
      <HStack
        v-for="account in accounts"
        :key="account.id"
        class="accountRow autoSpace"
        :class="{ active: account.id === auth.activeAccountId }"
      >
        <button
          class="accountSelect"
          @click="switchAccount(account.id)"
          :disabled="account.id === auth.activeAccountId"
          :class="{ prominent: account.id === auth.activeAccountId }"
        >
          <HStack class="accountMain">
            <VStack class="accountInfo noSpace">
              <UsernameView
                :name="account.user.username"
                minimal
                hide-follow-button
              />
            </VStack>
          </HStack>

          <Icon
            v-if="account.id === auth.activeAccountId"
            class="activeIcon"
            icon="solar:check-circle-line-duotone"
          />

          <button
            v-else
            class="removeAccount"
            @click="removeLocalAccount(account.id)"
          >
            <Icon icon="solar:logout-2-line-duotone" />
          </button>
        </button>
      </HStack>

      <HStack class="accountActions fullWidth autoSpace">
        <button class="addAccount prominent" @click="addAccount">
          <Icon icon="solar:user-plus-rounded-line-duotone" />
          Add
        </button>
        <button
          v-if="activeAccount"
          class="logoutAccount"
          @click="logoutActive"
        >
          <Icon icon="solar:logout-2-line-duotone" />
          Log Out
        </button>
      </HStack>
    </VStack>
  </VStack>
</template>

<style scoped lang="sass">
  @use "@/styles/utils"

  .accountSwitcher
    width: 100%

    &.profile
      .accountList
        background: transparent
        padding: 0

      .activeAccountButton
        display: none

    .accountList
      width: 100%

    .activeAccountButton
      width: 100%
      justify-content: space-between

    .toggleIcon
      transition: transform 0.2s ease

      &.open
        transform: rotate(180deg)

    .emptyAccountState
      @include utils.itemBackground

    .accountSelect
      flex-grow: 1
      justify-content: flex-start

    .removeAccount, .activeIcon
      position: absolute
      right: 0.5rem
</style>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  import { login } from '@/auth/login'
  import { completeServiceLogin } from '@/auth/serviceLogin'
  import { auth, type AuthAccount } from '@/auth/session'
  import SafeLink from '@/components/base/SafeLink.vue'
  import ContentArea from '@/components/layout/ContentArea.vue'
  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import { taskList } from '@/data/tasks'
  import { title } from '@/data/title'
  import { navigateTo } from '#app'

  definePageMeta({ showBackButton: true })

  const localePath = useLocalePath()
  const route = useRoute()
  const { t } = useI18n()

  title.value = t('auth.login')
  const email = ref('')
  const password = ref('')
  const twoFactorCode = ref('')
  const loading = ref(false)
  const error = ref<string | null>(null)
  const requiresTwoFactor = ref(false)
  const showingPasswordForm = ref(false)
  const serviceLoginError = ref<string | null>(null)
  const serviceLogin = computed(
    () => typeof route.query.redirect_uri === 'string'
  )
  const signedInAccounts = computed(() => {
    return [ ...auth.accounts ].sort((a, b) => b.lastUsed - a.lastUsed)
  })
  const showingAccountPicker = computed(() => {
    return (
      serviceLogin.value &&
      signedInAccounts.value.length > 0 &&
      !showingPasswordForm.value &&
      !requiresTwoFactor.value
    )
  })
  const signupPath = computed(() => {
    const redirectUri = route.query.redirect_uri
    const state = route.query.state
    if (typeof redirectUri !== 'string') return localePath('/signup')
    const query = new URLSearchParams({
      redirect_uri: redirectUri,
      ...(typeof state === 'string' ? { state } : {}),
    })
    return `${localePath('/signup')}?${query.toString()}`
  })

  async function submit() {
    error.value = null
    loading.value = true
    taskList.value.push('login')

    try {
      const result = await login(
        email.value,
        password.value,
        requiresTwoFactor.value ? twoFactorCode.value : undefined
      )

      if (result === 'two-factor-required') {
        requiresTwoFactor.value = true
        error.value = t('auth.loginPage.twoFactorPrompt')
        return
      }

      const serviceRedirect = await completeServiceLogin(
        route.query.redirect_uri,
        route.query.state
      )
      if (serviceRedirect) {
        window.location.assign(serviceRedirect)
        return
      }
      await navigateTo(localePath('/'))
    } catch {
      error.value = requiresTwoFactor.value
        ? t('auth.loginPage.invalidTwoFactor')
        : t('auth.invalidCredentials')
    } finally {
      loading.value = false
      taskList.value.remove('login')
    }
  }

  async function continueWithAccount(account: AuthAccount): Promise<void> {
    serviceLoginError.value = null
    loading.value = true
    taskList.value.push('login')

    try {
      const serviceRedirect = await completeServiceLogin(
        route.query.redirect_uri,
        route.query.state,
        account.token
      )
      if (!serviceRedirect) throw new Error('Service login failed')
      window.location.assign(serviceRedirect)
    } catch {
      serviceLoginError.value = t('auth.loginPage.serviceLoginFailed')
    } finally {
      loading.value = false
      taskList.value.remove('login')
    }
  }

  function loginWithAnotherAccount(): void {
    serviceLoginError.value = null
    showingPasswordForm.value = true
  }

  function returnToAccountPicker(): void {
    serviceLoginError.value = null
    showingPasswordForm.value = false
    requiresTwoFactor.value = false
    error.value = null
  }
</script>

<template>
  <ContentArea class="login">
    <HStack class="loginItems">
      <VStack v-if="showingAccountPicker" class="accountPicker">
        <VStack class="accountPickerHeader noSpace">
          <h2>{{ t('auth.loginPage.chooseAccountTitle') }}</h2>
          <p>{{ t('auth.loginPage.chooseAccountMessage') }}</p>
        </VStack>

        <VStack class="accountList">
          <button
            v-for="account in signedInAccounts"
            :key="account.id"
            class="accountOption"
            :disabled="loading"
            @click="continueWithAccount(account)"
          >
            <img
              v-if="account.user.avatarUrl"
              :src="account.user.avatarUrl"
              :alt="account.user.username"
            />
            <span v-else class="accountAvatar"
              ><Icon name="solar:user-circle-line-duotone"
            /></span>

            <span class="accountDetails">
              <strong>{{
                account.user.displayName || account.user.username
              }}</strong>
              <small
                >@{{ account.user.username }} · {{ account.user.email }}</small
              >
            </span>
            <Icon name="solar:arrow-right-line-duotone" />
          </button>
        </VStack>

        <p v-if="serviceLoginError" class="error">{{ serviceLoginError }}</p>

        <button
          class="lightButton"
          :disabled="loading"
          @click="loginWithAnotherAccount"
        >
          <Icon name="solar:user-plus-rounded-line-duotone" />
          {{ t('auth.loginPage.loginWithAnotherAccount') }}
        </button>
      </VStack>

      <form v-else @submit.prevent="submit" class="loginForm">
        <button
          v-if="serviceLogin && signedInAccounts.length"
          type="button"
          class="backToAccounts"
          @click="returnToAccountPicker"
        >
          <Icon name="solar:arrow-left-line-duotone" />
          {{ t('auth.loginPage.backToAccounts') }}
        </button>

        <VStack class="loginFormItems">
          <label>
            {{ t('auth.email') }}
            <input v-model="email" type="email" autocomplete="email" required />
          </label>

          <label>
            {{ t('auth.password') }}
            <input
              v-model="password"
              type="password"
              autocomplete="current-password"
              required
            />
          </label>

          <label v-if="requiresTwoFactor">
            {{ t('auth.loginPage.twoFactorCode') }}
            <input
              v-model="twoFactorCode"
              type="text"
              inputmode="numeric"
              autocomplete="one-time-code"
              maxlength="6"
              required
            />
          </label>
        </VStack>

        <VStack class="loginFormItems">
          <button type="submit" :disabled="loading">
            <Icon name="solar:login-2-line-duotone" />
            {{ loading ? t('auth.loginPage.loggingIn') : t('auth.login') }}
          </button>

          <p v-if="error" class="error">
            {{ error }}
          </p>
        </VStack>
      </form>

      <VStack class="accountSide">
        <h2>{{ t('auth.loginPage.sideTitle') }}</h2>
        <p>{{ t('auth.loginPage.sideMessage') }}</p>
        <ul>
          <li>
            {{ t('auth.loginPage.supportPrefix') }}
            <a href="mailto:ash@a35.dev" class="prominentLink">
              {{ t('auth.loginPage.supportLink') }} </a
            >.
          </li>
        </ul>

        <p>{{ t('auth.loginPage.thanks') }}</p>
      </VStack>
    </HStack>

    <h3 class="centerText">
      {{ t('auth.dontHaveAccount') }}
      <SafeLink class="prominentLink" :to="signupPath">
        {{ t('auth.loginPage.createAccountLink') }}
      </SafeLink>
    </h3>
  </ContentArea>
</template>

<style scoped lang="sass">
  @use '@/styles/utils'

  .accountPicker
    @include utils.itemBackground
    width: 100%

  .accountPickerHeader
    gap: 0.35rem
    text-align: center

  .accountList
    gap: 0.5rem
    width: 100%

  .accountOption
    display: flex
    align-items: center
    gap: 0.75rem
    width: 100%
    padding: 0.75rem
    text-align: left

    img,
    .accountAvatar
      flex: 0 0 2.5rem
      width: 2.5rem
      height: 2.5rem
      border-radius: 50%

    img
      object-fit: cover

    .accountAvatar
      display: grid
      place-items: center
      font-size: 2rem

    .accountDetails
      display: flex
      flex: 1
      flex-direction: column
      min-width: 0

      strong,
      small
        overflow: hidden
        text-overflow: ellipsis
        white-space: nowrap

      small
        color: var(--light-text-color)

  .lightButton,
  .backToAccounts
    align-self: center
    color: var(--light-text-color)

  .backToAccounts
    align-self: flex-start
</style>

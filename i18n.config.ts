import en from '../locales/en/common.json'
import enAuth from '../locales/en/auth.json'
import enNav from '../locales/en/nav.json'
import enMessages from '../locales/en/messages.json'

import fr from '../locales/fr/common.json'
import frAuth from '../locales/fr/auth.json'
import frNav from '../locales/fr/nav.json'
import frMessages from '../locales/fr/messages.json'

import es from '../locales/es/common.json'
import esAuth from '../locales/es/auth.json'
import esNav from '../locales/es/nav.json'
import esMessages from '../locales/es/messages.json'

import zh from '../locales/zh/common.json'
import zhAuth from '../locales/zh/auth.json'
import zhNav from '../locales/zh/nav.json'
import zhMessages from '../locales/zh/messages.json'

import ru from '../locales/ru/common.json'
import ruAuth from '../locales/ru/auth.json'
import ruNav from '../locales/ru/nav.json'
import ruMessages from '../locales/ru/messages.json'

export default defineI18nConfig(() => ({
  legacy: false,
  locale: 'en',
  missingWarn: false,
  fallbackWarn: false,
  messages: {
    en: {
      common: en,
      auth: enAuth,
      nav: enNav,
      messages: enMessages,
    },
    fr: {
      common: fr,
      auth: frAuth,
      nav: frNav,
      messages: frMessages,
    },
    es: {
      common: es,
      auth: esAuth,
      nav: esNav,
      messages: esMessages,
    },
    zh: {
      common: zh,
      auth: zhAuth,
      nav: zhNav,
      messages: zhMessages,
    },
    ru: {
      common: ru,
      auth: ruAuth,
      nav: ruNav,
      messages: ruMessages,
    },
  },
}))


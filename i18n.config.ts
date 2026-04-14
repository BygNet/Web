import enAuth from '../locales/en/auth.json'
import en from '../locales/en/common.json'
import enMessages from '../locales/en/messages.json'
import enNav from '../locales/en/nav.json'
import esAuth from '../locales/es/auth.json'
import es from '../locales/es/common.json'
import esMessages from '../locales/es/messages.json'
import esNav from '../locales/es/nav.json'
import frAuth from '../locales/fr/auth.json'
import fr from '../locales/fr/common.json'
import frMessages from '../locales/fr/messages.json'
import frNav from '../locales/fr/nav.json'
import ruAuth from '../locales/ru/auth.json'
import ru from '../locales/ru/common.json'
import ruMessages from '../locales/ru/messages.json'
import ruNav from '../locales/ru/nav.json'
import zhAuth from '../locales/zh/auth.json'
import zh from '../locales/zh/common.json'
import zhMessages from '../locales/zh/messages.json'
import zhNav from '../locales/zh/nav.json'

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


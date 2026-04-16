import type {
  ResolvableArray,
  ResolvableLink,
  ResolvableMeta,
} from '@unhead/vue/types'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { useHead } from '#imports'

export default function setHeadMeta(config: {
  page: string
  subtitle: string
  group?: string
  image?: string
  icon?: string
}): void {
  // Title (includes a group if specified)
  let title: string
  if (!config.group) {
    title = `Byg ${config.page}`
  } else {
    title = `${config.group} ${config.page}`
  }

  // Meta-tags (includes image if specified)
  let meta: ResolvableArray<ResolvableMeta> = [
    { property: 'og:title', content: title },
    { property: 'og:description', content: config.subtitle },
    { name: 'description', content: config.subtitle },
    { name: 'mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    {
      name: 'apple-mobile-web-app-status-bar-style',
      content: 'black-translucent',
    },
  ]
  if (config.image) {
    meta.push({ property: 'og:image', content: config.image })
  }

  // Link tags (includes icon if specified)
  let link: ResolvableArray<ResolvableLink> = []
  if (config.icon) {
    link.push({ rel: 'icon', href: config.icon })
  }

  useHead({
    title: title,
    meta: meta,
    link: link,
  })
}

export function setHeadMetaKeys(config: {
  pageKey: string
  subtitleKey: string
  groupKey?: string
  image?: string
  icon?: string
}): void {
  const { t } = useI18n()
  const page = computed(() => t(config.pageKey))
  const subtitle = computed(() => t(config.subtitleKey))
  const group = computed(() =>
    config.groupKey ? t(config.groupKey) : undefined
  )

  useHead({
    title: computed(() => (group.value ? `${group.value} ${page.value}` : `Byg ${page.value}`)),
    meta: computed(() => {
      const meta = [
        { property: 'og:title', content: group.value ? `${group.value} ${page.value}` : `Byg ${page.value}` },
        { property: 'og:description', content: subtitle.value },
        { name: 'description', content: subtitle.value },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        {
          name: 'apple-mobile-web-app-status-bar-style',
          content: 'black-translucent',
        },
      ]
      if (config.image) {
        meta.push({ property: 'og:image', content: config.image })
      }
      return meta
    }),
    link: computed(() =>
      config.icon ? [ { rel: 'icon', href: config.icon } ] : []
    ),
  })
}

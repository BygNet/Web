import { useHead } from '@unhead/vue'
import type {
  ResolvableArray,
  ResolvableLink,
  ResolvableMeta,
} from '@unhead/vue/types'

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

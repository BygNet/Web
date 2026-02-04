import type { BygImage } from '@bygnet/types'

import { esc } from '../../src/utils/esc'

export const onRequest = async ({ params, env, next }): Promise<Response> => {
  const id = Number(params.id ?? params.slug)
  if (Number.isNaN(id)) return next()

  let image: BygImage
  try {
    const res = await fetch(`${env.API_BASE}/image-details/${id}`)

    if (!res.ok) return next()
    image = (await res.json()) as BygImage
  } catch {
    return next()
  }

  const response = await next()
  const html = await response.text()

  const og = `
    <meta property="og:title" content="Image: &quot;${esc(image.title)}&quot;" />
    <meta property="og:description" content="View ${esc(image.author)}'s image on Byg." />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="https://byg.app/image/${id}" />
    <meta property="og:site_name" content="Byg" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Image: &quot;${esc(image.title)}&quot;" />
    <meta name="twitter:description" content="View ${esc(image.author)}'s image on Byg." />
  `

  return new Response(html.replace('</head>', `${og}</head>`), response)
}

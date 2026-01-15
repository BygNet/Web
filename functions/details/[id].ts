import { BygPost } from '../../src/types/contentTypes'

const esc = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

export const onRequest = async ({ params, env, next }): Promise<Response> => {
  const id: number = Number(params.id)

  let post: BygPost
  try {
    const res: Response = await fetch(`${env.API_BASE}/post-details/${id}`)
    post = (await res.json()) as BygPost
  } catch {
    return next()
  }

  const response = await next()
  const html = await response.text()

  const og = `
    <meta property="og:title" content="${esc(post.title)}" />
    <meta property="og:description" content="View ${esc(post.author)}'s post on Byg." />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="https://byg.app/post/${id}" />
    <meta property="og:site_name" content="Byg" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(post.title)}" />
    <meta name="twitter:description" content="View ${esc(post.author)}'s post on Byg." />
  `

  return new Response(html.replace('</head>', `${og}</head>`), response)
}

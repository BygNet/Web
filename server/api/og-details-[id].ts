/**
 * Server API route for dynamic meta tags on post details page
 * Replaces the old Cloudflare Function for SSR
 */
export default defineEventHandler(async event => {
  const id = getRouterParam(event, 'id')

  if (!id || isNaN(Number(id))) {
    throw createError({ statusCode: 404 })
  }

  try {
    const apiBase = process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:5001'
    const response = await fetch(`${apiBase}/post-details/${id}`)

    if (!response.ok) {
      throw createError({ statusCode: 404 })
    }

    const post = await response.json()

    const og = {
      title: post.title,
      description: `View ${post.author}'s post on Byg.`,
      type: 'article',
      url: `https://byg.gg/details/${id}`,
      siteName: 'Byg',
    }

    const twitter = {
      card: 'summary_large_image',
      title: post.title,
      description: `View ${post.author}'s post on Byg.`,
    }

    return {
      og,
      twitter,
    }
  } catch (error) {
    throw createError({ statusCode: 500 })
  }
})

/**
 * Server API route for dynamic meta tags on image details page
 * Replaces the old Cloudflare Function for SSR
 */
export default defineEventHandler(async event => {
  const id = getRouterParam(event, 'id')

  if (!id || isNaN(Number(id))) {
    throw createError({ statusCode: 404 })
  }

  try {
    const apiBase = process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:5001'
    const response = await fetch(`${apiBase}/image-details/${id}`)

    if (!response.ok) {
      throw createError({ statusCode: 404 })
    }

    const image = await response.json()

    const og = {
      title: `Image: "${image.title}"`,
      description: `View ${image.author}'s image on Byg.`,
      type: 'article',
      url: `https://byg.gg/image/${id}`,
      siteName: 'Byg',
    }

    const twitter = {
      card: 'summary_large_image',
      title: `Image: "${image.title}"`,
      description: `View ${image.author}'s image on Byg.`,
    }

    return {
      og,
      twitter,
    }
  } catch (error) {
    throw createError({ statusCode: 500 })
  }
})

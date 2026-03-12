import { api } from '@/api/client'
import type {
  BygSearchRequest,
  BygSearchResponse,
  BygSearchResult,
} from '@/types/search'

const SEARCH_CACHE_TTL_MS = 60 * 1000

interface TimedSearchCache {
  value: BygSearchResponse
  timestamp: number
}

const searchCache = new Map<string, TimedSearchCache>()

function sanitizeResult(result: BygSearchResult): BygSearchResult {
  return {
    ...result,
    title: result.title?.trim() || result.url,
    url: result.url?.trim() || '',
    snippet: result.snippet?.trim() || '',
    engine: result.engine?.trim() || null,
    engines: Array.isArray(result.engines) ? result.engines : [],
    category: result.category?.trim() || null,
    thumbnailUrl: result.thumbnailUrl?.trim() || null,
    publishedDate: result.publishedDate?.trim() || null,
    score: Number.isFinite(Number(result.score)) ? Number(result.score) : null,
  }
}

function parseOptionalNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function normalizeSearchResponse(input: BygSearchResponse): BygSearchResponse {
  const parsedTotalResults = parseOptionalNumber(input.totalResults)
  const parsedTookMs = parseOptionalNumber(input.tookMs)

  return {
    query: input.query ?? '',
    category: input.category ?? 'web',
    page: Number.isFinite(Number(input.page)) ? Number(input.page) : 1,
    totalResults: parsedTotalResults,
    tookMs: parsedTookMs ?? 0,
    suggestions: Array.isArray(input.suggestions) ? input.suggestions : [],
    answers: Array.isArray(input.answers) ? input.answers : [],
    results: Array.isArray(input.results)
      ? input.results.map(sanitizeResult).filter(result => !!result.url)
      : [],
  }
}

function cacheKeyFromRequest(request: BygSearchRequest): string {
  const query = request.query.trim().toLowerCase()
  const category = request.category
  const page = Number(request.page ?? 1)
  const safeSearch = Number(request.safeSearch ?? 1)
  const language = request.language?.trim().toLowerCase() ?? ''
  const timeRange = request.timeRange ?? ''

  return [ query, category, page, safeSearch, language, timeRange ].join('|')
}

export function clearSearchCache(): void {
  searchCache.clear()
}

export async function fetchBygSearch(
  request: BygSearchRequest,
  options: { force?: boolean } = {}
): Promise<BygSearchResponse | null> {
  const query = request.query.trim()
  if (!query) return null

  const page = Number.isFinite(Number(request.page))
    ? Math.max(1, Math.trunc(Number(request.page)))
    : 1

  const cacheKey = cacheKeyFromRequest({
    ...request,
    query,
    page,
  })
  const cached = searchCache.get(cacheKey)
  if (
    !options.force &&
    cached &&
    Date.now() - cached.timestamp < SEARCH_CACHE_TTL_MS
  ) {
    return cached.value
  }

  const params = new URLSearchParams()
  params.set('q', query)
  params.set('category', request.category)
  params.set('page', String(page))
  params.set(
    'safeSearch',
    String(
      Number.isFinite(Number(request.safeSearch))
        ? Math.max(0, Math.min(2, Math.trunc(Number(request.safeSearch))))
        : 1
    )
  )

  if (request.language?.trim()) {
    params.set('language', request.language.trim())
  }
  if (request.timeRange) {
    params.set('timeRange', request.timeRange)
  }

  const res = await api(`/search?${params.toString()}`)
  if (!res.ok) {
    return null
  }

  const parsed = normalizeSearchResponse(
    (await res.json()) as BygSearchResponse
  )
  searchCache.set(cacheKey, {
    value: parsed,
    timestamp: Date.now(),
  })

  return parsed
}

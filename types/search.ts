export const BYG_SEARCH_CATEGORIES = [
  'web',
  'images',
  'videos',
  'news',
  'music',
  'files',
  'science',
  'social',
] as const

export type BygSearchCategory = (typeof BYG_SEARCH_CATEGORIES)[number]

export interface BygSearchResult {
  title: string
  url: string
  snippet: string
  engine: string | null
  engines: string[]
  category: string | null
  thumbnailUrl: string | null
  publishedDate: string | null
  score: number | null
}

export interface BygSearchResponse {
  query: string
  category: BygSearchCategory
  page: number
  totalResults: number | null
  tookMs: number
  suggestions: string[]
  answers: string[]
  results: BygSearchResult[]
}

export interface BygSearchRequest {
  query: string
  category: BygSearchCategory
  page?: number
  language?: string
  safeSearch?: number
  timeRange?: 'day' | 'month' | 'year'
}

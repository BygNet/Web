import DOMPurify from 'dompurify'
import { Marked } from 'marked'

const markdownParser = new Marked({
  gfm: true,
  breaks: true,
})

const SAFE_MARKDOWN_URL = /^(?:(?:https?|mailto):|\/|#)/i

export function renderMarkdown(markdown: string): string {
  const html = markdownParser.parse(markdown ?? '') as string
  return DOMPurify.sanitize(html, {
    ALLOWED_URI_REGEXP: SAFE_MARKDOWN_URL,
  })
}

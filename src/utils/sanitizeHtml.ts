import DOMPurify from 'dompurify'

type DomPurifyLike = {
  sanitize?: (html: string) => string
}

export function sanitizeHtml(html: string): string {
  const sanitizer = DOMPurify as DomPurifyLike

  if (typeof sanitizer.sanitize === 'function') {
    return sanitizer.sanitize(html)
  }

  return html
}

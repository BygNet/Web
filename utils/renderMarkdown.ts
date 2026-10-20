import type { JSONContent } from '@tiptap/core'
import { MarkdownManager } from '@tiptap/markdown'
import DOMPurify from 'dompurify'

import { createMarkdownExtensions } from '@/utils/markdownExtensions'
import { highlightCode } from '@/utils/marked'

const markdownExtensions = createMarkdownExtensions()
const markdownManager = new MarkdownManager({
  extensions: markdownExtensions,
})

const SAFE_MARKDOWN_URL = /^(?:(?:https?|mailto):|\/|#)/i

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderAttributes(attributes: Record<string, unknown>): string {
  return Object.entries(attributes)
    .filter(([ name, value ]) => {
      if (value === null || value === undefined || value === '') {
        return false
      }

      if (name === 'href' || name === 'src') {
        return SAFE_MARKDOWN_URL.test(String(value))
      }

      return true
    })
    .map(([ name, value ]) => ` ${name}="${escapeHtml(String(value))}"`)
    .join('')
}

function renderText(node: JSONContent): string {
  let output = escapeHtml(node.text ?? '')

  for (const mark of [ ...(node.marks ?? []) ].reverse()) {
    switch (mark.type) {
      case 'bold':
        output = `<strong>${output}</strong>`
        break
      case 'italic':
        output = `<em>${output}</em>`
        break
      case 'strike':
        output = `<s>${output}</s>`
        break
      case 'underline':
        output = `<u>${output}</u>`
        break
      case 'code':
        output = `<code>${output}</code>`
        break
      case 'link': {
        const attrs = mark.attrs ?? {}
        output = `<a${renderAttributes({
          href: attrs.href,
          target: attrs.target ?? '_blank',
          rel: attrs.rel ?? 'noopener noreferrer nofollow',
          class: attrs.class,
          title: attrs.title,
        })}>${output}</a>`
        break
      }
    }
  }

  return output
}

function renderChildren(node: JSONContent, separator = ''): string {
  return (node.content ?? []).map(child => renderNode(child)).join(separator)
}

function getTextContent(node: JSONContent): string {
  if (node.type === 'text') return node.text ?? ''

  return (node.content ?? [])
    .map(child => getTextContent(child))
    .join(node.type === 'hardBreak' ? '\n' : '')
}

function renderNode(node: JSONContent): string {
  switch (node.type) {
    case 'doc':
      return renderChildren(node, '\n')
    case 'text':
      return renderText(node)
    case 'paragraph':
      return `<p>${renderChildren(node)}</p>`
    case 'heading': {
      const level = Math.min(6, Math.max(1, Number(node.attrs?.level) || 1))
      return `<h${level}>${renderChildren(node)}</h${level}>`
    }
    case 'blockquote':
      return `<blockquote>${renderChildren(node)}</blockquote>`
    case 'bulletList':
      return `<ul>${renderChildren(node)}</ul>`
    case 'orderedList': {
      const start = Number(node.attrs?.start)
      const attrs =
        Number.isFinite(start) && start !== 1 ? renderAttributes({ start }) : ''
      return `<ol${attrs}>${renderChildren(node)}</ol>`
    }
    case 'listItem':
      return `<li>${renderChildren(node)}</li>`
    case 'codeBlock': {
      const language = node.attrs?.language
      return highlightCode(getTextContent(node), language)
    }
    case 'horizontalRule':
      return '<hr>'
    case 'hardBreak':
      return '<br>'
    case 'image':
      return `<img${renderAttributes({
        src: node.attrs?.src,
        alt: node.attrs?.alt,
        title: node.attrs?.title,
      })}>`
    default:
      return renderChildren(node)
  }
}

export function renderMarkdown(markdown: string): string {
  const document = markdownManager.parse(markdown ?? '')
  const html = renderNode(document)
  const purifier =
    typeof (DOMPurify as any).sanitize === 'function'
      ? DOMPurify
      : typeof window !== 'undefined'
        ? (DOMPurify as any)(window)
        : null

  return purifier
    ? purifier.sanitize(html, {
        ALLOWED_URI_REGEXP: SAFE_MARKDOWN_URL,
      })
    : html
}

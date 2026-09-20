import { Editor } from '@tiptap/core'
import { Markdown } from '@tiptap/markdown'
import StarterKit from '@tiptap/starter-kit'
import DOMPurify from 'dompurify'

export function renderMarkdown(markdown: string): string {
  const editor = new Editor({
    content: markdown,
    contentType: 'markdown',
    extensions: [ StarterKit, Markdown ],
  })

  const html = editor.getHTML()
  editor.destroy()
  return DOMPurify.sanitize(html)
}

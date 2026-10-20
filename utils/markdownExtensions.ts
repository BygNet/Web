import { Markdown } from '@tiptap/markdown'
import StarterKit from '@tiptap/starter-kit'

import { MarkdownImage } from '@/utils/markdownImage'

export function createMarkdownExtensions() {
  return [
    StarterKit.configure({
      link: {
        autolink: false,
        linkOnPaste: false,
      },
    }),
    MarkdownImage,
    Markdown,
  ]
}

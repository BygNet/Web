import {
  mergeAttributes,
  Node,
  nodeInputRule,
  nodePasteRule,
} from '@tiptap/core'

const inputRegex = /(?:^|\s)(!\[([^\]]*)\]\((\S+?)(?:\s+["']([^"']+)["'])?\))$/
const pasteRegex = /!\[([^\]]*)\]\((\S+?)(?:\s+["']([^"']+)["'])?\)/g

export const MarkdownImage = Node.create({
  name: 'image',
  markdownTokenName: 'image',

  inline: false,
  group: 'block',
  draggable: true,
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
    }
  },

  parseHTML() {
    return [ { tag: 'img[src]' } ]
  },

  renderHTML({ HTMLAttributes }) {
    return [ 'img', mergeAttributes(HTMLAttributes) ]
  },

  parseMarkdown: (token, helpers) => {
    return helpers.createNode('image', {
      src: token.href,
      alt: token.text,
      title: token.title,
    })
  },

  renderMarkdown: node => {
    const src = node.attrs?.src ?? ''
    const alt = node.attrs?.alt ?? ''
    const title = node.attrs?.title ?? ''
    return title ? `![${alt}](${src} "${title}")` : `![${alt}](${src})`
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: inputRegex,
        type: this.type,
        getAttributes: match => ({
          alt: match[2] ?? '',
          src: match[3] ?? '',
          title: match[4] ?? null,
        }),
      }),
    ]
  },

  addPasteRules() {
    return [
      nodePasteRule({
        find: pasteRegex,
        type: this.type,
        getAttributes: match => ({
          alt: match[1] ?? '',
          src: match[2] ?? '',
          title: match[3] ?? null,
        }),
      }),
    ]
  },
})

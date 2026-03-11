import { marked } from 'marked'
import markedShiki from 'marked-shiki'
import { createHighlighter, type ThemeInput } from 'shiki'

export const tokyoDarkPurple: ThemeInput = {
  name: 'tokyo-dark-purple',
  type: 'dark',
  colors: {
    'editor.background': '#0f0325',
    'editor.foreground': '#cbc6fd',
  },
  tokenColors: [
    {
      scope: [ 'comment' ],
      settings: { foreground: '#7e729b' },
    },
    {
      scope: [ 'keyword' ],
      settings: { foreground: '#A997F6', fontStyle: 'bold' },
    },
    {
      scope: [ 'string' ],
      settings: { foreground: '#caff8a' },
    },
    {
      scope: [ 'constant.numeric' ],
      settings: { foreground: '#EBC88C' },
    },
    {
      scope: [ 'entity.name.function', 'support.function' ],
      settings: { foreground: '#99aaff' },
    },
    {
      scope: [ 'variable', 'identifier' ],
      settings: { foreground: '#cbc6fd' },
    },
    {
      scope: [ 'entity.name.type', 'class' ],
      settings: { foreground: '#f2e3ff' },
    },
    {
      scope: [ 'punctuation' ],
      settings: { foreground: '#c7a2ff' },
    },
    {
      scope: [ 'entity.name.tag' ],
      settings: { foreground: '#ee9af1' },
    },
    {
      scope: [ 'entity.other.attribute-name' ],
      settings: { foreground: '#A997F6' },
    },
  ],
}

const highlighter = await createHighlighter({
  themes: [ tokyoDarkPurple ],
  langs: [
    'ts',
    'js',
    'html',
    'css',
    'vue',
    'json',
    'sass',
    'c',
    'rust',
    'text',
    'javascript',
    'java',
    'typescript',
  ],
})

marked.use(
  markedShiki({
    async highlight(code, lang) {
      return highlighter.codeToHtml(code, {
        lang: lang || 'text',
        theme: 'tokyo-dark-purple',
      })
    },
  })
)

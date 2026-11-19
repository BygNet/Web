import { Marked } from 'marked'

export const markedWithShiki = new Marked({
  gfm: true,
  breaks: false,
})

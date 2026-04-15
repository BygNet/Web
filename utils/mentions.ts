export interface MentionContext {
  query: string
  start: number
  end: number
}

export interface MentionReplaceResult {
  text: string
  caret: number
}

const MENTION_INPUT_REGEX = /(^|[\s([{\n])@([^\s]{0,64})$/

export function getMentionContext(
  text: string,
  caret: number
): MentionContext | null {
  const textBeforeCaret = text.slice(0, caret)
  const match = MENTION_INPUT_REGEX.exec(textBeforeCaret)
  if (!match) {
    return null
  }

  const query = match[2] ?? ''
  const start = textBeforeCaret.length - query.length - 1

  return {
    query,
    start,
    end: caret,
  }
}

export function applyMention(
  text: string,
  context: MentionContext,
  username: string
): MentionReplaceResult {
  const mentionText = `@${username}`
  const nextText = `${text.slice(0, context.start)}${mentionText} ${text.slice(
    context.end
  )}`

  return {
    text: nextText,
    caret: context.start + mentionText.length + 1,
  }
}

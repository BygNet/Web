<script setup lang="ts">
  import Placeholder from '@tiptap/extension-placeholder'
  import { EditorContent, useEditor } from '@tiptap/vue-3'
  import { computed, nextTick, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'

  import { createMarkdownExtensions } from '@/utils/markdownExtensions'
  import HStack from '~/components/layout/HStack.vue'

  interface ToolbarButton {
    title: string
    icon: string
    isActive: () => boolean
    action: () => void
  }

  const model = defineModel<string>({
    default: '',
  })

  const props = defineProps<{
    placeholder?: string
    plain?: string
  }>()

  const { t } = useI18n()

  const emit = defineEmits<{
    input: []
    keyup: [event: KeyboardEvent]
    click: [event: MouseEvent]
  }>()

  const placeholder = computed(() => props.placeholder ?? '')
  const showingLinkBuilder = ref(false)
  const linkDisplayText = ref('')
  const linkContent = ref('')
  const linkError = ref('')
  const linkDisplayInput = ref<HTMLInputElement | null>(null)
  let linkSelection: { from: number; to: number } | null = null

  function preserveRawLinks(markdown: string): string {
    return markdown.replace(
      /\[([^\]]+)\]\(((?:https?:\/\/|mailto:)[^\s)]+)\)/gi,
      (match, text: string, href: string) => (text === href ? href : match)
    )
  }

  const editor = useEditor({
    content: model.value,
    contentType: 'markdown',
    extensions: [
      ...createMarkdownExtensions(),
      Placeholder.configure({
        placeholder: placeholder.value,
      }),
    ],
    onUpdate: ({ editor }) => {
      if (!editor.markdown) return
      model.value = preserveRawLinks(
        editor.markdown.serialize(editor.getJSON())
      )
    },
  })

  function getMentionText(): string {
    return editor.value?.getText() ?? model.value
  }

  function getMentionCaret(): number {
    const instance = editor.value
    if (!instance) return model.value.length
    return instance.state.doc.textBetween(
      0,
      instance.state.selection.from,
      '\n'
    ).length
  }

  function replaceMention(username: string): void {
    const instance = editor.value
    if (!instance) return

    const text = getMentionText()
    const caret = getMentionCaret()
    const beforeCaret = text.slice(0, caret)
    const match = /(^|[\s([{\n])@([^\s]{0,64})$/.exec(beforeCaret)
    if (!match) return

    const queryLength = match[2]?.length ?? 0
    const from = Math.max(1, instance.state.selection.from - queryLength - 1)
    instance
      .chain()
      .focus()
      .insertContentAt(
        { from, to: instance.state.selection.from },
        `@${username} `
      )
      .run()
  }

  function focusEditor(): void {
    editor.value?.commands.focus()
  }

  async function openLinkBuilder(): Promise<void> {
    const instance = editor.value
    if (!instance) return

    const { from, to } = instance.state.selection
    linkSelection = { from, to }
    linkDisplayText.value = instance.state.doc.textBetween(from, to, '\n')
    linkContent.value = instance.getAttributes('link').href ?? ''
    linkError.value = ''
    showingLinkBuilder.value = true
    await nextTick()
    linkDisplayInput.value?.focus()
  }

  function closeLinkBuilder(): void {
    showingLinkBuilder.value = false
    linkError.value = ''
    linkSelection = null
  }

  function normalizeLinkContent(value: string): string | null {
    const trimmed = value.trim()
    if (!trimmed) return null

    if (/^(?:https?:\/\/|mailto:|\/|#)/i.test(trimmed)) {
      return trimmed
    }

    if (/^[\w.-]+\.[a-z]{2,}(?:[/:?#]|$)/i.test(trimmed)) {
      return `https://${trimmed}`
    }

    return null
  }

  function insertLink(): void {
    const instance = editor.value
    if (!instance) return

    const href = normalizeLinkContent(linkContent.value)
    if (!href) {
      linkError.value = t('ui.markdown.invalidUrl')
      return
    }

    const text = linkDisplayText.value.trim() || href
    const selection = linkSelection ?? instance.state.selection
    instance
      .chain()
      .focus()
      .setTextSelection(selection)
      .deleteSelection()
      .insertContent({
        type: 'text',
        text,
        marks: [ { type: 'link', attrs: { href } } ],
      })
      .run()

    closeLinkBuilder()
  }

  defineExpose({ getMentionText, getMentionCaret, replaceMention, focusEditor })

  const toolbarButtons: ToolbarButton[] = [
    {
      title: 'Bold',
      icon: 'lucide:bold',
      isActive: () => editor.value?.isActive('bold') ?? false,
      action: () => {
        editor.value?.chain().focus().toggleBold().run()
      },
    },
    {
      title: 'Italic',
      icon: 'lucide:italic',
      isActive: () => editor.value?.isActive('italic') ?? false,
      action: () => {
        editor.value?.chain().focus().toggleItalic().run()
      },
    },
    {
      title: 'Strike',
      icon: 'lucide:strikethrough',
      isActive: () => editor.value?.isActive('strike') ?? false,
      action: () => {
        editor.value?.chain().focus().toggleStrike().run()
      },
    },
    {
      title: 'Underline',
      icon: 'lucide:underline',
      isActive: () => editor.value?.isActive('underline') ?? false,
      action: () => {
        editor.value?.chain().focus().toggleUnderline().run()
      },
    },
    {
      title: 'Code',
      icon: 'lucide:code',
      isActive: () => editor.value?.isActive('code') ?? false,
      action: () => {
        editor.value?.chain().focus().toggleCode().run()
      },
    },
    {
      title: 'Clear marks',
      icon: 'lucide:eraser',
      isActive: () => false,
      action: () => {
        editor.value?.chain().focus().unsetAllMarks().run()
      },
    },
    {
      title: 'Clear nodes',
      icon: 'lucide:trash-2',
      isActive: () => false,
      action: () => {
        editor.value?.chain().focus().clearNodes().run()
      },
    },
    {
      title: t('ui.markdown.insertLink'),
      icon: 'lucide:link',
      isActive: () => editor.value?.isActive('link') ?? false,
      action: () => {
        openLinkBuilder()
      },
    },
    {
      title: 'Paragraph',
      icon: 'lucide:text',
      isActive: () => editor.value?.isActive('paragraph') ?? false,
      action: () => {
        editor.value?.chain().focus().setParagraph().run()
      },
    },
    {
      title: 'H1',
      icon: 'lucide:heading-1',
      isActive: () => editor.value?.isActive('heading', { level: 1 }) ?? false,
      action: () => {
        editor.value?.chain().focus().toggleHeading({ level: 1 }).run()
      },
    },
    {
      title: 'H2',
      icon: 'lucide:heading-2',
      isActive: () => editor.value?.isActive('heading', { level: 2 }) ?? false,
      action: () => {
        editor.value?.chain().focus().toggleHeading({ level: 2 }).run()
      },
    },
    {
      title: 'H3',
      icon: 'lucide:heading-3',
      isActive: () => editor.value?.isActive('heading', { level: 3 }) ?? false,
      action: () => {
        editor.value?.chain().focus().toggleHeading({ level: 3 }).run()
      },
    },
    {
      title: 'Bullet list',
      icon: 'lucide:list',
      isActive: () => editor.value?.isActive('bulletList') ?? false,
      action: () => {
        editor.value?.chain().focus().toggleBulletList().run()
      },
    },
    {
      title: 'Ordered list',
      icon: 'lucide:list-ordered',
      isActive: () => editor.value?.isActive('orderedList') ?? false,
      action: () => {
        editor.value?.chain().focus().toggleOrderedList().run()
      },
    },
    {
      title: 'Code block',
      icon: 'lucide:square-code',
      isActive: () => editor.value?.isActive('codeBlock') ?? false,
      action: () => {
        editor.value?.chain().focus().toggleCodeBlock().run()
      },
    },
    {
      title: 'Blockquote',
      icon: 'lucide:text-quote',
      isActive: () => editor.value?.isActive('blockquote') ?? false,
      action: () => {
        editor.value?.chain().focus().toggleBlockquote().run()
      },
    },
    {
      title: 'Horizontal rule',
      icon: 'lucide:minus',
      isActive: () => false,
      action: () => {
        editor.value?.chain().focus().setHorizontalRule().run()
      },
    },
  ]

  watch(model, value => {
    if (!editor.value) return
    if (editor.value.isFocused) return

    editor.value.commands.setContent(value, {
      contentType: 'markdown',
      emitUpdate: false,
    })
  })
</script>

<template>
  <HStack class="bygEditorToolbar">
    <button
      v-for="button in toolbarButtons"
      :key="button.title"
      @mousedown.prevent
      @click="button.action()"
      class="editorToolbarItem"
      :class="{ prominent: button.isActive() }"
    >
      <Icon :name="button.icon" />
    </button>
  </HStack>

  <div v-if="showingLinkBuilder" class="linkBuilder" @mousedown.stop>
    <input
      ref="linkDisplayInput"
      v-model="linkDisplayText"
      :aria-label="t('ui.markdown.displayText')"
      :placeholder="t('ui.markdown.displayText')"
      @keydown.enter.prevent="insertLink"
    />
    <input
      v-model="linkContent"
      type="url"
      :aria-label="t('ui.markdown.linkUrl')"
      :placeholder="t('ui.markdown.linkUrlPlaceholder')"
      @keydown.enter.prevent="insertLink"
    />

    <p v-if="linkError" class="linkBuilderError">{{ linkError }}</p>

    <HStack class="linkBuilderActions">
      <button class="transparent" type="button" @click="closeLinkBuilder">
        {{ t('common.cancel') }}
      </button>
      <button class="prominent" type="button" @click="insertLink">
        <Icon name="solar:link-minimalistic-2-line-duotone" />
        {{ t('ui.markdown.insertLink') }}
      </button>
    </HStack>
  </div>

  <EditorContent
    class="bygMarkdownEditor"
    :class="{ plain }"
    :editor="editor"
    @input="emit('input')"
    @keyup="emit('keyup', $event)"
    @click="emit('click', $event)"
  />
</template>

<style lang="sass">
  @use "@/styles/themes"

  .bygEditorToolbar
    width: 100%
    margin: 0.75rem 0 0.35rem
    gap: 0.1rem !important

    .editorToolbarItem
      --buttonRadius: 0.75rem
      padding: 0.25rem !important

      &:not(:hover):not(.prominent)
        background: transparent
        backdrop-filter: none
        box-shadow: none

      span.iconify
        width: 1.5rem !important
        height: 1.5rem !important

  .bygMarkdownEditor
    width: 100%

    .tiptap
      width: 100%
      border: none

      &:not(.plain)
        padding: 0.5rem 0.75rem
        border-radius: 1.25rem
        background: themes.$foregroundColor

        &:focus
          outline: themes.$accentColor 0.1rem solid

      .plain
        outline: none !important


  .linkBuilder
    width: 100%
    display: flex
    flex-direction: row
    flex-wrap: wrap
    align-items: center
    gap: 0.35rem
    padding: 0.5rem
    border-radius: 1.75rem
    background: themes.$foregroundColor

    input
      flex: 1 1 12rem
      min-width: 8rem

    .linkBuilderError
      width: 100%
      margin: 0
      color: #ff8f9f

    .linkBuilderActions
      flex: 0 0 auto
      gap: 0.25rem
</style>

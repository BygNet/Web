<script setup lang="ts">
  import Placeholder from '@tiptap/extension-placeholder'
  import { Markdown } from '@tiptap/markdown'
  import StarterKit from '@tiptap/starter-kit'
  import { EditorContent, useEditor } from '@tiptap/vue-3'
  import { computed, watch } from 'vue'

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

  const emit = defineEmits<{
    input: []
    keyup: [event: KeyboardEvent]
    click: [event: MouseEvent]
  }>()

  const placeholder = computed(() => props.placeholder ?? '')

  const editor = useEditor({
    content: model.value,
    contentType: 'markdown',
    extensions: [
      StarterKit,
      Markdown,
      Placeholder.configure({
        placeholder: placeholder.value,
      }),
    ],
    onUpdate: ({ editor }) => {
      if (!editor.markdown) return
      model.value = editor.markdown.serialize(editor.getJSON())
    },
  })

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
      --buttonRadius: 0.5rem
      padding: 0.25rem !important

      &:not(:hover):not(.prominent)
        background: transparent
        backdrop-filter: none

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

      *
        width: 100%

      ul, ol
        margin: 0.5rem 0
</style>

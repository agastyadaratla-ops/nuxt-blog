<script setup lang="ts">
import StarterKit from '@tiptap/starter-kit'
import { Placeholder } from '@tiptap/extensions'
import { EditorContent, useEditor } from '@tiptap/vue-3'

/**
 * The WYSIWYG surface. Owns nothing but the HTML string it edits — the parent
 * decides what to do with it.
 */
const model = defineModel<string>({ required: true })

const editor = useEditor({
  content: model.value,
  extensions: [
    StarterKit.configure({
      link: {
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      },
    }),
    Placeholder.configure({ placeholder: 'Start writing your post…' }),
  ],
  editorProps: {
    attributes: { class: 'prose-post tiptap' },
  },
  onUpdate: ({ editor }) => {
    model.value = editor.getHTML()
  },
})

// When the parent loads an existing post after mount, push it in once.
// The equality check stops this from ping-ponging with onUpdate above.
watch(model, (value) => {
  if (editor.value && value !== editor.value.getHTML()) {
    editor.value.commands.setContent(value, { emitUpdate: false })
  }
})

function toggleLink() {
  if (!editor.value) return

  if (editor.value.isActive('link')) {
    editor.value.chain().focus().unsetLink().run()
    return
  }

  const url = window.prompt('Link URL')
  if (!url) return

  editor.value.chain().focus().setLink({ href: url }).run()
}

interface ToolbarButton {
  label: string
  title: string
  isActive?: () => boolean
  run: () => void
}

const buttons = computed<ToolbarButton[]>(() => {
  const e = editor.value
  if (!e) return []

  return [
    {
      label: 'B',
      title: 'Bold',
      isActive: () => e.isActive('bold'),
      run: () => e.chain().focus().toggleBold().run(),
    },
    {
      label: 'I',
      title: 'Italic',
      isActive: () => e.isActive('italic'),
      run: () => e.chain().focus().toggleItalic().run(),
    },
    {
      label: 'S',
      title: 'Strikethrough',
      isActive: () => e.isActive('strike'),
      run: () => e.chain().focus().toggleStrike().run(),
    },
    {
      label: 'H2',
      title: 'Heading',
      isActive: () => e.isActive('heading', { level: 2 }),
      run: () => e.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: 'H3',
      title: 'Subheading',
      isActive: () => e.isActive('heading', { level: 3 }),
      run: () => e.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      label: '• List',
      title: 'Bullet list',
      isActive: () => e.isActive('bulletList'),
      run: () => e.chain().focus().toggleBulletList().run(),
    },
    {
      label: '1. List',
      title: 'Numbered list',
      isActive: () => e.isActive('orderedList'),
      run: () => e.chain().focus().toggleOrderedList().run(),
    },
    {
      label: '❝',
      title: 'Quote',
      isActive: () => e.isActive('blockquote'),
      run: () => e.chain().focus().toggleBlockquote().run(),
    },
    {
      label: '</>',
      title: 'Code block',
      isActive: () => e.isActive('codeBlock'),
      run: () => e.chain().focus().toggleCodeBlock().run(),
    },
    {
      label: '🔗',
      title: 'Link',
      isActive: () => e.isActive('link'),
      run: toggleLink,
    },
    {
      label: '↶',
      title: 'Undo',
      run: () => e.chain().focus().undo().run(),
    },
    {
      label: '↷',
      title: 'Redo',
      run: () => e.chain().focus().redo().run(),
    },
  ]
})

onBeforeUnmount(() => editor.value?.destroy())
</script>

<template>
  <div class="overflow-hidden rounded-lg border border-line bg-surface">
    <div class="flex flex-wrap gap-1 border-b border-line bg-paper px-2 py-2">
      <button
        v-for="button in buttons"
        :key="button.title"
        type="button"
        :title="button.title"
        class="min-w-8 rounded px-2 py-1 text-sm font-medium text-muted transition hover:bg-line hover:text-ink"
        :class="{ 'bg-accent-soft text-accent': button.isActive?.() }"
        @click="button.run()"
      >
        {{ button.label }}
      </button>
    </div>

    <EditorContent :editor="editor" class="px-5 py-4" />
  </div>
</template>

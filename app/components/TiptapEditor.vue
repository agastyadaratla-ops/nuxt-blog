<script setup lang="ts">
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { Placeholder } from '@tiptap/extensions'
import { EditorContent, useEditor } from '@tiptap/vue-3'

/**
 * The WYSIWYG surface. Owns nothing but the HTML string it edits.
 *
 * Image uploading is injected rather than imported so this component stays
 * unaware of Supabase — it only knows "hand a File to this, get a URL back".
 */
const props = defineProps<{
  upload: (file: File) => Promise<string>
}>()

const model = defineModel<string>({ required: true })

const fileInput = useTemplateRef<HTMLInputElement>('fileInput')

// A counter rather than a boolean: dropping three images at once starts three
// concurrent uploads, and the indicator should persist until the last finishes.
const uploadsInFlight = ref(0)
const uploadError = ref<string | null>(null)

const editor = useEditor({
  content: model.value,
  extensions: [
    StarterKit.configure({
      link: {
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      },
    }),
    Image.configure({
      // Base64 would embed whole images in the post HTML and bloat the row;
      // everything goes to storage and is referenced by URL instead.
      allowBase64: false,
      HTMLAttributes: { loading: 'lazy' },
    }),
    Placeholder.configure({ placeholder: 'Start writing your post…' }),
  ],
  editorProps: {
    attributes: { class: 'prose-post tiptap' },

    handlePaste: (_view, event) => {
      const files = imageFilesFrom(event.clipboardData?.files)
      if (!files.length) return false

      event.preventDefault()
      void insertImages(files)
      return true
    },

    handleDrop: (view, event) => {
      const files = imageFilesFrom((event as DragEvent).dataTransfer?.files)
      if (!files.length) return false

      event.preventDefault()
      // Drop the image where the pointer actually is, not at the old cursor.
      const dropped = event as DragEvent
      const coords = view.posAtCoords({
        left: dropped.clientX,
        top: dropped.clientY,
      })
      void insertImages(files, coords?.pos)
      return true
    },
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

const IMAGE_EXTENSION = /\.(png|jpe?g|gif|webp|avif|svg|bmp|heic|heif)$/i

/**
 * Windows hands back an empty `type` for several image formats, so a strict
 * MIME check silently discards perfectly good files. Fall back to the
 * extension when the browser has no opinion.
 */
function isImage(file: File): boolean {
  return (
    file.type.startsWith('image/') ||
    (file.type === '' && IMAGE_EXTENSION.test(file.name))
  )
}

function describe(files: File[]): string {
  return files
    .map((file) => `${file.name} (${file.type || 'unknown type'})`)
    .join(', ')
}

function imageFilesFrom(list: FileList | null | undefined): File[] {
  return Array.from(list ?? []).filter(isImage)
}

/**
 * Upload each file and place it in the document. Sequential on purpose: after
 * the first image lands, the cursor sits just after it, so the rest fall into
 * the order they were dropped.
 */
async function insertImages(files: File[], at?: number, alt = '') {
  uploadError.value = null
  let position = at

  for (const file of files) {
    uploadsInFlight.value++

    try {
      const src = await props.upload(file)
      const instance = editor.value

      if (!instance) {
        uploadError.value = 'The editor was not ready — please try again.'
        return
      }

      if (position === undefined) {
        instance.chain().focus().setImage({ src, alt }).run()
      } else {
        instance
          .chain()
          .focus()
          .insertContentAt(position, { type: 'image', attrs: { src, alt } })
          .run()
        // Subsequent images follow the cursor rather than stacking on the drop point.
        position = undefined
      }
    } catch (error) {
      uploadError.value = (error as Error).message
    } finally {
      uploadsInFlight.value--
    }
  }
}

function pickImage() {
  fileInput.value?.click()
}

async function onFilePicked(event: Event) {
  const input = event.target as HTMLInputElement
  const chosen = Array.from(input.files ?? [])
  input.value = '' // let the same file be chosen again after a failure

  // Cancelling the dialog is the one case where doing nothing is correct.
  if (!chosen.length) return

  const images = chosen.filter(isImage)

  // Anything else must say so. A silent return here looks identical to the
  // feature being broken.
  if (!images.length) {
    uploadError.value = `That doesn't look like an image file: ${describe(chosen)}`
    return
  }

  // Only the deliberate toolbar path asks for alt text; prompting on every
  // paste would be intolerable.
  const alt =
    window.prompt('Describe this image for screen readers (optional)') ?? ''

  await insertImages(images, undefined, alt)
}

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
      label: '🖼',
      title: 'Insert image (you can also paste or drag one in)',
      isActive: () => e.isActive('image'),
      run: pickImage,
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

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      multiple
      class="hidden"
      @change="onFilePicked"
    />

    <EditorContent :editor="editor" class="px-5 py-4" />

    <p
      v-if="uploadsInFlight > 0"
      class="border-t border-line px-5 py-2 text-sm text-muted"
    >
      Uploading {{ uploadsInFlight }}
      {{ uploadsInFlight === 1 ? 'image' : 'images' }}…
    </p>

    <p
      v-if="uploadError"
      class="border-t border-line px-5 py-2 text-sm text-red-700"
    >
      {{ uploadError }}
    </p>
  </div>
</template>

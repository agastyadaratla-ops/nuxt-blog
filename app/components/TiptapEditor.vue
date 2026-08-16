<script setup lang="ts">
import type { Component } from 'vue'
import StarterKit from '@tiptap/starter-kit'
// Aliased: the Lucide icon below is also called Image.
import TiptapImage from '@tiptap/extension-image'
import { Placeholder } from '@tiptap/extensions'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import {
  Bold,
  Code,
  Film,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link,
  List,
  ListOrdered,
  MonitorPlay,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
} from '@lucide/vue'
import { VideoEmbed, VideoFile } from '~/tiptap/videoNodes'

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
const videoInput = useTemplateRef<HTMLInputElement>('videoInput')

/** Non-error feedback, so a warning is not dressed up in destructive red. */
const notice = ref<string | null>(null)

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
    TiptapImage.configure({
      // Base64 would embed whole images in the post HTML and bloat the row;
      // everything goes to storage and is referenced by URL instead.
      allowBase64: false,
      HTMLAttributes: { loading: 'lazy' },
    }),
    Placeholder.configure({ placeholder: 'Start writing your post…' }),
    VideoEmbed,
    VideoFile,
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
        uploadError.value = 'The editor was not ready. Please try again.'
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

const VIDEO_EXTENSION = /\.(mp4|webm|ogv|ogg|mov|m4v)$/i

function pickVideo() {
  videoInput.value?.click()
}

/** Paste a YouTube or Vimeo link and get a player. */
function embedVideo() {
  const url = window.prompt('Paste a YouTube or Vimeo link')
  if (!url) return

  const parsed = parseVideoUrl(url)

  if (!parsed) {
    uploadError.value =
      'That link was not recognised. YouTube and Vimeo links are supported.'
    return
  }

  editor.value
    ?.chain()
    .focus()
    .setVideoEmbed({ src: parsed.src, provider: parsed.provider })
    .run()
}

async function onVideoPicked(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''

  if (!file) return

  if (!file.type.startsWith('video/') && !VIDEO_EXTENSION.test(file.name)) {
    uploadError.value = `That doesn't look like a video file: ${describe([file])}`
    return
  }

  uploadsInFlight.value++
  uploadError.value = null
  notice.value = null

  try {
    const src = await props.upload(file)
    editor.value?.chain().focus().setVideoFile({ src, title: file.name }).run()

    // QuickTime containers often carry codecs Chrome and Firefox refuse.
    if (/\.mov$/i.test(file.name)) {
      notice.value =
        'Uploaded. Note that .mov files do not play in every browser; MP4 is the safer format.'
    }
  } catch (error) {
    uploadError.value = (error as Error).message
  } finally {
    uploadsInFlight.value--
  }
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
  icon: Component
  title: string
  isActive?: () => boolean
  run: () => void
  /** Starts a new group in the toolbar, drawn as a hairline separator. */
  divide?: boolean
}

const buttons = computed<ToolbarButton[]>(() => {
  const e = editor.value
  if (!e) return []

  return [
    {
      icon: markRaw(Bold),
      title: 'Bold',
      isActive: () => e.isActive('bold'),
      run: () => e.chain().focus().toggleBold().run(),
    },
    {
      icon: markRaw(Italic),
      title: 'Italic',
      isActive: () => e.isActive('italic'),
      run: () => e.chain().focus().toggleItalic().run(),
    },
    {
      icon: markRaw(Strikethrough),
      title: 'Strikethrough',
      isActive: () => e.isActive('strike'),
      run: () => e.chain().focus().toggleStrike().run(),
    },
    {
      icon: markRaw(Heading2),
      title: 'Heading',
      divide: true,
      isActive: () => e.isActive('heading', { level: 2 }),
      run: () => e.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      icon: markRaw(Heading3),
      title: 'Subheading',
      isActive: () => e.isActive('heading', { level: 3 }),
      run: () => e.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      icon: markRaw(List),
      title: 'Bullet list',
      divide: true,
      isActive: () => e.isActive('bulletList'),
      run: () => e.chain().focus().toggleBulletList().run(),
    },
    {
      icon: markRaw(ListOrdered),
      title: 'Numbered list',
      isActive: () => e.isActive('orderedList'),
      run: () => e.chain().focus().toggleOrderedList().run(),
    },
    {
      icon: markRaw(Quote),
      title: 'Quote',
      isActive: () => e.isActive('blockquote'),
      run: () => e.chain().focus().toggleBlockquote().run(),
    },
    {
      icon: markRaw(Code),
      title: 'Code block',
      isActive: () => e.isActive('codeBlock'),
      run: () => e.chain().focus().toggleCodeBlock().run(),
    },
    {
      icon: markRaw(Link),
      title: 'Link',
      divide: true,
      isActive: () => e.isActive('link'),
      run: toggleLink,
    },
    {
      icon: markRaw(ImageIcon),
      title: 'Insert image (you can also paste or drag one in)',
      isActive: () => e.isActive('image'),
      run: pickImage,
    },
    {
      icon: markRaw(MonitorPlay),
      title: 'Embed a YouTube or Vimeo video',
      isActive: () => e.isActive('videoEmbed'),
      run: embedVideo,
    },
    {
      icon: markRaw(Film),
      title: 'Upload a video clip',
      isActive: () => e.isActive('videoFile'),
      run: pickVideo,
    },
    {
      icon: markRaw(Undo2),
      title: 'Undo',
      divide: true,
      run: () => e.chain().focus().undo().run(),
    },
    {
      icon: markRaw(Redo2),
      title: 'Redo',
      run: () => e.chain().focus().redo().run(),
    },
  ]
})

onBeforeUnmount(() => editor.value?.destroy())
</script>

<template>
  <div class="border border-line bg-surface">
    <div
      class="flex flex-wrap items-center gap-1 border-b border-line bg-paper px-2 py-2"
    >
      <template v-for="button in buttons" :key="button.title">
        <span
          v-if="button.divide"
          class="mx-1 hidden h-5 w-px bg-line sm:block"
          aria-hidden="true"
        />

        <!-- Icon-only, so the accessible name comes from aria-label, and
             aria-pressed exposes the on/off state to screen readers. -->
        <button
          type="button"
          :title="button.title"
          :aria-label="button.title"
          :aria-pressed="button.isActive ? button.isActive() : undefined"
          class="flex size-11 items-center justify-center rounded-[2px] text-ink-soft transition-colors hover:bg-line hover:text-ink"
          :class="{ 'bg-ink text-white hover:bg-ink hover:text-white': button.isActive?.() }"
          @click="button.run()"
        >
          <component :is="button.icon" class="size-4" />
        </button>
      </template>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      multiple
      class="hidden"
      @change="onFilePicked"
    />

    <input
      ref="videoInput"
      type="file"
      accept="video/*"
      class="hidden"
      @change="onVideoPicked"
    />

    <EditorContent :editor="editor" class="px-6 py-5" />

    <p
      v-if="uploadsInFlight > 0"
      class="label border-t border-line px-6 py-3"
      aria-live="polite"
    >
      Uploading {{ uploadsInFlight }}
      {{ uploadsInFlight === 1 ? 'image' : 'images' }}…
    </p>

    <p
      v-if="notice"
      class="border-t border-line px-6 py-3 text-sm text-muted"
      aria-live="polite"
    >
      {{ notice }}
    </p>

    <p
      v-if="uploadError"
      class="border-t border-line bg-destructive/5 px-6 py-3 text-sm text-destructive"
      aria-live="polite"
    >
      {{ uploadError }}
    </p>
  </div>
</template>

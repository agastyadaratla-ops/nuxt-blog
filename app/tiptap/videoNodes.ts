import { Node, mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    videoEmbed: {
      setVideoEmbed: (options: {
        src: string
        provider: string
        title?: string
      }) => ReturnType
    }
    videoFile: {
      setVideoFile: (options: { src: string; title?: string }) => ReturnType
    }
  }
}

/**
 * A YouTube or Vimeo player.
 *
 * `src` is always a URL this app constructed in `parseVideoUrl`, never a raw
 * pasted string, so an arbitrary origin cannot end up in an iframe.
 *
 * `parseHTML` matters more than it looks: without it, reopening a saved post
 * would fail to recognise the stored markup and silently drop every video.
 */
export const VideoEmbed = Node.create({
  name: 'videoEmbed',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      provider: { default: 'youtube' },
      title: { default: 'Embedded video' },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-video-embed]',
        getAttrs: (element) => {
          const node = element as HTMLElement
          const iframe = node.querySelector('iframe')

          return {
            src: iframe?.getAttribute('src') ?? null,
            provider: node.getAttribute('data-video-embed') ?? 'youtube',
            title: iframe?.getAttribute('title') ?? 'Embedded video',
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const { src, provider, title } = HTMLAttributes as Record<string, string>

    return [
      'div',
      { 'data-video-embed': provider || 'youtube', class: 'video-embed' },
      [
        'iframe',
        {
          src,
          title: title || 'Embedded video',
          loading: 'lazy',
          frameborder: '0',
          referrerpolicy: 'strict-origin-when-cross-origin',
          allow:
            'accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
          allowfullscreen: 'true',
        },
      ],
    ]
  },

  addCommands() {
    return {
      setVideoEmbed:
        (options) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: options }),
    }
  },
})

/**
 * A self-hosted clip served from Supabase Storage.
 *
 * `preload="metadata"` fetches only enough to show duration and a first frame;
 * preloading whole videos would punish anyone who never presses play.
 */
export const VideoFile = Node.create({
  name: 'videoFile',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      title: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'video[src]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'video',
      mergeAttributes(HTMLAttributes, {
        class: 'video-file',
        controls: 'true',
        preload: 'metadata',
        playsinline: 'true',
      }),
    ]
  },

  addCommands() {
    return {
      setVideoFile:
        (options) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: options }),
    }
  },
})

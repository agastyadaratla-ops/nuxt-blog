import type { Database, Post, PostInput } from '~/types/database.types'

/** Supabase rejects anything larger at the storage layer on the free tier. */
const MAX_UPLOAD_BYTES = 50 * 1024 * 1024

/**
 * The About page lives in the posts table under a reserved slug.
 *
 * It could have had its own table, but that would mean new SQL to run and new
 * policies to get right. Reusing `posts` means the About page inherits the
 * same RLS rules that already work, at the cost of having to filter this one
 * row out of the listings.
 */
export const ABOUT_SLUG = 'about'

/**
 * The single place that talks to the `posts` table and the `covers` bucket.
 *
 * Pages call these methods and never touch the Supabase client directly, so
 * swapping the backend later means rewriting this file and nothing else.
 * Every method throws a plain `Error` on failure; callers show the message.
 */
export function usePostsRepo() {
  const supabase = useSupabaseClient<Database>()

  /** Published posts, newest first. Readable by anyone (see RLS). */
  async function listPublished(): Promise<Post[]> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('published', true)
      .neq('slug', ABOUT_SLUG)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data ?? []
  }

  /** A single published post by slug, or null if there is no such post. */
  async function getBySlug(slug: string): Promise<Post | null> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    if (error) throw new Error(error.message)
    return data
  }

  /** Every post the signed-in author owns, drafts included. */
  async function listMine(): Promise<Post[]> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .neq('slug', ABOUT_SLUG)
      .order('updated_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data ?? []
  }

  async function getById(id: string): Promise<Post | null> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) throw new Error(error.message)
    return data
  }

  async function create(input: PostInput, authorId: string): Promise<Post> {
    // Without this, a missing id reaches Postgres as a null author_id and the
    // insert policy rejects it as an RLS violation — an error that points at
    // the database when the real fault is here. Fail plainly instead.
    if (!authorId) {
      throw new Error('Not signed in — cannot save a post without an author.')
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({ ...input, author_id: authorId })
      .select()
      .single()

    // 23505 is Postgres' unique-violation code: this slug is already taken.
    if (error?.code === '23505') {
      return create({ ...input, slug: slugWithSuffix(input.slug) }, authorId)
    }
    if (error) throw new Error(error.message)
    return data
  }

  async function update(id: string, input: PostInput): Promise<Post> {
    const { data, error } = await supabase
      .from('posts')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error?.code === '23505') {
      return update(id, { ...input, slug: slugWithSuffix(input.slug) })
    }
    if (error) throw new Error(error.message)
    return data
  }

  async function remove(id: string): Promise<void> {
    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (error) throw new Error(error.message)
  }

  /**
   * Upload a file and return its public URL. Serves cover images, pictures
   * embedded in a post body, and short video clips; they share one bucket.
   *
   * The size check is here rather than at the call site because Supabase
   * rejects oversized uploads with a generic storage error that says nothing
   * about what to do next.
   */
  async function uploadMedia(file: File): Promise<string> {
    if (file.size > MAX_UPLOAD_BYTES) {
      const actual = Math.round(file.size / 1024 / 1024)
      const limit = Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)

      throw new Error(
        `That file is ${actual}MB and the storage limit is ${limit}MB. Compress it, or put it on YouTube and embed the link instead.`,
      )
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
    const path = `${crypto.randomUUID()}.${ext}`

    const { error } = await supabase.storage
      .from('covers')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || undefined,
      })

    if (error) throw new Error(error.message)

    const { data } = supabase.storage.from('covers').getPublicUrl(path)
    return data.publicUrl
  }

  return {
    listPublished,
    getBySlug,
    listMine,
    getById,
    create,
    update,
    remove,
    uploadMedia,
  }
}

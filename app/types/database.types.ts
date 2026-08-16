/**
 * NOTE: everything here is a `type` alias rather than an `interface`.
 * Supabase's `GenericSchema` constraint requires `Record<string, unknown>`
 * compatibility, and TypeScript only gives implicit index signatures to type
 * aliases — an `interface` here silently resolves the whole schema to `never`
 * and every insert/update loses its types.
 */

/** A blog post row, exactly as it comes back from the `posts` table. */
export type Post = {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  cover_url: string | null
  published: boolean
  author_id: string
  created_at: string
  updated_at: string
}

/** The fields the editor form is responsible for. */
export type PostInput = Pick<
  Post,
  'title' | 'slug' | 'excerpt' | 'content' | 'cover_url' | 'published'
>

export type PostInsert = Omit<Post, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}

/**
 * Minimal hand-written schema type for the Supabase client. Matches the shape
 * `supabase gen types typescript` produces, so it can be swapped for a
 * generated file later without touching any call sites.
 */
export type Database = {
  __InternalSupabase: { PostgrestVersion: '13' }
  public: {
    Tables: {
      posts: {
        Row: Post
        Insert: PostInsert
        Update: Partial<Omit<Post, 'id'>>
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

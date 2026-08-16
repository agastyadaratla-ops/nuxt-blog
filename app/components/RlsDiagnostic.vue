<script setup lang="ts">
/**
 * TEMPORARY. Paired with supabase/diagnose-rls.sql.
 *
 * Compares what the app believes about the signed-in user against what
 * Postgres actually sees on the same request, then attempts the exact insert
 * that is failing. Delete this component and the SQL function once the
 * insert-policy problem is understood.
 */
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const output = ref('')
const running = ref(false)

async function run() {
  running.value = true
  const lines: string[] = []

  try {
    // --- what the browser thinks -------------------------------------------
    const { data: sessionData } = await supabase.auth.getSession()
    const session = sessionData.session

    lines.push(`app user.id     : ${user.value?.id ?? '(null)'}`)
    lines.push(`session present : ${session ? 'yes' : 'NO'}`)

    if (session) {
      const expiresAt = session.expires_at ?? 0
      lines.push(`token expired   : ${expiresAt * 1000 < Date.now() ? 'YES' : 'no'}`)

      // Read the claims without verifying — we only want the role and subject.
      const [, payload] = session.access_token.split('.')
      if (payload) {
        const claims = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
        lines.push(`jwt sub         : ${claims.sub}`)
        lines.push(`jwt role        : ${claims.role}`)
      }
    }

    // --- what Postgres thinks, on the very same client ----------------------
    const { data: who, error: whoError } = await supabase.rpc('whoami')

    if (whoError) {
      lines.push(`whoami() error  : ${whoError.message}`)
      lines.push('(did you run supabase/diagnose-rls.sql yet?)')
    } else {
      lines.push(`db auth.uid()   : ${who?.uid ?? '(null)'}`)
      lines.push(`db auth.role()  : ${who?.role ?? '(null)'}`)
      lines.push(
        `uid matches app : ${who?.uid && who.uid === user.value?.id ? 'YES' : 'NO'}`,
      )
    }

    // --- the operation that actually fails ----------------------------------
    const { error: insertError } = await supabase.from('posts').insert({
      title: 'RLS diagnostic',
      slug: `rls-diagnostic-${Date.now()}`,
      excerpt: '',
      content: '',
      cover_url: null,
      published: false,
      author_id: user.value?.id ?? '',
    })

    lines.push(
      insertError
        ? `insert          : FAILED ${insertError.code} — ${insertError.message}`
        : 'insert          : SUCCEEDED (delete the "RLS diagnostic" draft)',
    )
  } catch (error) {
    lines.push(`threw: ${(error as Error).message}`)
  }

  output.value = lines.join('\n')
  running.value = false
}
</script>

<template>
  <section class="mt-10 rounded-lg border border-dashed border-line p-5">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h2 class="font-medium">RLS diagnostic</h2>
        <p class="mt-0.5 text-sm text-muted">
          Temporary. Run supabase/diagnose-rls.sql first.
        </p>
      </div>
      <button
        type="button"
        :disabled="running"
        class="shrink-0 rounded-md border border-line px-4 py-2 text-sm font-medium transition hover:bg-paper disabled:opacity-40"
        @click="run"
      >
        {{ running ? 'Running…' : 'Run' }}
      </button>
    </div>

    <pre
      v-if="output"
      class="mt-4 overflow-x-auto rounded-md bg-ink p-4 text-xs leading-relaxed text-white"
      >{{ output }}</pre
    >
  </section>
</template>

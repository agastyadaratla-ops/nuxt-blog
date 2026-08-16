<script setup lang="ts">
/**
 * TEMPORARY. Delete once the insert-policy problem is understood.
 *
 * Runs the failing insert two ways — through the app's Supabase client, and
 * through a hand-built fetch carrying the access token explicitly. Comparing
 * the two says whether the token is being rejected or simply never attached,
 * without needing anything installed in the database.
 */
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const config = useRuntimeConfig().public.supabase

const output = ref('')
const running = ref(false)

function row(tag: string) {
  return {
    title: `RLS diagnostic ${tag}`,
    slug: `rls-diagnostic-${tag}-${Date.now()}`,
    excerpt: '',
    content: '',
    cover_url: null,
    published: false,
    author_id: user.value?.id ?? '',
  }
}

async function run() {
  running.value = true
  const lines: string[] = []

  try {
    const { data: sessionData } = await supabase.auth.getSession()
    const session = sessionData.session

    lines.push(`app user.id      : ${user.value?.id ?? '(null)'}`)
    lines.push(`session present  : ${session ? 'yes' : 'NO'}`)

    if (!session) {
      lines.push('')
      lines.push('No session in the browser — that alone explains the rejection.')
      output.value = lines.join('\n')
      return
    }

    const expiresAt = (session.expires_at ?? 0) * 1000
    lines.push(`token expired    : ${expiresAt < Date.now() ? 'YES' : 'no'}`)

    // Decode the claims locally (no verification — we only want role and sub).
    const [, payload] = session.access_token.split('.')
    if (payload) {
      const claims = JSON.parse(
        atob(payload.replace(/-/g, '+').replace(/_/g, '/')),
      )
      lines.push(`jwt sub          : ${claims.sub}`)
      lines.push(`jwt role         : ${claims.role}`)
      lines.push(
        `sub matches app  : ${claims.sub === user.value?.id ? 'YES' : 'NO'}`,
      )
    }

    // Does the auth server still accept this token?
    const { data: verified, error: verifyError } = await supabase.auth.getUser()
    lines.push(
      verifyError
        ? `token accepted   : NO — ${verifyError.message}`
        : `token accepted   : yes (${verified.user?.id})`,
    )

    lines.push('')

    // --- A: the real code path ---------------------------------------------
    const { error: clientError } = await supabase.from('posts').insert(row('a'))
    lines.push(
      clientError
        ? `A supabase-js    : FAILED ${clientError.code} — ${clientError.message}`
        : 'A supabase-js    : SUCCEEDED',
    )

    // --- B: same insert, token attached by hand ----------------------------
    const response = await fetch(`${config.url}/rest/v1/posts`, {
      method: 'POST',
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(row('b')),
    })
    const responseBody = await response.text()
    lines.push(
      response.ok
        ? 'B manual fetch   : SUCCEEDED'
        : `B manual fetch   : FAILED ${response.status} — ${responseBody}`,
    )
  } catch (error) {
    lines.push(`threw: ${(error as Error).message}`)
  } finally {
    output.value = lines.join('\n')
    running.value = false
  }
}
</script>

<template>
  <section class="mt-10 rounded-lg border border-dashed border-line p-5">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h2 class="font-medium">RLS diagnostic</h2>
        <p class="mt-0.5 text-sm text-muted">
          Temporary — nothing to install, just press Run.
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

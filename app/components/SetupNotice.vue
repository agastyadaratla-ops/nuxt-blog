<template>
  <div class="rounded-lg border border-line bg-surface p-8">
    <h2 class="font-serif text-2xl font-semibold">Almost there</h2>
    <p class="mt-2 text-muted">
      This blog needs a Supabase project before it can store anything. Three
      steps:
    </p>

    <ol class="mt-6 space-y-4 text-sm">
      <li class="flex gap-3">
        <span
          class="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent"
          >1</span
        >
        <span>
          Open your Supabase project →
          <strong>SQL Editor</strong> → paste in
          <code class="rounded bg-line px-1 py-0.5">supabase/schema.sql</code>
          and run it.
        </span>
      </li>
      <li class="flex gap-3">
        <span
          class="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent"
          >2</span
        >
        <span>
          Copy your Project URL and anon public key from
          <strong>Project Settings → API Keys</strong> into the
          <code class="rounded bg-line px-1 py-0.5">.env</code> file.
        </span>
      </li>
      <li class="flex gap-3">
        <span
          class="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent"
          >3</span
        >
        <span>
          Create your author account under
          <strong>Authentication → Users → Add user</strong>, then restart
          <code class="rounded bg-line px-1 py-0.5">npm run dev</code>.
        </span>
      </li>
    </ol>
  </div>
</template>

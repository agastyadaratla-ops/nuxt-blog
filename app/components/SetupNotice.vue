<template>
  <div class="border-t border-line pt-10">
    <p class="label">Setup required</p>
    <h2 class="display mt-3 text-3xl">Almost there</h2>
    <p class="mt-3 max-w-[52ch] text-ink-soft">
      This blog needs a Supabase project before it can store anything.
    </p>

    <ol class="mt-10 border-t border-line">
      <li class="grid gap-x-6 gap-y-2 border-b border-line py-6 md:grid-cols-12">
        <span class="label md:col-span-3">Step 01</span>
        <span class="md:col-span-9">
          Open your Supabase project → <strong>SQL Editor</strong> → paste in
          <code class="bg-line px-1 py-0.5 text-sm">supabase/schema.sql</code>
          and run it.
        </span>
      </li>

      <li class="grid gap-x-6 gap-y-2 border-b border-line py-6 md:grid-cols-12">
        <span class="label md:col-span-3">Step 02</span>
        <span class="md:col-span-9">
          Copy your Project URL and anon public key from
          <strong>Project Settings → API Keys</strong> into the
          <code class="bg-line px-1 py-0.5 text-sm">.env</code> file.
        </span>
      </li>

      <li class="grid gap-x-6 gap-y-2 border-b border-line py-6 md:grid-cols-12">
        <span class="label md:col-span-3">Step 03</span>
        <span class="md:col-span-9">
          Create your author account under
          <strong>Authentication → Users → Add user</strong>, then restart
          <code class="bg-line px-1 py-0.5 text-sm">npm run dev</code>.
        </span>
      </li>
    </ol>
  </div>
</template>

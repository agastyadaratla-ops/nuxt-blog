<script setup lang="ts">
/**
 * Static rather than a database post: this is the site's identity, not an
 * entry in it. It shouldn't need the editor, and it shouldn't appear in the
 * post list.
 */
interface Method {
  step: string
  title: string
  body: string
}

const method: Method[] = [
  {
    step: '01',
    title: 'The goal',
    body: 'What I set out to build, and why it seemed worth building in the first place. Context before code.',
  },
  {
    step: '02',
    title: 'The decisions',
    body: 'Which approach I picked and, more usefully, the ones I rejected. A choice without its alternatives is just an assertion.',
  },
  {
    step: '03',
    title: 'What went wrong',
    body: 'The dead ends, the wrong assumptions, the parts that quietly did not work. Written down in full, including the embarrassing ones.',
  },
  {
    step: '04',
    title: 'The fix',
    body: 'What the cause actually turned out to be, usually not what I first suspected, and what it took to get past it.',
  },
]

useHead({
  title: 'About',
  meta: [
    {
      name: 'description',
      content:
        'Agastya Daratla. Documenting computer science and electronics projects, including the reasoning, the mistakes, and the fixes.',
    },
  ],
})
</script>

<template>
  <div>
    <HeroScene mark="00" class="py-6">
      <header class="grid gap-x-6 gap-y-4 md:grid-cols-12">
        <p class="label md:col-span-3 md:pt-3">About</p>

        <div class="md:col-span-9">
          <RevealText
            text="Agastya Daratla"
            as="h1"
            class="display text-5xl sm:text-6xl"
          />
          <ScrollReveal :delay="0.25">
            <p class="mt-5 max-w-[54ch] text-lg leading-relaxed text-ink-soft">
              I build things with computers and circuits, and I write down how
              it actually went.
            </p>
          </ScrollReveal>
        </div>
      </header>
    </HeroScene>

    <ScrollReveal>
      <section class="mt-20 grid gap-x-6 gap-y-4 border-t border-line pt-10 md:grid-cols-12">
        <h2 class="label md:col-span-3">Why this exists</h2>

        <div class="prose-post max-w-[62ch] md:col-span-9">
          <p>
            This blog is documentation. Every project I take on, software or
            electronics, gets written up here, and not as a tidy tutorial
            where everything works on the first try.
          </p>
          <p>
            Most write-ups show you the finished thing. I find the finished
            thing is the least interesting part. What I want to record is the
            path to it: the option I chose, the ones I turned down, and the
            reasoning that separated them. Then the part where it broke, which
            is usually where the real understanding happens.
          </p>
          <p>
            If you are working on something similar, I would rather you leave
            with my reasoning than my code. Code stops applying the moment your
            problem differs slightly. Reasoning travels.
          </p>
        </div>
      </section>
    </ScrollReveal>

    <section class="mt-20">
      <ScrollReveal>
        <div class="grid gap-x-6 gap-y-4 border-t border-line pt-10 md:grid-cols-12">
          <h2 class="label md:col-span-3">How each post is built</h2>
          <p class="max-w-[54ch] text-ink-soft md:col-span-9">
            Four parts, in this order, every time.
          </p>
        </div>
      </ScrollReveal>

      <ol class="mt-10">
        <ScrollReveal v-for="item in method" :key="item.step">
          <li class="grid gap-x-6 gap-y-2 border-t border-line py-8 md:grid-cols-12">
            <span class="label md:col-span-3">{{ item.step }}</span>

            <div class="md:col-span-9">
              <h3 class="display text-2xl">{{ item.title }}</h3>
              <p class="mt-2 max-w-[58ch] leading-relaxed text-ink-soft">
                {{ item.body }}
              </p>
            </div>
          </li>
        </ScrollReveal>
      </ol>
    </section>

    <ScrollReveal>
      <section class="mt-20 grid gap-x-6 gap-y-4 border-t border-line pt-10 md:grid-cols-12">
        <h2 class="label md:col-span-3">What I work on</h2>

        <div class="md:col-span-9">
          <dl class="grid gap-8 sm:grid-cols-2">
            <div>
              <dt class="display text-2xl">Computer science</dt>
              <dd class="mt-2 max-w-[36ch] leading-relaxed text-ink-soft">
                Software I build to solve a problem I actually have, and the
                architecture arguments I have with myself along the way.
              </dd>
            </div>

            <div>
              <dt class="display text-2xl">Electronics</dt>
              <dd class="mt-2 max-w-[36ch] leading-relaxed text-ink-soft">
                Circuits and hardware, where the failures are more physical and
                the debugging is a great deal less forgiving.
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </ScrollReveal>

    <ScrollReveal>
      <section class="mt-20 border-t border-line pt-10">
        <p class="display max-w-[24ch] text-3xl sm:text-4xl">
          Start with the most recent build.
        </p>
        <NuxtLink to="/" class="btn mt-8">Read the posts</NuxtLink>
      </section>
    </ScrollReveal>
  </div>
</template>

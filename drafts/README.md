# Post drafts

Three write-ups, one per project.

`01-nura.html` and `02-snake-gesture.html` are **finished**, ready to paste
and publish. `03-norvik-os.html` is still a draft with gaps marked.

## How to publish one

1. Open the `.html` file in a browser (double click it).
2. Select all, copy.
3. Paste into the editor at `/admin/new`. Formatting survives, because the
   clipboard carries the HTML and not just the text.
4. Fill in the title and excerpt below, add a cover, publish.

## Titles and excerpts

**`01-nura.html`**

- Title: `The first version measured the room`
- Excerpt: `NURA scores your skin from a webcam frame without the image ever
  leaving your device. The hard part was not the privacy. It was that raw
  brightness describes your lamp far better than it describes your face.`

**`02-snake-gesture.html`**

- Title: `Counting fingers instead of classifying gestures`
- Excerpt: `Snake, steered by holding fingers up to a webcam. Four
  comparisons replace a gesture classifier, and the controls feel forgiving
  because of a timing mismatch I did not design.`

**`03-norvik-os.html`** (still a draft)

- Title: `Four kilobytes of operating system`
- Excerpt: `Norvik 0.0.1 boots under GRUB and writes to the screen. What that
  actually takes, and three bugs I found reading it back.`

## What is asserted in these, and what is not

Every technical claim comes from something checkable: the source, the commit
messages, or the project README.

The reasoning is written as technical justification for decisions the code
shows were made. It does not invent personal history. There are no anecdotes,
no timelines, and no abandoned attempts that are not in the commit log,
because none of that is recoverable from a repository.

Two passages are inference rather than record, and are worth a look before
publishing:

- **NURA, "A decision I reversed".** The commits show affiliate links added
  and later removed. Why is not recorded anywhere, so the paragraph gives the
  obvious reason. If that was not your reason, rewrite it or cut the section.
- **NURA, "The tell is that the same face scores differently in two rooms."**
  That is the defining property of the flaw, not a claim about how you
  personally spotted it.

## One thing to check before publishing the Norvik post

It claims the screen prints `" - Welcome.1"` rather than
`"Norvik 0.0.1 - Welcome."`, because `print` resets its cursor on every call.
That was verified by simulating the VGA buffer against the real `kernel.c`
logic, but it is your project, so confirm it in QEMU before publishing a bug
report about your own code.

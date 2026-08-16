# Post drafts

Three write-ups, one per project. **Drafts, not finished posts.**

## How to use one

1. Open the `.html` file in a browser (double click it).
2. Select all, copy.
3. Paste into the editor at `/admin/new`. Formatting survives the paste,
   because the clipboard carries the HTML, not just the text.
4. Set the title, excerpt and cover, then edit.

## What these are, and what they are not

Everything asserted in them is taken from something checkable: the code, the
commit messages, or the README of the project in question. Where a technical
claim is made, it came from reading the source.

What they cannot contain is your reasoning. Why you picked an approach, what
you tried first, what you abandoned, and what it felt like when something
broke are not recoverable from a repository, and inventing them would defeat
the point of a blog about how the work actually went.

So every draft has `[Your turn: ...]` markers where that reasoning belongs.
Those are the parts worth writing. Delete the markers as you fill them in.

## The three

| File | Project | The story it hangs on |
|---|---|---|
| `01-nura.html` | nura-skin | The first analysis measured the room's lighting instead of the face, and the rebuild that fixed it |
| `02-snake-gesture.html` | Snake-Gesture-Game | Counting fingers geometrically rather than classifying gestures, and two loops running at different speeds |
| `03-norvik-os.html` | Norvik-OS | What four kilobytes of bare metal actually does, plus three open bugs found while reading it back |

## One thing to check before publishing the Norvik post

It claims the screen prints `" - Welcome.1"` rather than
`"Norvik 0.0.1 - Welcome."`, because `print` resets its cursor on every call.
That was verified by simulating the VGA buffer against the real `kernel.c`
logic, but it is your project, so confirm it in QEMU before publishing a bug
report about your own code.

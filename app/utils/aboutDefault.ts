/**
 * What the About page shows before it has ever been edited, and what the
 * editor is seeded with the first time it is opened.
 *
 * Having a default means the page is never blank: if the row does not exist,
 * or Supabase is unreachable, readers still get something coherent.
 */
export const DEFAULT_ABOUT_HTML = `
<p>I build things with computers and circuits, and I write down how it actually went.</p>
<p>This blog is documentation. Every project I take on, software or electronics, gets written up here, and not as a tidy tutorial where everything works on the first try.</p>
<p>Most write-ups show you the finished thing. I find the finished thing is the least interesting part. What I want to record is the path to it: the option I chose, the ones I turned down, and the reasoning that separated them. Then the part where it broke, which is usually where the real understanding happens.</p>
<p>If you are working on something similar, I would rather you left with my reasoning than my code. Code stops applying the moment your problem differs slightly. Reasoning travels.</p>
<h2>How each post is built</h2>
<p>Four parts, in this order, every time.</p>
<ol>
<li><strong>The goal.</strong> What I set out to build, and why it seemed worth building in the first place.</li>
<li><strong>The decisions.</strong> Which approach I picked and, more usefully, the ones I rejected. A choice without its alternatives is just an assertion.</li>
<li><strong>What went wrong.</strong> The dead ends, the wrong assumptions, and the parts that quietly did not work, including the embarrassing ones.</li>
<li><strong>The fix.</strong> What the cause actually turned out to be, usually not what I first suspected, and what it took to get past it.</li>
</ol>
<h2>What I work on</h2>
<p><strong>Computer science.</strong> Software I build to solve a problem I actually have, and the architecture arguments I have with myself along the way.</p>
<p><strong>Electronics.</strong> Circuits and hardware, where the failures are more physical and the debugging is a great deal less forgiving.</p>
`.trim()

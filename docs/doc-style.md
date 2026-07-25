# Doc style — Tallee

> How docs are written in this repo. It obeys its own rules.

**A doc must fit in the reader's head.** Keep it short enough to hold in working memory — a reader should
never scroll back to recall what an earlier part said. Length follows meaning: there is no word cap, but
there is no room for a sentence that doesn't change a decision.

## Rules

- **Shortest version that keeps the core meaning.** Cut asides, hedges, and repetition. If removing a
  sentence loses nothing a reader would act on, remove it.
- **Current truth only.** Describe how things are, or the committed target — never plans, status, or
  history. Those live in the issue tracker and in git. No status labels ("locked", "final"), no changelog.
- **Structure over prose where it earns its keep.** A table or list for enumerable, comparable facts
  (fields, options, mappings); prose for reasoning and nuance. Don't shred genuine reasoning into bullets,
  and don't bury a comparison inside a paragraph.
- **Nothing that rots.** No code, types, or signatures that must mirror the codebase — describe shape and
  intent, and let the code be its own source of truth. A doc should survive a refactor untouched.
- **No ceremony, no clutter.** Drop legal and naming-strategy asides, speculative numbers, and example
  lists posing as commitments. State the quality bar intrinsically, not by naming another product.
- **One doc, one job.** Clear scope per doc; a fact lives in exactly one place — cross-link, don't repeat.
- **Open with one line on what the doc is** (the purpose line, like the one above), so a reader knows at a
  glance whether to read on.

## The test

Read the doc once, top to bottom. If you had to scroll back to hold the thread, or you skimmed a paragraph
and lost nothing, it's too long. Cut until it reads in one pass.

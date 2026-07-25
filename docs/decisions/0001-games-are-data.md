# 0001. A game is data, not code

- **Status:** Accepted
- **Date:** 2026-07-24

## Context

Tallee's core promise is that it *knows* many games — not one, and not a blank counter the user
reconfigures. The naïve implementation grows a `switch (gameType)` through every feature: scoring, round
structure, teaching hints, help text, and eventually camera capture. That branch is touched by every new
game and every new feature, so it becomes the codebase's central bottleneck and its richest source of
regressions. A scoring bug is also a broken brand promise ("Tallee is always right"), so correctness must
be structurally defensible, not vigilance-dependent.

## Decision

A game is a **declarative `GameDefinition`** — a data object plus one small pure `score` function — that a
generic engine runs. Adding a game means authoring that definition; it never means editing the engine or
adding a branch on game type. "Which game?" is a registry lookup (`games.get(id)`).

The engine does not dispatch on the game. It dispatches on a **scoring archetype** — a small, bounded set
(`accumulator`, `counter`, `ledger`) that captures *how score works*. Adding a game selects an archetype
and parameters; adding an archetype is a rare, deliberate engine extension. See
[`../architecture.md`](../architecture.md) → "Core: games are data" and "Scoring archetypes".

## Consequences

- Multi-game support, progressive-disclosure teaching, per-game rules, camera opt-in, and the commercial
  library all fall out of one design instead of five features.
- New sellable value is a new definition, not new screens — the business model and the architecture
  reinforce each other ([`0005`](./0005-serverless-local-first-memory.md), `product.md`).
- The only per-game code is a pure `score` function, which is trivially unit-testable — correctness is
  structural.
- Cost: the engine's generic interfaces must be designed carefully up front, and archetypes that don't fit
  a future game (already anticipated: `counter`, `ledger`) require real engine work, not just data.

## Alternatives considered

- **One class per game (polymorphism).** Familiar, but every cross-cutting feature still fans out across N
  classes, and teaching/help/capture leak into each. Rejected.
- **A full runtime game-definition DSL** (rules as interpreted expressions). Maximum flexibility, but
  speculative complexity with no v1 consumer; deferred until a custom-game builder actually needs it.
- **A giant `switch` on game type.** The status-quo scorekeeper pattern; the exact bottleneck this
  decision exists to avoid.

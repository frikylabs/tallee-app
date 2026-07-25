# 0002. Event-sourced, host-authoritative core on player slots

- **Status:** Accepted
- **Date:** 2026-07-24

## Context

Tallee must be a complete single-device scorekeeper on day one, yet also grow into local multiplayer
(a shared live board across phones in the room) and a group memory that syncs peer-to-peer — without a
rewrite at each step. It also needs paper's real superpowers: correcting a past round after the fact,
undo, and never losing an entry to a phone call or an app kill mid-round. And some games have
per-device hidden information (a simultaneous secret bid) that a mutate-in-place model can't express
cleanly.

## Decision

State changes only through a stream of **commands** (`SubmitRoundInput`, `AmendRoundInput`, `UndoLast`,
`RetireSlot`, `PromoteHost`, …) reduced into state: `(state, command) → state`. One authority — the
**host** — validates and applies commands; every other device holds a replica and *mirrors*
host-computed state (commands flow up, derived state flows down).

A player is a **device-agnostic slot**: either *claimed* by a joined device or *host-managed* (the
scorekeeper enters for it). Pass-and-play is every slot host-managed; local multiplayer is clients
sending the same commands over a transport. Whether a slot is device-bound is a presentation fact, never
a branch in the engine. See [`../architecture.md`](../architecture.md) → "Host-authoritative core &
player slots".

## Consequences

- Pass-and-play, local multiplayer, and later online play are the **same engine at different transports** —
  multiplayer is a transport problem, not a rewrite ([`0003`](./0003-react-native-expo-client.md),
  [`0005`](./0005-serverless-local-first-memory.md)).
- Every committed value is a persisted command, so an interruption mid-round loses nothing; undo and
  post-hoc amendment are natural (compensating events), not bolted on.
- Hidden information is a command the host holds private until a reveal — expressible, where a
  mutate-in-place model would have to fake it.
- Because replicas mirror rather than recompute, a definition-version skew between phones cannot silently
  diverge the shared board; definitions are pinned per game at deal time.
- Cost: more upfront design than mutable state (command/event taxonomy, reducer discipline, a log format
  frozen early), and a strict rule that UI never mutates state directly.

## Alternatives considered

- **Mutable in-place state with observers.** Simplest for single-device, but multiplayer, undo, post-hoc
  correction, and hidden info each become special cases, and networked play would be a rewrite. Rejected.
- **A client-server authoritative backend.** Clean authority, but demands an account and a server —
  contradicting the serverless, local-first stance ([`0005`](./0005-serverless-local-first-memory.md)).

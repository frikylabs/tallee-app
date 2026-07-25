# 0005. Serverless, local-first, gossiped group memory

- **Status:** Accepted
- **Date:** 2026-07-24

## Context

"The table has a memory" is Tallee's durable moat — head-to-head records, streaks, and rivalries across
nights. The obvious implementation is a backend with accounts. But an account is friction at exactly the
moment that must be frictionless (a guest sitting down), a server is an ongoing cost a one-time-purchase
scorekeeper can't fund, and the board-game audience resents rented utilities and data collection. Privacy
is also a genuine selling point in a paid app.

## Decision

Tallee is **local-first and serverless**: no account, no cloud, no server ever holds the truth. State and
group history persist on-device. Identity has two layers — a disposable per-install **device** UUID and a
**person** (0..n devices) that history attaches to. Each finished game is an immutable, globally-uniquely
keyed **event**; because the core is event-sourced ([`0002`](./0002-event-sourced-host-authoritative-core.md)),
merging two devices' logs is a conflict-free union. When the group is in a room, their phones **gossip and
reconcile** histories over the local link — *playing together is the sync*. Deletion, revision, and person
-aliasing are themselves events (tombstones win on merge), and this log format is frozen with the first
event. See [`../architecture.md`](../architecture.md) → "Identity & group memory".

## Consequences

- Zero friction to join and zero running cost; a clean "Data Not Collected" privacy posture that doubles
  as marketing.
- Under EU law the developer never processes the data (players gossip in a personal/household capacity),
  so no controller obligations — a position that **any future online sync tier would void**, making sync's
  true cost explicit.
- Hard problems are accepted as the price: conflict-free merge semantics for the *whole* log, human-in-the
  -loop "same person?" confirmations, island merges, signed tombstones, and best-effort (honestly hedged)
  coverage for absence-asserting insights — none can be retrofitted onto a frozen format, so all are
  designed in from day one.
- Cross-device sync for a *single* user is explicitly out of scope, since it is the one feature that would
  reintroduce a server.

## Alternatives considered

- **Cloud backend with accounts.** Simplest consistency and cross-device sync, but adds friction, cost,
  data-controller liability, and contradicts the privacy stance. Reserved only for a future, separately
  -priced online tier.
- **Local-only, no gossip** (history never leaves the one host phone). Simpler, but loses the shared,
  convergent group memory that is the actual moat. Rejected.

# 0004. Ship the accumulator archetype first

- **Status:** Accepted
- **Date:** 2026-07-24

## Context

[`0001`](./0001-games-are-data.md) establishes that the engine dispatches on a bounded set of scoring
archetypes: `accumulator` (discrete rounds → per-player delta → summed), `counter` (a live tally nudged
toward a target, with transferable bonuses and hidden components), and `ledger` (running balances with
transfers, buy-in/cash-out). Implementing all three before shipping anything would delay a playable
product for the sake of games that are not the wedge — and `ledger` carries real-money bookkeeping that
raises an App Store age-rating question best deferred.

## Decision

v1 implements **`accumulator` only**. `counter` and `ledger` are treated as **shaping constraints**: the
engine's interfaces must not foreclose them, so they can later land as *new archetypes* rather than engine
surgery — but no `counter`/`ledger` code ships until a game that needs it does. The flagship v1 games and
the generic tracker are all accumulators. See [`../architecture.md`](../architecture.md) → "Scoring
archetypes".

## Consequences

- A complete, playable scorekeeper ships far sooner, focused on the games that prove the soul.
- The interface-level obligation to *keep* `counter`/`ledger` viable is a real design tax on every engine
  interface — accepted deliberately, because retrofitting archetype support later would be the expensive
  rewrite this avoids.
- The real-money `ledger` questionnaire is postponed to when a ledger game is actually built, not carried
  as risk now.

## Alternatives considered

- **Implement all three archetypes up front.** Maximum coverage, but delays the wedge and front-loads the
  `ledger` age-rating problem for no near-term payoff. Rejected.
- **Hard-code the first games directly** (skip the archetype abstraction for v1). Faster to first pixels,
  but throws away the whole reason for [`0001`](./0001-games-are-data.md) and guarantees a rewrite the
  moment a third game arrives. Rejected.

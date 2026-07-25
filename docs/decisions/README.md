# Architecture Decision Records

This directory records the significant, hard-to-reverse decisions behind Tallee — the *why* that a
codebase alone can't show. Each record is immutable once accepted: a later decision that overturns an
earlier one is a **new** ADR that marks the old one *Superseded*, so the reasoning trail is never
rewritten.

Format is a lightweight [MADR](https://adr.github.io/madr/)-style: Context → Decision → Consequences →
Alternatives considered. Files are numbered and never renumbered.

New architectural decisions get an ADR as part of the change that introduces them (see
[`CONTRIBUTING.md`](../../CONTRIBUTING.md) → Definition of Done). Copy [`_template.md`](./_template.md)
to `NNNN-short-title.md`.

## Index

| # | Decision | Status |
|---|---|---|
| [0001](./0001-games-are-data.md) | A game is data, not code | Accepted |
| [0002](./0002-event-sourced-host-authoritative-core.md) | Event-sourced, host-authoritative core on player slots | Accepted |
| [0003](./0003-react-native-expo-client.md) | React Native + Expo for the client | Accepted |
| [0004](./0004-accumulator-first-archetype.md) | Ship the accumulator archetype first | Accepted |
| [0005](./0005-serverless-local-first-memory.md) | Serverless, local-first, gossiped group memory | Accepted |

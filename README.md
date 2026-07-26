# Tallee

**Sit down. Your table's already here.**

Tallee is a mobile scorekeeper for game night that already knows how your games are scored, teaches the
rules as you play, and remembers the group across nights — so the table is all play and no admin. It is
built as a polished, local-first iOS product (Android to follow), not a generic score counter.

> **Status:** in active development, pre-launch.

## Why it's different

A pen-and-paper grid knows nothing; the humans supply all the intelligence. Tallee supplies it instead:

- **Knows your games.** Name the game and its scoring, round structure, and helpers are already set up —
  not a blank counter you reconfigure every night.
- **Teaches as you play.** Rules and hints surface the first time a field is used, then never nag again.
- **Remembers the group.** Head-to-head records, streaks, and rivalries build a history worth opening —
  stored only on the players' own phones, with no account and no server.
- **Reads the table (later).** For supported games, point the camera and Tallee reads the state — dice
  pips first, cards later.
- **Local multiplayer that just appears (later).** Sit down near a game in progress and your phone finds
  it — no codes, no logins, no Wi-Fi network required.

Every screen is held to a deliberate bar: **minimal** (nothing on screen that isn't useful) and
**last-1% polish** (cohesive, alive motion). See [`docs/design.md`](./docs/design.md).

## Architecture at a glance

Two decisions carry the whole system (full detail in [`docs/architecture.md`](./docs/architecture.md),
rationale in the [decision records](./docs/decisions/)):

- **A game is *data*, not code.** A game is a declarative `GameDefinition` the engine runs — adding a game
  is authoring a data object plus one pure `score` function, never editing the engine or branching on game
  type. The engine dispatches on a small, bounded set of **scoring archetypes** (accumulator, counter,
  ledger), so multi-game support, per-game teaching, and the camera all fall out of one design.
- **The core is event-sourced and host-authoritative.** State changes only through a stream of commands
  reduced into state, on **device-agnostic player slots**. This makes pass-and-play, local multiplayer,
  and a serverless gossiped group memory the *same* engine at different transports — never a rewrite.

The `score` and insight functions are the one place a bug is silent, so they are pure and exhaustively
unit-tested.

## Tech stack

- **React Native + Expo** (dev build) — one codebase toward iOS and Android.
- **Reanimated** (UI-thread animation) · **Skia** (GPU canvas for the living leaderboard) ·
  **Gesture Handler** · **Moti** · **Expo Haptics** · **Vision Camera** (later).
- **TypeScript** throughout; **Jest** + React Native Testing Library; **Maestro** for E2E flows.
- **EAS Build** → TestFlight → App Store.

## Documentation

| Doc | What it covers |
|---|---|
| [`docs/product.md`](./docs/product.md) | Vision, pillars, multiplayer tiers, monetization, positioning |
| [`docs/design.md`](./docs/design.md) | The taste anchor: motion, the hero board, the close, the visual system |
| [`docs/architecture.md`](./docs/architecture.md) | The engine, identity/memory model, transports, verification |
| [`docs/decisions/`](./docs/decisions/) | Architecture Decision Records |
| [`docs/doc-style.md`](./docs/doc-style.md) | How docs in this repo are written |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | How work is organized and what "done" means |

## Getting started

Requires macOS with Xcode and its command line tools, Node 22+, pnpm and CocoaPods.

```bash
pnpm install    # flat node_modules — see pnpm-workspace.yaml for why
pnpm ios        # generate the native project, compile it, install it on a simulator
pnpm start      # the everyday loop: dev server only, then open the installed app
```

`pnpm ios` is needed the first time and whenever the **native** surface changes — a new native dependency,
an edit to `app.json`, icons, or permissions. Everything else is JavaScript served live to the installed
build, so `pnpm start` is the loop you live in. `ios/` and `android/` are generated build output and are
not committed.

```bash
pnpm lint && pnpm format && pnpm typecheck
```

### On a physical device

```bash
pnpm ios --device    # pick a connected iPhone, then build, install and launch
```

Two things are set up by hand, once. Sign an Apple ID into **Xcode → Settings → Accounts** — a free
account is enough, and no project is ever opened in Xcode. Then, the first time a build lands on a given
phone, trust the developer certificate on the device itself under **Settings → General → VPN & Device
Management**; iOS installs an untrusted build but refuses to launch it.

Signing is deliberately left out of `app.json`. With no `ios.appleTeamId` the CLI resolves the local
signing identity itself and grants the build permission to register the device and issue a provisioning
profile. Pinning a team instead makes it treat signing as already handled and skip that step, and the
build then fails for want of a matching profile. On a free account the profile expires after seven days,
after which the app stops launching until it is rebuilt.

## License

Proprietary — all rights reserved. See [`LICENSE`](./LICENSE). This repository is readable for evaluation;
the code is not licensed for reuse or redistribution.

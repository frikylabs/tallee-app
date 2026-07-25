# 0003. React Native + Expo for the client

- **Status:** Accepted
- **Date:** 2026-07-24

## Context

Tallee is iOS-first but **Android is an explicit goal** — the board-game audience is not iOS-only, and
maintaining two native codebases for a solo-scale project is untenable. At the same time the product's bar
is *last-1% polish*: a living, animated leaderboard at 60/120fps is the signature, so the stack cannot
be one that makes rich motion a fight. The riskiest platform feature (local peer-to-peer proximity) needs
real native APIs regardless of framework.

## Decision

Build the client in **React Native + Expo**, using a **dev build** (not Expo Go, since native modules are
required). The animation stack is **Reanimated** (worklets on the UI thread) plus **Skia** (GPU canvas for
custom drawing), with **Gesture Handler**, **Moti**, and **Expo Haptics**. Distribution is **EAS Build** →
TestFlight → App Store. See [`../architecture.md`](../architecture.md) → "Stack".

## Consequences

- One codebase serves both platforms; Android is a later target, not a second project.
- Reanimated + Skia give a credible path to the motion bar without dropping to native per screen.
- Expo's managed tooling (EAS, OTA updates) streamlines builds and lets game definitions ship OTA as a
  convenience ([`0001`](./0001-games-are-data.md)) — explicitly never a business-model pillar, given
  Apple's tolerated gray zone.
- Cost: **no maintained production-grade RN module exists for iOS peer-to-peer**, so the proximity
  transport ([`0005`](./0005-serverless-local-first-memory.md)) requires writing a **custom Expo native
  module in Swift** either way. This is a known, scheduled work item, de-risked by a pure-Swift spike
  before it is built in RN.

## Alternatives considered

- **Native Swift (iOS) + Kotlin (Android).** Best possible fidelity and first-class access to the
  peer-to-peer APIs, but two codebases — rejected on maintenance cost for the reach required.
- **Flutter.** Strong rendering and one codebase, but a smaller native-module ecosystem for the exact
  iOS proximity APIs needed, and a less familiar animation model for the target polish. Rejected.
- **A PWA / web wrapper.** No credible access to proximity radios or the native motion/haptics bar.
  Rejected outright.

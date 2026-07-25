# Product — Tallee

> What Tallee is, who it's for, and the one line every screen answers to. The tiebreaker when a scope
> call is in doubt.

## North star

**Tallee knows the game, so you don't have to.**

Pen and paper is a dumb grid — the humans supply all the intelligence: setup, scoring, the rules, the
tallying. Tallee supplies it instead. Every feature is a coat on this stance.

## Who it's for

The group at the table on game night — people who want to *play*, not administrate. The phone-holder is
the scorekeeper; Tallee makes that role effortless and, ideally, invisible. When a choice trades *more
play* against *more feature*, more-play wins.

## Pillars

| Pillar | What it means |
|---|---|
| **Knows your games** | You name the game; its scoring, round structure, and helpers are already set up — not a blank counter you reconfigure every night. |
| **Teaches as you play** | Rules surface the first time they're needed, then never nag again. |
| **Reads the table** | Where supported, the camera reads game state (dice first, cards later) — the summit of "knows the game." |
| **Remembers the group** | Head-to-head records, streaks, and rivalries across nights — a history worth opening. |
| **Does the math you can't** | Live "what you need to win," projected standings, "mathematically eliminated." |

Two non-negotiable manners (see [design](./design.md)): **minimal** (nothing on screen that isn't useful)
and **last-1% polish**.

## One model: the slot

A player is a **slot** — either *claimed* by a joined device or *host-managed* (the scorekeeper taps it
in). This collapses every multiplayer mode into one feature at different fill levels: **pass-and-play is
local multiplayer with zero peers joined**, and a guest who won't install is just a host-managed slot.
Local multiplayer stays local-first — no cloud, no login; only a future online tier would need a backend.

The model earns its place twice: playing together *is* the install channel (a game night of N is N
installs), and per-device hidden information (a simultaneous secret bid) is something paper physically
can't do.

## The open

**There is no join flow.** You sit down, open the app, and your friends' game is already there. The home is
a radar — nearby tables appear on their own, beside *start a night* and the group's history. Setup *is* the
lobby: the host taps in regulars, guests' phones claim their slots as they join, and a QR + spoken room
code are the never-fails floor. Presence is **foreground-only** (privacy and battery). Magic when it can,
certainty always: a denied permission degrades to a host-managed slot — nobody is ever locked out. And the
room recognizes your *friends*, not just the game ("welcome back"), with zero login, because identity is
serverless (see [architecture](./architecture.md)).

## The close

Game over is the emotional bookend, not a standings list. First principle: **restraint** — the app never
performs while the table is still cheering; it's composed and waiting when eyes return. Then the winner
rises and the memory speaks, a line or two, each its own beat, under two rules: a **first-night fallback**
(no history yet → tonight's superlatives, so day one is never empty) and the **kindness rule** (lines
about non-winners only ever punch up). Co-winners by default; a game may declare its own tiebreak (data,
not code). Ending early is a first-class, respectful flow — saved, flagged, no fake trophy. A wrong result
is correctable after the fact, never only erasable. Play-again is one tap and never blocked.

The payoff is a **shareable results card** — a story, not a scoreboard, its headline the best memory line —
rendered per-perspective, so winners and losers alike have something worth sharing.

## Monetization

A **paid app, not a toy**: freemium with a **one-time unlock — no subscription, no ads**. The line that
governs it: **the soul is free; the library is the product.** Recognition, the memory, the close, and
joining are never paywalled — they *are* the distribution. Pro gates which *games a host can start*, never
who can join, never the memory.

**Host-pays, guests-free.** Only the host needs Pro, and only for premium games; guests always play free —
so the people you most want installing hit zero barrier, and the paywall pulls the same direction as
growth instead of fighting it.

**Privacy is architecture and marketing.** Nothing leaves the table: no server, no tracking. The group's
memory lives only on the players' phones, and any player can be forgotten — a clean privacy label is a
real selling point in a paid app.

## Positioning

The store is full of **generic score counters** — every one a blank grid you configure. That's
validating, not threatening: it proves the demand while leaving the "knows-the-game + magical +
remembers-you" tier wide open. That gap is the whole product.

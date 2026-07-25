# Architecture — Tallee

> The load-bearing technical decisions. The central one — **a game is data, not code** — is what makes
> multi-game, no-branching, per-game teaching, and the camera fall out of one design instead of five
> features. The concrete types live in code; this describes the shapes and the *why*.

## Games are data

A game is a **declarative definition** the engine runs. Adding a game is authoring a data object plus one
small pure function — never editing the engine, never a `switch` on game type; "which game?" is a lookup.
This one decision serves five pillars at once: multi-game out of the box, no giant switch, progressive-
disclosure teaching (hints are fields on the definition), per-game rules/help (another field), camera (a
game opts in by declaring a capture capability), and the commercial moat (new value = a new definition,
not new screens). Definitions are TypeScript modules compiled in, occasionally updated OTA; a
runtime-loadable format is deferred until a custom-game builder needs it.

## Scoring archetypes

The axis that varies most is *how score works*. Forcing every game into "per-round input → formula" fits
some games and breaks others, so a definition declares a **scoring archetype** and the engine dispatches
on the archetype — a small, bounded set — not on the game. Adding a game picks an archetype; adding an
archetype is a rare, deliberate engine extension. That is the real "no switch on N games" boundary.

| Archetype | Shape | Ends when |
|---|---|---|
| **accumulator** | discrete rounds; per-player round input → delta; summed | fixed round count **or** first to a target |
| **counter** | a live per-player tally nudged ±; transferable bonus tokens; optional hidden components | first to a target, checked on turn |
| **ledger** | running balances with transfers; buy-in / cash-out | manual session end → net = cash-out − buy-in |

v1 implements **accumulator only**. `counter` and `ledger` are *shaping constraints* — the engine's
interfaces must not foreclose them, so they land later as new archetypes, not engine surgery — but no
code for them ships until a game needs it. For accumulator, a target is checked **at round commit**: the
round always completes, all who crossed compare by total, then `tiebreak`, then co-winners.

## The game definition

A definition carries only data plus one function. What it holds and why:

- **Identity & bounds** — id, localized name, player min/max, whether it has teams, and a `winner`
  direction (highest / lowest).
- **`tiebreak`** — an ordered list of comparators drawn from a closed, **engine-owned** vocabulary of
  round-matrix stats; absent → co-winners. Data, never per-game code.
- **The scoring block**, keyed by archetype. For accumulator: how rounds end (fixed / target / open), the
  **input fields**, cross-player **constraints**, and the pure **`score`** function.
- **Input fields** — the entry UI is *generated* from these, never hand-built per game. Each field
  declares when it's collected (round start / end), its order (sequential vs simultaneous — a bid
  announced knowing prior bids is sequential; parallel entry would change the game), its widget (a number
  strip or pad, never the system keyboard), its context-dependent bounds, and a label.
- **Constraints** — cross-player round invariants from a closed engine-owned vocabulary (e.g. "these
  values sum to the round number", dealer-restricted values), declared as data — never a per-game branch
  in the engine.
- **`score`** — `(input, context) → number`, pure and per-player. The **only** real per-game code, and
  exhaustively unit-tested.
- **Teaching, rules, variants, capture** — hint strings keyed per field (hint-seen tracked per *person*),
  an optional help sheet, house-rule toggles that parameterize the shipped definition, and an optional
  capture capability for the camera.

The **engine** owns everything generic — players, turns, tallies, standings, win detection, undo,
persistence — and knows nothing about any specific game.

## Event-sourced, host-authoritative core

State changes only through a stream of **commands** reduced into state: `(state, command) → state`. One
authority — the **host** — validates and applies; every other device holds a replica.

- **Authority computes; replicas mirror.** Commands flow up, derived state flows down. A guest's own
  engine never scores the live game, so a definition-version skew between phones can't silently diverge
  the shared board. The **definition is pinned per game at deal**, so an OTA landing mid-night never swaps
  rules under a live log.
- **Every committed value is a persisted command** — a call or an app kill mid-round loses nothing;
  reopening resumes exactly where it stopped.
- **Undo is one level deep**: it compensates the last *scoring* command (can reopen a sweep, reverse a
  reorder). Structural commands (claims, retire, promote-host) are never undone, only compensated by their
  own flows. Anything older is an amend, not an undo.
- **Post-hoc correction** is a first-class compensating command — the round-3 fix discovered at round 7,
  host-only. Paper's one superpower, kept.
- **Hidden information** is a command the host holds private until a reveal — natural here, impossible to
  fake cleanly in a mutate-in-place model. It survives host death by **voiding and re-collecting**, never
  leaking; encrypted escrow is a later refinement.
- **The host can die.** Every peer holds a full replica, so a host-handover command is in the v1 protocol
  (UI may ship later); the night must survive the host's battery.

## Player slots

A player is a **device-agnostic slot** — either *claimed* by a joined device (that person enters their own
input and can hold hidden info) or *host-managed* (the scorekeeper enters for them). Pass-and-play is every
slot host-managed; a non-installing guest is one host-managed slot. Whether a slot is device-bound is a
presentation fact, never a branch in the engine.

Slots are an **ordered list = seating order**, arranged to mirror the table and reorderable mid-game (chairs
swap; it's an engine no-op). The **dealer is a rotating index**, advanced each round and carried across
play-again. A person claims with **one device at a time** (a newer claim wins; the older drops to a
view-only mirror). The host may be a non-playing scorekeeper — hosting is a device role, not a seat.
Tallies operate on a **scoring entity** (person *or* team): the entity indirection is core now; actual team
play is later.

## Score entry (the sweep)

Entry is a conversation the definition drives, never a form.

- **Phases come from the definition** (each field's collect-time). The *trigger* is human — someone taps
  the entry hint on the board — but once tapped, the engine knows exactly what it needs, from whom, in
  what order.
- **The dealer's sweep** is the spine: an entry sheet slides over the live board and walks host-managed
  slots in seating order from the dealer's left, one player highlighted at a time, a number strip (never a
  keyboard), one tap → auto-advance.
- **Claimed slots self-enter as a called burst on top of the sweep** — "phones out" — not silent ambient
  input (serverless means no push, and a locked phone holds no session). Awake claimed devices get the
  prompt directly; the host's sweep covers the rest. Host override: long-press any line to enter for a
  player, so a guest never blocks the game; a claimed device may retract and resubmit while the phase is
  open.
- **Validation is constructive.** Impossible values are unenterable rather than flagged (the final entry
  pre-fills the forced remainder; variants grey out forbidden values). Mis-taps are an undo, never an
  eraser.
- A **live running tally** (tap the winner as each sub-round resolves) is a per-game variant feeding the
  same input; the default is the end-of-round sweep.

## Game over: memory, insights, cards

- **The memory event carries the full round matrix** — per-player, per-round deltas, plus variants,
  duration, and final scores/ranks — so comebacks and the recap chart derive from it (final scores alone
  can't say "won after trailing until round 9"). It's tiny and kept forever. It carries a **`nightId`**
  minted by the table session, inherited by every game that night, so history groups a night and "tonight"
  has a boundary; a session ends by explicit end or after idle.
- **`abandoned` flag** — an early end saves the night with no win credited, faint in history. Engine-
  supported, not an app hack.
- **The insight engine is a pure function over the log** → typed candidates (streaks, firsts, rivalries,
  records, and a tonight-superlatives fallback for empty history), each scored for interestingness; the top
  one to three are spoken. **One engine, two moments:** live per-perspective on claimed devices ("you're
  catching up", "mathematically won") and communal at the close. The **kindness rule** governs communal
  surfaces (non-winner lines only punch up); self-facing candidates are exempt on your own device.
  Templates are **ICU MessageFormat-grade** (names, gender, plurals, ordinals) — and unit-tested like
  `score`, because a wrong "first win since April" poisons trust in the whole memory.
- **Coverage guard** (ships with the first close): absence-asserting lines ("first win since…") fire only
  over spans every known group device has synced through; below that bar they degrade to hedged copy
  ("longest streak *we've seen*") rather than going silent; tonight-facts need no coverage. Serverless
  can't prove "never wrong", so the guard's job is *calibrated confidence*.
- **The results card is `render(event, perspective)`** — rendered on-device, perspective neutral or a
  person. v1 ships neutral; personal-angle cards are the same call, not a new system.

## Identity & group memory (serverless)

A stable "you" across nights and devices, with no account and no server. Two layers:

- **Device** — a random UUID per install; disposable, not derived from any hardware id.
- **Person** — the human history attaches to (name, avatar), with 0..n devices. So `person ≠ device`; the
  host's roster maps device → person.

On join, devices exchange UUIDs: a known device greets silently ("welcome back"); a new device prompts the
host to confirm once ("this phone says 'Lea' — the same Lea, or new?"), then caches the binding. Only a
human can assert a new phone is the same person, so we ask exactly once.

**Memory is a conflict-free, gossiped log.** Each finished game is an immutable, globally-uniquely-keyed
event; append-only + unique id means merging two devices' logs is a conflict-free union. Phones joined to
the same table gossip and reconcile — **playing together is the sync**, no server ever holds the truth.

- **Everything gossiped is an event**, not just games — renames, avatar changes, hint-seen, device
  bindings, aliases, tombstones — merged by the same union rule; conflicting scalars resolve
  last-writer-wins by (timestamp, device UUID).
- **Gossip scope** is same-table participants only; a stranger's phone at the next table learns nothing.
- **Deletion is in the merge semantics from day one** — a tombstone is an event and wins on merge, never
  resurrected by a stale peer. Issuer rules (no crypto auth in v1): forget-a-person is self-service (own
  device; the host issues it for host-managed people), while redactions and revisions come only from the
  game's host.
- **Frozen log-format facts** (impossible to retrofit, so decided now): aliasing is a **read-time lens**,
  not a rewrite (events keep original UUIDs; a wrong alias is reversible); forgetting a person
  **anonymizes** — their rows stay under a placeholder so other players' history survives; revisions form
  a chain (latest head wins); ephemeral "just for tonight" guests occupy rows under a UUID never bound to
  an identity; **tombstones are signed** (each device mints a keypair), since the one irreversible,
  self-propagating operation must not ride a spoofable id.

Because no server processes the data, players gossip in a personal/household capacity — a posture any
online tier would void (see [decisions/0005](./decisions/0005-serverless-local-first-memory.md)). Two
never-met devices that each minted a person for the same human resolve via a single human-confirmed
**island merge**. LAN peers are semi-trusted (same room); a device UUID is a bearer identity and that's
accepted for the threat model.

## Transports

| Transport | Used for | Built |
|---|---|---|
| In-process | pass-and-play (zero peers) | v1 |
| iOS peer-to-peer | local multiplayer + proximity | v1 |
| LAN (host socket + Bonjour) | cross-platform local multiplayer | with Android |
| Relay | online multiplayer | deferred |

Verified truths: the peer-to-peer carrier is **peer-to-peer Wi-Fi (AWDL)**, which needs the Wi-Fi radio
**on** (no router required) — a guest with Wi-Fi off is invisible, so the degraded-state ("turn on Wi-Fi,
no network needed") is a designed screen. **No maintained production RN module exists**, so the transport
means a **custom Expo native module in Swift** — the specific API is a build-time decision. Sessions die
within seconds of backgrounding/lock, so a guest's default state is a **stale mirror**, not a live one.

## Discovery & presence

- **Foreground-only** advertise/scan (privacy + battery). "It just knows" = "it knows the instant you open
  it in the room."
- **Layered discovery:** proximity is the ceiling; a QR + spoken room code are the selection floor; a
  host-managed slot is the floor that never fails. The QR is deliberately dumb — for an app-less guest it's
  just a store link, and proximity finds the table after install.
- **Permissions under the platform's real rules:** nothing is discoverable before the Local Network grant,
  and there is **no API to read that grant's status** — denial is inferred from a probing browse state
  machine. A grant is revocable silently with no callback, so the toggled-off-after-granting state is a
  designed screen. Denial degrades to QR/code with a quiet re-enable, never re-begged.
- **The stale mirror is the guest's default** — the board is honest about it ("as of round 6"), refreshed
  by rejoin-replay on each wake. Same honesty for **host-away**: guests see "board paused"; the host
  session rehydrates instantly from the log on return.
- **Claim-by-identity:** a joining device claims its matching slot (never a duplicate); a guest with no
  match creates a *pending* slot for the host to keep. Slots survive disconnects as *away* (the host scores
  for them), and **rejoin = replay**.
- **Late seating is a definition constraint** (fixed-round games lock after start; target/ledger games may
  allow joining), not an app rule. Leaving is a `RetireSlot` (final for that game — excluded from win
  detection, prior rows kept) — distinct from *away*.

## State & persistence

Local-first, no account, no server (v1 is networked but serverless — devices only ever talk to each other
in the room). A game-in-progress and group history persist on-device in a location covered by the normal
device backup, so a lost phone doesn't lose memory even before gossip. All game logic lives behind the
engine's API; UI is pure presentation over engine state — no rules leak into components.

## Versioning

Phones gossip peer-to-peer with no server to force upgrades and the log is kept forever, so cross-version
compatibility *is* the persistence architecture: every event and command carries a schema version; unknown
event kinds are **preserved and re-gossiped, never dropped** (an old phone is a faithful courier); memory
events are self-contained and **never re-run `score`**, so an amended definition can't rewrite history; the
join handshake checks protocol versions and a mismatch degrades kindly (host-managed slot), never corrupts
a log.

## Camera (later)

On-device only — frame processors feeding an on-device model; nothing leaves the phone. A **frame-source
abstraction is mandatory**: the recognizer takes a frame source, not the live camera, so it runs against
fixture images and is testable and agent-verifiable (simulators have no camera). A game opts in via its
capture field; the recognizer returns structured values fed into the normal round input — an input method,
not a separate code path. Dice first (tractable, proves the pipeline), cards later.

## Stack

React Native + Expo (dev build). **Reanimated** (UI-thread animation), **Skia** (GPU canvas),
**Gesture Handler**, **Moti**, **Expo Haptics**, **Vision Camera** (later). TypeScript throughout;
**Jest** + React Native Testing Library and **Maestro** for E2E; **EAS Build** → TestFlight → App Store.
Rationale in [decisions/0003](./decisions/0003-react-native-expo-client.md).

## Verifying UI

A change isn't done until it's observed through the real seam. Layered, cheapest first:

1. **Component render** (React Native Web + a browser screenshot) — fast for layout and static states, but
   **blind to Skia and native views**.
2. **Simulator/emulator screenshot** — the real renderer; **mandatory for any Skia or native surface**.
3. **E2E** (Maestro) for journeys: setup → play a round → standings update → game over.
4. **Unit** (Jest) for components, and **pure unit tests for every `score` and insight function** — game
   math is the one place a bug is silent and unforgivable.

Honest gaps, never glossed: **motion can't be certified from a still** — the living leaderboard and score
morphs are reported as *"implemented, motion not eye-verified"* until watched on-device. The **camera can't
be verified in a simulator** — it's checked against fixture frames through the frame-source abstraction,
never claimed working off a screenshot.

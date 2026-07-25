# Design — Tallee

> The taste anchor. It replaces adjectives ("clean", "modern") with a stance, so design calls have a
> tiebreaker that isn't momentary preference. This file is the contract.

## The bar: the last 1%

Every motion, transition, and surface looks considered; the whole feels cohesive and alive, not a set of
screens wired together. The standard is the *last 1%* — the fit-and-finish no single user names but that
collectively reads as crafted. Concretely: **every state designed** (empty, first-run, one-player,
mid-game, tie, game-over), motion that eases and reveals (never linear, never janky), **optical alignment
over mathematical**, live values that animate their *change* not just their arrival, haptics that make
input feel physical, and the outer shell (icon, store card, onboarding) treated as part of the product. If
a detail feels accidental, it isn't finished.

## Minimal

If it isn't useful on screen, it isn't on screen — subtraction in service of *play*. The current action
fills the screen; everything else recedes until needed. A control used once per game never sits beside one
used 200× per game.

## Learn by playing

The app teaches itself. A field's helper appears the first time that field is shown, then never again;
hint-seen follows the **person, not the phone** (see [architecture](./architecture.md)). No upfront
tutorial, no manual. A first-timer and a veteran use the same screen — only the veteran stopped seeing the
hints.

## The signature: a living leaderboard

The ranking itself is the app's heartbeat. Standings don't redraw — they *move*: positions ease and
reorder with shared-element continuity, a lead change earns a quiet, deliberate moment. This is where the
motion budget is spent; spend it here, not everywhere.

- **Motion reveals, never decorates.** If an animation doesn't help you understand what changed, cut it.
- **A beat, not a movie.** ~150–300ms, never blocking reading or input. Snappy over showy.
- **Physical.** Every score commit has a haptic; input feels like an instrument, not a form.
- **Respect the body.** Full reduced-motion support — instant, dignified states, never a degraded app.
- **Perf is a constraint.** 60fps (120 on ProMotion) or it doesn't ship; animate transforms/opacity on the
  UI thread, not layout.

## The hero: the in-game board

One screen, phases in time — not panels in space. The flow is: join → ambient poster → commit sweep →
(story on demand) → close.

- **Poster skeleton (ambient).** A live type poster: rank-tiered numeral scale (leader huge), tiny
  uppercase names with identity-color dots, a brass underline and crown on the leader. No cards, no chrome.
  This is the screen for ~90% of the night.
- **Commit sweep.** Scoring a round sweeps a spotlight across the board one player at a time — their line
  brightens, the rest dim, the delta lands, the number ticks. Attention without full-screen takeovers.
- **Living reorder + crown flight.** Reorder and numeral-size morphs play as one motion; a lead change
  sends the crown flying from the old leader to the new — brass, dignified, never confetti.
- **Story, one tap away.** A bump chart of rank-per-round — the night as a shape. It doubles as the
  correction surface: tap a round cell to amend a past entry (host-only; see architecture).
- **Ambient dim.** A live board never sleeps; after ~30s idle it dims to an ember via UI color (never
  hardware brightness), and any touch or score event restores it. Scoped to the host/table device — guests'
  phones follow normal system sleep.
- **Kindness pass.** Rank speaks through scale, but the floor stays legible: no shame type; negative totals
  in normal ink (red/green only for round deltas); the *you* line whispers the gap to the lead — tension
  aimed at hope, not shame.

**Working palette:** near-black violet ground `#0b0a10`, ivory ink `#f1eee6`, brass `#caa057` for
leadership and ceremony, green/red for deltas only, one fixed hue per player.

## The close

Five beats, restraint first — the app never performs while the table is still cheering:

1. The last commit plays out normally, then one long breath. No "GAME OVER" slam.
2. **The rise.** The board recedes; the winner's color washes in, name enormous, final score beneath.
   Co-winners → two crowns.
3. **The memory speaks** — a line or two, each its own beat.
4. **The recap.** The Story chart draws itself start-to-finish in ~3s.
5. **The landing.** The results card; three actions: share, play again (never blocked), done.

Two rules keep it honest at a real table: **every beat is skippable** (a tap advances, a second lands — the
rematch shuffle never fights the choreography), and the landing keeps a **quiet escape** — amend the last
round, recompute the winner, re-run the close. Celebrating the wrong winner with no visible fix would be
the worst version of the flagship moment.

**The card** is a portrait poster in the app's visual system, built to read at a glance in a group chat:
the best memory line as headline, winner + crown + score as hero type, the night's mini bump chart as the
arc, game · date · players small, a quiet wordmark. The share text carries the link — nothing tacky on a
trophy.

## Visual system

- **Shape & depth** — generous radii, soft layered elevation; tactile but quiet. Not flat, not skeuomorphic.
- **Numbers are the hero** — big, confident, **tabular** so animated scores don't jitter as they count.
- **Dark is the design of record**; light is a future first-class destination, never an inverted toggle.
- **Identity colors are a system, not a preference.** Each person gets a hue from a curated,
  colorblind-checked palette (distinguishable on the dark ground); the user picks the emoji, the system
  owns the hue. Colors are the duplicate-name disambiguator and the recognition anchor — too load-bearing
  to be free-picked into collisions.
- **Silent.** Haptics carry the physicality; zero audio — a table has its own soundtrack.
- **Color never carries meaning alone** — rank, turn, and win/loss also encode via shape, position, or
  label.

## Accessibility (designed in, never retrofitted)

- The Skia board is a silent bitmap to VoiceOver, so every canvas surface ships a mirrored
  `accessibilityElements` overlay (rank, name, score, delta; announcements on commit and lead change) —
  part of a Skia surface's definition of done.
- **Dynamic Type:** the poster's scale maps to stepped factors — hierarchy compresses, never truncates.
- **Touch targets ≥44pt**, the number strip included.
- The close narrates its beats in order; reduced motion gets the composed final layout immediately, memory
  lines and all.

## Internationalization

Author copy as **keyed strings from day one**, even while one language ships (target EN / DE / IT). Memory
and insight lines are **ICU MessageFormat-grade** — names, gender, plurals, ordinals — a slot-in-string
template breaks the moment it leaves English. Compound-heavy languages run long: test the longest string,
never the shortest; no fixed-width text containers.

## The "never" list

- Anything that reads as a generic template or dashboard. Never generic is the whole point.
- Chrome that isn't earning its space — settings, chevrons, labels no one uses.
- Motion that decorates, drops frames, or ignores reduced-motion.
- A tutorial wall, a manual, or a settings safari between the user and play.
- Ads. Ever.
- Color as the only carrier of meaning.

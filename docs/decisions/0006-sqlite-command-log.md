# 0006. SQLite as the durable command log

- **Status:** Accepted
- **Date:** 2026-07-26

## Context

The event-sourced core ([`0002`](./0002-event-sourced-host-authoritative-core.md)) appends every committed
value to a durable log, and the serverless memory ([`0005`](./0005-serverless-local-first-memory.md)) keeps
finished games forever and merges peers' logs as a union of uniquely-keyed events. The store's semantics
leak into undo, amend, replay and merge, so swapping it later rewrites the layer everything sits on.

Four candidates were measured on an iPhone 17 Pro (iOS 26): an append-only JSONL file via
`expo-file-system`, `expo-sqlite`, `op-sqlite`, and a log emulated over `react-native-mmkv`. Each appended
10,000 records **individually and durably** — never batched into one transaction, because the engine
commits one command at a time and each must survive a kill immediately afterwards. Reads were measured in
a freshly launched process.

| Store | 10k appends | Per append | Cold read 10k | Survived SIGKILL |
|---|---|---|---|---|
| mmkv | 37.8 ms | 3.8 µs | 15.9 ms | yes, uncorrupted |
| append-only file | 98.3 ms | 9.8 µs | 75.6 ms | yes, uncorrupted |
| op-sqlite | 485.5 ms | 48.5 µs | 10.9 ms | yes, uncorrupted |
| expo-sqlite | 635.5 ms | 63.5 µs | 35.9 ms | yes, uncorrupted |

Interruption was tested rather than assumed: all four were appended round-robin and the process was sent
an uncatchable `SIGKILL` mid-append. Every store ended on a clean record boundary, and the two written
later in each iteration were exactly one record behind — the expected signature of a kill landing inside
an iteration. No store required repair. This proves less than it appears: an append reaches the kernel's
page cache, which outlives the process, so **process death cannot tear a completed write in any of them**.
Only power loss or a kernel panic can, and that case was not reproducible here.

## Decision

**`expo-sqlite`** is the command log, behind the minimal `CommandLog` interface the engine depends on
instead of importing any store directly.

Speed is not the reason and did not decide it. A game night produces a few hundred commands, so the
slowest candidate spends roughly 20 ms across an entire evening and the 16× spread is three orders of
magnitude below perception. The deciding properties are:

- **Merge is the access pattern that matters.** Reconciling two peers is a union over unique ids — a
  `UNIQUE` column and `INSERT OR IGNORE`, rather than reading every record into memory to deduplicate.
- **History is queried, not just replayed.** The insight engine asks for streaks, head-to-heads and
  first-since dates over a log kept forever; that is indexed lookup, not a full parse.
- **It is first-party.** It ships with the SDK and is upgraded with it, where the two faster candidates are
  third-party native dependencies carried across every upgrade.
- **Its durability extends past the case we could test.** Write-ahead logging gives atomic commit against
  power loss, which the measurement deliberately could not demonstrate for anything.

Appends are **synchronous**: all four candidates can append without a promise, so the interface does not
need one. A command that has been reduced into state is already on disk, and no window exists in which
state and log disagree.

## Consequences

- Startup cost grows with a game's log, not with all history: ~36 ms per 10,000 records, and a real game
  is two orders of magnitude smaller.
- The schema is a migration surface a flat file would not have. Records carry a schema version already, so
  version negotiation is unchanged; table shape becomes the thing to migrate.
- The log stops being human-inspectable. Debugging a corrupt log needs a SQLite client rather than `tail`.
- `DELETE` does not reclaim space without `VACUUM`. Irrelevant while the log is append-only, and a trap if
  that ever changes.
- Power-loss durability is assumed from SQLite's guarantees rather than measured. If it ever becomes
  load-bearing, it needs a test this benchmark could not perform.

## Alternatives considered

- **Append-only JSONL file.** The best fit for the raw access pattern — append and read-all — and by far
  the simplest and most inspectable, with no dependency beyond a first-party module. Rejected because both
  merge and insight queries degrade to full scans over a log that is kept forever.
- **`op-sqlite`.** Fastest cold read and faster appends than the platform binding. Rejected as a
  third-party native dependency whose advantage is unmeasurable at real volumes; its prepared statements
  also execute only asynchronously, so it cannot use its own fastest path behind a synchronous interface.
- **`react-native-mmkv`.** Fastest by a wide margin, and no ordering guarantee beyond keys we pad
  ourselves. Rejected because emulating a log over a key-value store gives up exactly the union-merge and
  query properties the memory design needs.

# Contributing to Tallee

How work on Tallee is organized and what "done" means. `docs/product.md` / `docs/design.md` /
`docs/architecture.md` cover *what* and *why*; this file covers *how we work*.

## Ways of working

Tallee is built with **Kanban** — continuous flow rather than fixed sprints, with a **WIP limit of 1–2**
across *In Progress* + *In Review*. The guiding rule is **stop starting, start finishing**: pull the next
item only when the current one is done. Flow is optimized over prediction, so there are no story-point
estimates — see *Estimation* below.

## Issue hierarchy — Epic → Story → Task

Three tiers, using GitHub issue **types** and **sub-issues**:

- **Epic** — a large outcome or major phase of work, tracked on the board. Containers, rarely closed.
  Epics are named for the **outcome** they produce, never for their position in a sequence — ordering is
  what the board expresses, and a name that encodes it goes stale the moment plans move. Shipping
  boundaries are **milestones**, which close; epics are not.
- **Story** — a **vertical slice of user value**, small enough to finish in a few sittings, written as
  *"As a scorekeeper, I want … so that …"* with explicit **acceptance criteria**. This is the unit that
  flows across the board. Slices are always vertical (top-to-bottom through the stack, independently
  demoable) — never horizontal ("all the models", then "all the UI").
- **Task** — a technical sub-item of a story, or a standalone chore.

Every issue is opened from a template in `.github/ISSUE_TEMPLATE`, which sets its type; blank issues
are disabled, so the format never depends on who is typing.

## Definition of Ready

A story may enter the board only when it has acceptance criteria, a small-enough scope (larger than ~an
L → split it), and all its dependencies already exist.

## Definition of Done

Nothing is done until **all** of the following hold:

- Acceptance criteria met.
- The change ships as a **pull request** — never a direct commit to `main` (the sole exception is the
  initial bootstrap commits made before branch protection is enabled).
- **CI is green**: lint, typecheck, and tests all pass.
- **Tests are written.** Pure unit tests for every `score` and insight function are **non-negotiable** —
  game math and memory lines are the two places a bug is silent and damaging.
- **UI evidence, scaled to the surface.** A story that changes a user-visible surface carries screenshot
  evidence per the "eyes" protocol (`docs/architecture.md` → Verifying UI); animation is reported
  honestly as *"implemented, motion not eye-verified"* until watched on-device. A story with no visible
  surface (engine internals, tooling) is screenshot-exempt but must prove it runs (CI green + an
  on-device smoke launch).
- **Reviewed and merged.** Every PR is reviewed against this document, comments addressed, then
  **squash-merged** and the branch **deleted**.
- **Docs updated** when an architectural decision changed (and recorded as an ADR — see
  `docs/decisions/`). Docs follow [`docs/doc-style.md`](./docs/doc-style.md) and stay current-truth —
  plans and status live on the board, not in docs.

## Branching & commits

- Trunk-based: short-lived branches off `main`, prefixed `feat/`, `fix/`, `chore/`, or `docs/`.
- **[Conventional Commits](https://www.conventionalcommits.org/)** — atomic, machine-readable history
  (`feat: add round-input strip widget`).
- **Squash-merge, delete-on-merge.** `main` is protected: no direct pushes, CI must pass to merge.
- **Every pull request runs the pipeline, including docs-only ones.** `checks` is a required status
  check, and a skipped workflow reports nothing at all — which branch protection reads as pending, not
  passed, leaving the pull request permanently unmergeable.

## Estimation & flow

No story points. As a splitting heuristic only, stories carry a **T-shirt size (XS / S / M / L)**;
anything larger than **L is split** before it enters the board. Delivery is tracked by observed
**throughput**, not by forecasting points.

## The board

[`Backlog → Ready → In Progress → In Review → Done`](https://github.com/orgs/frikylabs/projects/1), with
the WIP limit above on the two active columns. A story reaches *In Review* when its pull request opens and
*Done* when that pull request merges — both automatic, so the board reflects reality rather than intent.
Sizes are set on the board, not in the issue body.

## Cadence

No standups. A brief **weekly flow review** keeps the board honest: unblock what's stuck, reorder *Ready*.
A recurring play-test with a real group is the functional review — the closest thing to a demo the
product has.

## Local development

Setup and run instructions live in the [README](./README.md) and land with the app scaffold.

---
name: ship
description: "Drive a Linear, GitHub, or plain-text issue through safe exploration, shared understanding, an approved plan, incremental implementation, independent review, verification, and an explicitly requested GitHub PR. Use when the user asks to start or ship an issue or feature end to end."
license: MIT
---

# ship

`ship` coordinates the issue-to-PR workflow. It owns phase order and approval boundaries; role skills own the work inside each phase.

Do not use this skill for a code question, a standalone review, or a small edit when the user does not want the full gated workflow.

## Inputs

Accept a Linear/GitHub issue identifier, pasted issue body, or clear feature request. If an identifier is provided and a configured tracker integration or CLI exists, inspect its usage and fetch the issue. Otherwise ask the user for the issue text; do not invent tracker commands or credentials.

Resolve the suite root from this skill's source, then read its `AGENTS.md` and conventions before dispatching work. Never resolve suite-relative paths against the target repository.

## Phase 0: Establish a Safe Work Area

Before implementation:

1. Inspect the current branch, default branch, worktree state, and remotes.
2. If on the default/protected branch or detached HEAD, stop and ask the user to create or select a feature branch/worktree, or explicitly accept the risk.
3. If the tree is dirty, determine whether existing changes overlap the issue. Preserve unrelated work. Stop only when overlap makes safe isolation impossible.
4. Never create, switch, delete, or rewrite branches without the user's explicit direction.

Exploration may begin before the worktree is clean, but no implementation or commit may begin until the destination is safe.

## Phase 1: Explore

Load `exploring` and give it the issue, repository root, branch context, and any known scope. It must return one merged evidence summary, not raw subagent transcripts.

The summary should identify the affected execution path, repository conventions, likely files, tests and commands, risks, and unresolved decisions. Do not choose an implementation yet.

## Phase 2: Align on Intent

Load `planning` with the issue and exploration summary.

1. Ask only questions that can materially change behavior, scope, architecture, data, security, or verification.
2. Give concrete options and mark a recommendation when useful.
3. When no meaningful unknowns remain, render a short prose spec and explicit success criteria in chat.
4. Render an executive checkpoint plan: one concise line per independently committable unit, followed by verification and material risks.
5. Stop for explicit approval. Do not write code before approval.

Specs and plans stay in chat unless the user asks for a file.

## Phase 3: Implement

Load `implementing` with the approved spec, checkpoint plan, exploration evidence, and applicable `AGENTS.md` files.

- Execute one checkpoint at a time.
- Use bounded implementation subagents only for independent ownership areas.
- Verify each checkpoint before committing it.
- Follow `<suite-root>/conventions/commits.md`; commit behavior tests separately.
- Keep commits local. Do not push during implementation.
- Pause only when evidence requires a material change to the approved behavior, architecture, scope, or plan. Present the plan delta and wait for approval.

Small adaptations that preserve the approved outcome may proceed and must be noted in the final report.

## Phase 4: Maintain Project Knowledge

Load `syncing-agents-md` after implementation. Update only `AGENTS.md` files whose scope contains changed code.

- Correct claims invalidated by the change.
- Record durable, non-obvious discoveries that would prevent future agents from getting stuck.
- Do not add issue-specific history, obvious code facts, or temporary debugging notes.
- Commit meaningful documentation changes separately with `docs:`.

## Phase 5: Review and Verify

Load `reviewing` and always dispatch an independent `reviewer` subagent. Give it the approved spec, applicable `AGENTS.md` files, repository conventions, commit range, and complete diff.

The review must prioritize correctness, regressions, architecture, security boundaries, test quality, and unplanned scope. Route must-fix changes back through `implementing`, create new commits, and rerun affected checks. Rerun `syncing-agents-md` after remediation. Whenever remediation or synchronization changes files, request a focused re-review of the complete post-review diff before continuing.

Then run the strongest relevant final checks following `<suite-root>/conventions/verification.md`. Use herdr according to `<suite-root>/conventions/herdr-visibility.md` when visible long-running commands are useful.

## Phase 6: Report and Stop

Report:

- What changed and why, mapped to the agreed success criteria.
- Verification commands and results.
- Commit list.
- Reviewer outcome and any accepted residual risks.
- Plan deviations, limitations, and unverified assumptions.

Stop. Do not push or create a PR until the user explicitly requests it.

## Phase 7: Publish on Explicit Request

When the user says to create or open the PR, load `publishing`.

1. Confirm `gh` authentication, the intended remote, and the base branch.
2. Fetch the base branch and attempt one rebase if the feature branch is behind and unpublished. If rebasing an existing remote branch would rewrite published commits, ask for explicit approval first.
3. If conflicts occur, record the conflicting files, abort the attempted rebase to restore the branch, report the conflict, and wait. Never guess conflict resolutions.
4. Push the feature branch, using force-with-lease only when a previously published branch was intentionally rebased.
5. Create the PR with the issue link, concise summary, changes, verification, risks, and follow-ups.
6. Watch PR checks. On success, return the URL and status. On failure, inspect relevant logs, diagnose, and propose a fix plan; do not edit or push a CI fix without approval.

Never merge, change merge strategy, request reviewers, or update tracker state unless the user asks.

## Stop Conditions

Stop and ask the user when:

- No safe feature branch/worktree is selected.
- A decision changes product behavior, public interfaces, persistence, security, deployment, or cost.
- Implementation materially diverges from the approved plan.
- Existing overlapping changes cannot be preserved safely.
- Rebase conflicts occur.
- A CI fix would require new code or commits.

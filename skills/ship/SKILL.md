---
name: ship
description: "Drives a Linear, GitHub, or plain-text issue through exploration, alignment, approved implementation, review, verification, and an explicitly requested PR. Use when the user mentions an issue, pastes an issue body, asks to start feature work, or says to ship a change end to end."
license: MIT
---

# ship

`ship` is the workflow state machine. It owns phase order, handoffs, and approval gates; each role skill owns its phase mechanics.

Do not use it for a code question, standalone review, or small edit when the user does not want the full gated workflow.

## Inputs

Accept a tracker identifier, pasted issue body, or clear feature request. If a configured tracker integration exists, inspect its usage and fetch identifiers without guessing commands or credentials. Otherwise ask for the issue text.

Shared discipline lives in dedicated reference skills (`commits`, `verification`, `subagents`, `exploring-heuristics`, `herdr-visibility`, `external-research`). Load them by name when a state needs them.

## State 0: Safe Work Area

Inspect branch, default branch, worktree state, and remotes. Before implementation, require a real feature branch or worktree; default branches and detached HEAD are not valid end-to-end destinations. Preserve unrelated changes and stop when overlapping work prevents safe isolation. Never change Git topology without explicit user direction.

Exploration and planning may proceed while the destination is being prepared. Implementation may not.

## Fast Path (Optional Shortcut)

After State 0 and before State 1, triage the change. If it is genuinely simple, propose skipping the formal explore/plan cycle and editing directly. Require explicit user approval; never auto-apply the fast path.

A change qualifies as simple when all of the following are true:

- Single coherent change, typically one to three files.
- No public API, contract, persistence, migration, security, deployment, or cost implication.
- Exactly one repository-consistent implementation is obvious from a quick read.
- Verification surface is clear: existing tests cover it, or it is genuinely untestable.
- No material unknowns that primary research or user input must resolve.

When the criteria are met, present:

```markdown
**Fast Path Proposal**
- Change: <one-line description>
- Files: <likely files>
- Verification: <targeted checks>
- Skipped states: 1 (Explore brief), 2 (Plan approval); possibly 5 (Guidance sync) and 6 (Review)
- Risk: <why skipping is safe>
```

Stop and wait for explicit approval. Silence is not approval.

If approved:

- Do one focused read of the affected path, not a full explore brief.
- Load `external-research` if a genuine unknown surfaces mid-edit.
- Make the smallest change that satisfies the request.
- Run targeted verification per `verification`.
- Commit following `commits`.
- Skip `syncing-agents-md` unless a durable claim was actually invalidated.
- Skip `reviewing` unless the user requests it or the diff grew beyond the fast-path criteria.
- Report changes, verification, commits, and limitations; stop. Do not publish until asked.

If the user declines, or any criterion fails, continue with the full workflow at State 1.

If a fast-path edit reveals non-trivial scope, stop, preserve the worktree, and re-enter the full workflow at State 1 with what was discovered. Do not escalate a simple change into a complex one without surfacing the choice.

## State 1: Explore

Load `exploring` with the request, repository root, branch context, known scope, and prior evidence.

Required result: one evidence brief containing the execution path, constraints, likely change surface, verification surface, risks, and open decisions.

## State 2: Align and Plan

Load `planning` with the request and exploration brief.

- On **❓ Decisions Needed**, `planning` has already asked the decision batch. Stop and resume planning with the user's answers.
- On **📋 Spec and Plan for Approval**, present the chat spec, success criteria, checkpoint plan, verification, and risks; then stop for explicit approval.

Do not write code until the user approves the current spec and plan for approval.

## State 3: Implement

Load `implementing` with the approved planning result, exploration evidence, applicable `AGENTS.md` files, branch context, and protected pre-existing changes.

Required result: completed checkpoints, changed files, local commits, checkpoint checks, tests, plan adaptations, guidance candidates, limitations, and blockers. Keep commits local.

On material plan drift, return to State 2 with the proposed delta and wait for approval.

## State 4: Verify Candidate

Run final risk-based verification following `verification`. Load `herdr-visibility` for useful visible long-running commands.

Required result: exact commands, outcomes, failures, and unverified assumptions. Do not advance while a change-caused required check is failing.

## State 5: Synchronize Guidance Conditionally

Load `syncing-agents-md` only when implementation or verification indicates a stale claim, durable discovery, or changed architecture, commands, ownership, or generated-source relationship.

Required result: updated/unchanged guidance, rejected candidates, and any proposed new scope. Commit actual guidance edits separately with `docs:` after validation.

## State 6: Review

Load `reviewing` in workflow mode. It owns independent reviewer dispatch and portable fallback.

Pass the approved spec and scope, exploration brief, applicable `AGENTS.md`, base/head commits, complete diff, commit list, implementation output, synchronization output, verification results, limitations, and guidance/architecture candidates.

On must-fix findings, return them to `implementing` in remediation mode, then repeat verification, conditional synchronization, and focused re-review. Allow at most two autonomous remediation rounds; after that, stop with remaining findings and ask the user how to proceed.

Advance when no must-fix findings remain or the user explicitly accepts a documented residual risk.

## State 7: Report and Stop

Report what changed against success criteria, verification results, commit list, reviewer outcome, guidance updates, plan deviations, limitations, and residual risks.

Stop. Do not push or create a PR until the user explicitly requests it.

## State 8: Publish on Explicit Request

When the user asks to create or open the PR, load `publishing` with the final report, issue reference, repository instructions, intended remote/base, and current review/verification evidence.

`publishing` owns base updates, conflict handling, pushing, PR creation, CI monitoring, mergeability reporting, and its approval boundaries. If publication changes the reviewed surface, return to verification and focused review before pushing.

Never merge, deploy, change merge strategy, request reviewers, or update tracker state unless the user asks.

## Stop Conditions

Stop for missing issue context, unsafe work area, decisions needed, plan approval, material drift, unresolved required verification, review findings beyond the remediation limit, rebase conflicts, history-rewrite approval, authentication or permission failures, and any CI fix requiring new code.

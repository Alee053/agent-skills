---
name: implementing
description: "Executes an approved implementation plan one checkpoint at a time with bounded subagents, relevant verification, and incremental conventional commits. Use only after explicit plan approval."
license: MIT
---

# implementing

Execute exactly the approved outcome while adapting safely to repository evidence. This skill owns code changes and local commits; it does not approve plans, perform independent review, push, or create PRs.

Use it from `ship` or standalone when the user has explicitly approved a spec and checkpoint plan. If approval or repository evidence is missing, stop rather than infer permission.

Resolve shared references by skill name. Load `commits`, `subagents`, `verification`, and `herdr-visibility` for the rules this skill follows.

## Required Inputs

- Approved spec, success criteria, and out-of-scope boundaries.
- Ordered checkpoint plan and intended verification.
- Exploration evidence and applicable `AGENTS.md` files.
- Current branch/worktree state and the baseline commit or diff range.
- Existing user changes that must remain untouched.

For review remediation, accept the original approved inputs plus specific must-fix findings and the post-review baseline. Findings that imply material plan drift still require user approval.

## Step 1: Preflight

Before editing:

1. Confirm explicit plan approval in the conversation.
2. Inspect branch, status, recent commits, and the complete existing diff.
3. In the end-to-end `ship` workflow, require a feature branch/worktree. In standalone mode, refuse a protected/default branch unless the user explicitly accepts the risk and acknowledges that `publishing` will require moving the commits to a feature branch.
4. Identify pre-existing changes and whether any overlap planned files. Preserve unrelated work; stop when safe isolation is impossible.
5. Confirm repository-defined commands, relevant tests, and checkpoint boundaries from evidence.
6. When OpenCode's native `todowrite` tool is available and permitted, use it to track checkpoints visibly and mark exactly one active at a time. Otherwise, maintain checkpoint statuses in chat with exactly one active item. Do not require delegated subagents to use the native tool; OpenCode denies it to them by default.

Do not create compatibility layers, dependencies, migrations, public APIs, or architecture changes that were not justified by the approved plan.

## Step 2: Decide Whether to Delegate

Implement a small or tightly coupled checkpoint in the coordinating context.

Use `general` implementation subagents only when work can be split into independent ownership areas. Follow the suite subagent prompt contract and additionally provide:

- The approved behavior and checkpoint it supports.
- Exact files or directories it may edit and explicit exclusions.
- Relevant exploration evidence and scoped `AGENTS.md` paths.
- A prohibition on staging, committing, switching branches, rebasing, or pushing.
- The targeted checks it may run after its edits.
- A required return of changed files, decisions, checks, and blockers.

Concurrent editing agents must own disjoint files. Run shared-file, generated-output, migration, and order-dependent work serially. The coordinator waits for all editors, inspects every change, runs shared verification, and owns the Git index.

## Step 3: Execute One Checkpoint

For each approved checkpoint:

1. Mark it active and reread the affected implementation, callers, contracts, and tests.
2. Make the smallest coherent change that satisfies that checkpoint.
3. Handle meaningful boundary cases and failures without broad fallbacks that hide defects.
4. Add or update behavior tests unless the change is genuinely untestable. Record the reason when tests do not apply.
5. Run the narrowest checks that prove the checkpoint, including new tests.
6. Review the whole checkpoint diff for correctness, scope, secrets, debug artifacts, and accidental user-file changes.
7. Choose the smallest commit shape that leaves every revision green.
8. Prefer an implementation commit followed immediately by `test:` when both states pass; otherwise commit the behavior slice and its tests atomically.
9. Recheck status and mark the checkpoint complete only when its checks pass and intended commits exist.

Never use unstaged tests to claim an implementation-only commit is green when checking out that commit would fail existing tests. Never commit known failing code as an intermediate checkpoint.

## Commit Discipline

Before every commit, inspect status, the intended diff, the staged diff, and recent history. Match the repository's existing commit style when it is stricter than the `commits` skill.

- Keep commits small enough to review but large enough to express one coherent change.
- Do not mix cleanup, documentation, or unrelated formatting with behavior. Tests may accompany behavior when splitting them would make either revision fail or misrepresent the verified state.
- Do not amend or rewrite prior commits to hide iteration unless the user explicitly asks.
- Do not push. `publishing` owns the first remote mutation.
- Never commit files with secrets, credentials, private data, or unexplained generated noise.

If hooks fail, diagnose and fix the cause, restage the intended files, and create a new commit attempt. Never skip hooks or disable checks to force a commit through.

## Verification and Failure Handling

Follow repository evidence rather than assuming commands from the language. Run targeted checks first and broader checks when the changed boundary justifies them.

When `HERDR_ENV=1`, use herdr for long-running tests, builds, servers, or logs when user visibility is useful. Short or decision-blocking commands stay in the active context.

When a command fails:

1. Read the complete relevant error.
2. Determine whether the change, environment, or pre-existing state caused it.
3. Make one bounded correction when evidence supports it and rerun the affected check.
4. Stop and report the blocker rather than cycling through guesses.

## Plan Drift

Proceed without interruption when an adaptation changes only internal details and preserves approved behavior, scope, architecture, interfaces, data, security, deployment, cost, and checkpoint intent. Record it for the final report.

Pause when evidence requires a material change. Return:

```markdown
**Plan Delta**
- Evidence: what the repository revealed.
- Approved plan: what no longer fits.
- Proposed change: the smallest safe revision.
- Impact: behavior, files, tests, risks, and commit checkpoints affected.
```

Wait for explicit approval before continuing. Do not use implementation momentum as implied consent.

## AGENTS.md Discoveries

Collect candidate guidance while working, but do not casually edit every `AGENTS.md`. Return only durable, non-obvious facts that are confirmed by repository evidence or implementation experience and would materially help a future agent. `syncing-agents-md` decides what belongs.

## Output Contract

Return:

- Completed checkpoint list.
- Changed files grouped by checkpoint.
- Commit hashes and subjects in order.
- Verification commands and results.
- Tests added or a concrete reason they were not applicable.
- Small plan adaptations and any approved material deviations.
- Candidate `AGENTS.md` discoveries.
- Remaining blockers or unverified assumptions.

## Stop Conditions

Stop when approval is absent, a safe work area is unavailable, existing changes overlap unsafely, material drift is unapproved, verification cannot be completed, a secret is found, or a checkpoint depends on unavailable external state. Preserve the worktree and report the exact next decision or action needed.

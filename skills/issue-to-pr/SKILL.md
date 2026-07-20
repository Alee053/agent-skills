---
name: issue-to-pr
description: "Drive the full implementation lifecycle for a tracked issue (e.g. a Linear issue). Use when the user mentions a Linear issue, pastes an issue body, says 'start working on this issue', or otherwise kicks off feature work. Covers: branch safety check, exploration, clarifying questions, planning with explicit approval, incremental conventional commits at checkpoints, verification/report back, and a GitHub PR via gh. Self-activates once the issue is pasted — the user should only need to load the skill and send the issue."
license: MIT
---

# issue-to-pr

A repeatable, gated workflow for taking a tracked issue (Linear, GitHub, or plain text) all the way to a merged PR. The user loads this skill and pastes the issue; everything below then runs in order. **Stop at every gate marked ⛔.** Never skip a gate to "be helpful" — the gate is the value.

## Operating principles

- **Gates over speed.** There are hard approval gates. Stop and wait at each one. Do not begin the next phase until the user explicitly unblocks it.
- **Never act on the user's git topology unprompted.** Do not create branches, worktrees, commits, or PRs autonomously. Branch and worktree creation always come from the user. Commits only happen during the implement phase (after approval). PRs only happen when the user explicitly says so.
- **Evidence over assumption.** Explore the codebase before proposing anything. Cite `file:line` when referencing code.
- **Incremental, reviewable history.** Implement in small checkpoints and commit each one with a conventional commit message. The commit log should read like a narrative of the change.

## Phase 0 — Branch safety check ⛔ (run first, before anything else)

Before reading the issue or exploring, confirm where work will land.

1. Check the current branch:
   ```bash
   git rev-parse --abbrev-ref HEAD
   git status --short
   ```
2. Determine the repository's default/protected branch (e.g. `main`, `master`) and compare.
3. Decision matrix:
   - **On a feature branch already** → confirm the branch name to the user and proceed to Phase 1.
   - **On the default/protected branch (`main`/`master`/trunk), or detached, or the working tree is dirty** → **STOP.** Do not create a branch or worktree yourself. Surface it plainly, e.g.:
     > ⛔ Heads up — this skill expects a feature branch/worktree, but you're on `main` and the working tree is clean. What do you want to do?
     - (a) You create a branch and tell me when done
     - (b) You create a worktree and tell me when done
     - (c) Actually stay on this branch (you accept the risk)

     Wait for the user to create it (or explicitly accept staying). Resume Phase 1 only once confirmed.

Do not run `git checkout -b`, `git worktree add`, or anything that changes which commit is checked out. That is the user's call.

## Phase 1 — Explore (gather full context)

Goal: understand the issue and the code it touches before forming any plan.

- Restate the issue in concrete engineering terms: what's broken or missing, where it lives, what "done" looks like.
- Read the relevant implementation, not just the smallest snippet: callers, nearby helpers, types, config, and tests.
- Trace the affected path end to end (entry point → the change site → downstream effects).
- Identify constraints, conventions, and likely failure modes. Note the project's toolchain: formatter, linter, typechecker, test runner, package manager.
- Prefer the `explore` subagent for broad discovery; use `grep`/`glob`/`read` for targeted inspection.
- Produce a short context summary: files/modules involved, the seams where the change goes, and any unknowns.

If the issue is ambiguous about scope or intent, collect those as questions for Phase 2 rather than guessing.

## Phase 2 — Clarifying questions ⛔

Ask the user the questions that would materially change the implementation. Before asking:

- Filter ruthlessly. Only ask what you cannot determine from the code or the issue. If the code answers it, don't ask.
- For each question, **propose concrete options** (with your recommended one flagged) so the user can decide fast. Prefer the `question` tool for structured choices.

Examples worth asking:
- Behavior choices with genuine trade-offs (e.g. "fail closed vs. warn and continue")
- Scope boundaries ("just the API, or also the UI consumer?")
- Where multiple correct designs exist

Do not ask about trivia the codebase already dictates. Once answered (or if there are none), proceed.

## Phase 3 — Plan ⛔ (approval gate)

Produce a concrete, ordered plan:

1. **Goal** — one sentence restating the engineering objective.
2. **Changes** — ordered list of checkpoints, each a coherent, independently-committable unit. For each: which files, what changes, and why.
3. **Verification** — the exact commands/steps that will prove each checkpoint and the whole change works (tests, typecheck, lint, build, manual repro).
4. **Risks / regressions** — what could break and how you'll guard against it.
5. **Out of scope** — explicitly call out what you will *not* touch.

Present the plan and then **stop**:
> ⛔ Plan ready. Review it and approve (or tell me what to change). I won't write any code until you approve.

Track the checkpoints as a todo list (`todowrite`) so progress is visible. Begin Phase 4 only on explicit approval ("go", "approved", "lgtm").

## Phase 4 — Implement with incremental commits

Execute checkpoints one at a time. After each checkpoint that produces a working, self-consistent state:

1. Mark the todo item `in_progress` while working, `completed` when done.
2. Run the verification step for that checkpoint (Phase 5 inline) before committing.
3. Commit it. Incremental history is the point — do not accumulate one giant commit at the end.

### Conventional commit messages

Format:
```
<type>(<scope>): <description>

[optional body explaining why]
```
Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `ci`, `style`, `build`.

Rules:
- One logical change per commit. If a commit needs two types, split it.
- Imperative mood, lowercase, no trailing period (`feat(api): add retry on 429`).
- The body explains *why*, not *what*. Skip it if the subject line is enough.
- **Never** add AI attribution / co-author trailers.
- **Never** commit secrets, credentials, or `.env` files. If a secret appears, stop and warn the user.
- Do not push yet unless the user asked for incremental pushes.

Example checkpoint sequence:
```
feat(api): add 429 retry with exponential backoff
test(api): cover backoff timing and max-attempts
docs(api): document retry behavior in README
```

If a checkpoint fails verification, fix it within the checkpoint before moving on — do not leave the tree red.

## Phase 5 — Verify

Run the strongest relevant checks, narrowest first, broadest last:

1. Targeted tests for the changed code.
2. Typecheck, then lint, then build.
3. Integration / end-to-end checks when justified.
4. Validate the actual failure path (for bug fixes) — prove the original issue no longer reproduces.

Never claim it works unless a check confirms it. If a command can't be found, ask the user for the right one and offer to record it in `AGENTS.md`. Report what passed, what's unverified, and any caveats. If everything passes, clean up scratch/debug code.

## Phase 6 — Report back ⛔

Summarize concisely:
- **What changed and why** — tied back to the issue's acceptance criteria.
- **Verification** — which commands ran and their results.
- **Commit log** — the incremental commits made.
- **Known limitations / follow-ups / unverified assumptions**, if any.

Then stop and let the user react:
> ✅ Implementation done and verified. Review the changes. Tell me if you want to iterate, or say "create the PR" when you're ready.

Wait for the user. Do not push or open a PR yet.

## Phase 7 — PR (only on explicit request) ⛔

Triggered only when the user explicitly says to create/open a PR. Use the **GitHub CLI (`gh`)**.

1. Confirm `gh` is available and authenticated (`gh auth status`). If not, stop and tell the user how to authenticate.
2. Push the branch if it isn't pushed yet (ask/confirm the remote — don't force-push).
3. Create the PR, linking the source issue:
   ```bash
   gh pr create --title "<type>(<scope>): <subject>" \
     --body "..." \
     [--base <branch>]
   ```
4. PR body should include: **Summary** (what & why, linked to the Linear/GitHub issue), **Changes** (checkpoint list mirroring the commits), **Testing** (how it was verified), **Risks / follow-ups**, and an issue reference (e.g. `Closes #123` or the Linear ticket link).
5. Return the PR URL. Do not merge, request reviewers, or change merge strategy unless the user asks.

## When to use this skill

Use when the user:
- Mentions a Linear (or other tracker) issue and wants to start work
- Pastes an issue body and expects you to "just go"
- Says "start working on this issue" / "pick up this ticket" / similar
- Wants the issue → branch-checked → explored → planned → implemented-with-increments → PR flow

## Anti-patterns to avoid

- Starting to code without completing the Phase 0 branch check.
- Creating branches/worktrees/commits/PRs autonomously instead of gating on the user.
- Batching everything into one mega-commit at the end instead of incremental checkpoints.
- Skipping clarifying questions and guessing at behavior with real trade-offs.
- Implementing before the plan is approved.
- Claiming success without running an actual verification command.
- Opening or merging a PR without an explicit user request.
- Adding AI/co-author attribution to commits.

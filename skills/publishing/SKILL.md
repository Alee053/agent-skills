---
name: publishing
description: "Publishes a reviewed local feature branch by checking the base, attempting one safe update, pushing, creating a GitHub PR with gh, and monitoring CI. Use only after the user explicitly asks to create the PR."
license: MIT
---

# publishing

Publish a verified local branch without silently changing history or repository policy. This skill owns the workflow's remote Git and GitHub mutations.

Use it only after the user explicitly asks to create or open the PR. A completed implementation or approved plan is not publication permission. Do not use it to merge, release, deploy, request reviewers, or update issue state unless the user separately asks.

Resolve shared references from the suite root. Follow `<suite-root>/conventions/commits.md`, `verification.md`, and `herdr-visibility.md`. Keep Git and network mutations in the coordinating agent; no subagent dispatch is needed.

## Required Inputs

- Reviewed feature branch and intended remote/base branch.
- Issue title, URL or identifier, and approved outcome.
- Final change summary, commit list, verification results, and residual risks.
- Any repository PR template or contribution instructions.
- Explicit publication request from the user.

## Step 1: Publication Preflight

Before any network mutation:

1. Confirm the current branch is the intended feature branch and is not the default/protected branch.
2. Inspect status, staged and unstaged changes, recent commits, remotes, and upstream tracking.
3. Require a clean worktree. Stop if intended changes are uncommitted or unrelated changes would be included.
4. Confirm final review has no unresolved must-fix finding and verification results are current.
5. Confirm `gh` is available and authenticated with `gh auth status`; never print tokens.
6. Determine the repository, target remote, and base branch from Git/GitHub evidence. Do not assume `origin` or `main`.
7. Check whether the branch already has a PR. Avoid creating duplicates; report the existing PR and ask whether the user wants it updated when intent is unclear.

Do not change reviewers, labels, milestones, projects, draft state, or maintainer permissions unless requested.

## Step 2: Fetch and Check Base Divergence

Fetch the selected remote and compare the feature branch with its target base.

- If up to date, continue.
- If behind and the branch has not been published, attempt one rebase onto the fetched base.
- If the remote feature branch exists and rebasing would rewrite its commits, stop and request explicit approval before rebasing or force-pushing. "Create the PR" is not that approval.
- If the branch has diverged in a way a simple rebase does not safely explain, report ahead/behind state and stop.

If a rebase conflicts:

1. Record the conflicting files.
2. Abort the rebase to restore the pre-attempt branch.
3. Report the conflict and wait for user direction.

Never guess conflict resolutions or merge the base branch as a fallback. After a successful rebase, rerun the checks affected by changed base code before pushing.

## Step 3: Push Safely

For the first publication, push the current feature branch and set its upstream explicitly. Never push the default branch.

Use a normal push unless the user separately approved rewriting an existing remote branch. When approved and required, use force-with-lease, never unconditional force.

After pushing, confirm the local head and remote feature head match before creating the PR.

## Step 4: Create or Update the PR

Respect an existing repository PR template. Otherwise use:

```markdown
## Summary
- What changed and why.

## Changes
- Coherent implementation checkpoints reflected by the commit history.

## Testing
- Exact checks run and their results.

## Risks / Follow-ups
- Residual risks, limitations, or "None".

## Issue
- Linear/GitHub issue link or identifier.
```

Use `gh pr create --base <base> --head <head> --title <title> --body-file <source>` with explicit base and head so GitHub CLI does not choose or push implicitly. Prefer a concise title consistent with the repository and issue. Use `Closes #123` only for a GitHub issue that the PR should close; link Linear issues without GitHub closing syntax.

If a PR already exists and the approved commits were pushed, update its body only when the user requested an update or the existing description would now be materially inaccurate.

Capture the PR URL and confirm its base, head, state, and mergeability with `gh pr view`. GitHub may temporarily report mergeability as unknown; retry once after a short wait, then report uncertainty rather than looping.

## Step 5: Watch CI

Watch the PR's checks until they complete with `gh pr checks --watch`. Use `--fail-fast` only when early failure is more useful than collecting all results.

When `HERDR_ENV=1`, prefer a visible herdr pane for the watch so the user can observe CI while the coordinating agent remains available. Otherwise run it normally.

- If checks pass, report success.
- If no checks exist, report that no CI was configured or discovered.
- If checks fail or are cancelled, identify the failed checks and inspect the relevant logs or linked run.
- If checks remain pending beyond a reasonable wait, report their names and current state rather than waiting indefinitely.

Diagnose CI failures into one of: implementation defect, flaky/infrastructure failure, missing configuration/permission, or unrelated base failure. Propose the smallest next action with evidence. Do not edit, commit, or push a fix without explicit approval; approved fixes return through `implementing`, `syncing-agents-md`, review, and verification before republishing.

## Conflict and Mergeability Report

Before finishing, report whether GitHub considers the PR mergeable and whether the branch is behind the base. A green CI result does not imply conflict-free mergeability.

Never click merge, enable auto-merge, select a merge strategy, or delete the branch unless requested.

## Output Contract

Return:

```markdown
**Pull Request**
URL, title, base <- head, and state.

**Branch Update**
Fetch/rebase/push actions, or conflicts/divergence that blocked publication.

**CI**
Checks watched and final status, including failed check names when relevant.

**Mergeability**
Conflict status, base freshness, or any GitHub uncertainty.

**Next Action**
None when ready, or the proposed approved-gate action for a failure.
```

## Stop Conditions

Stop before remote mutation when authorization is absent, the worktree is dirty, review or verification is incomplete, remote/base intent is ambiguous, authentication fails, or the current branch is protected. Stop during publication when rebase conflicts, unapproved history rewriting, push rejection, or permission failures occur. Preserve local history and report the exact blocker.

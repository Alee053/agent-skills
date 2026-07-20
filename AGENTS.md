# Agent Guide

## Purpose

This repository contains Ale's personal agent skill suite. The suite is intentionally small, language-agnostic, and project-agnostic. It should guide agents through high-quality engineering work without loading a large framework into every conversation.

The target workflow is: issue or request -> safe branch -> focused exploration -> clarifying questions -> chat spec -> approved plan -> incremental implementation -> verification -> conditional guidance sync -> independent review -> report -> explicitly requested PR.

## Design Principles

- Keep orchestration separate from role expertise. `ship` coordinates; role skills perform one concrete job.
- Make role skills reusable outside the full workflow.
- Prefer evidence from the target repository over generic advice.
- Ask only questions that can materially change the implementation.
- Write specs and plans in chat, never into repository files unless the user asks.
- Use small, coherent conventional commits. Do not push until PR publication is requested.
- Treat `AGENTS.md` files as maintained project knowledge, not static onboarding text.
- Use subagents where independent parallel work reduces latency or improves review quality; avoid duplicate scans.
- Keep shared rules in `conventions/` so role skills remain concise.
- Do not guess tool commands, APIs, repository structure, or project conventions when they can be inspected.

## Repository Layout

```text
skills/
  ship/                 Main issue-to-PR orchestrator
  exploring/            Repository discovery and context synthesis
  planning/             Chat spec, questions, and checkpoint plan
  implementing/         Checkpoint execution and incremental commits
  reviewing/            Independent diff, architecture, and quality review
  publishing/           Rebase check, push, GitHub PR, and CI monitoring
  syncing-agents-md/    Scoped AGENTS.md maintenance
  herdr/                 Concise herdr operating skill with on-demand CLI reference
conventions/
  commits.md
  exploring-heuristics.md
  herdr-visibility.md
  subagents.md
  verification.md
scripts/
  validate-suite.mjs
```

`ship` is the only end-to-end workflow skill. The other workflow skills must remain independently usable.

## Workflow Contract

1. Confirm branch/worktree safety before implementation work.
2. Read all applicable `AGENTS.md` files and inspect the request.
3. Explore the affected path end to end. Split broad repositories by detected seams and explore them in parallel.
4. Ask concise, decision-changing questions with concrete options and a recommendation.
5. When understanding is shared, render a short spec and success criteria in chat.
6. Render an executive checkpoint plan in chat and wait for explicit approval.
7. Implement one behavior-slice checkpoint at a time. Verify and commit each coherent unit; prefer separate test commits only when every commit remains independently green.
8. Pause only when implementation materially diverges from the approved plan.
9. Run final risk-based verification, then update affected `AGENTS.md` files only when the work invalidates a claim or reveals durable, non-obvious project knowledge.
10. Run an independent reviewer subagent with complete implementation and verification evidence. Address must-fix findings, rerun verification and affected `AGENTS.md` synchronization, and request focused re-review.
11. Report changes, verification, commits, limitations, and deviations. Stop until the user requests a PR.
12. On explicit PR request, update from the base branch once, push, create the PR with `gh`, watch CI, and report conflicts or failures.

## Role Skill Contract

Every role skill should state:

- When it activates and when it should not.
- The context or inputs it requires.
- The exact output it returns to its caller.
- Its stopping conditions and approval boundaries.
- Which shared conventions it follows.
- Which subagent type it dispatches, if any.

A role skill must not silently absorb the responsibility of another role. For example, `exploring` gathers evidence but does not choose an implementation; `reviewing` reports findings but does not rewrite the implementation unless its caller asks.

## Suite Paths

References such as `conventions/subagents.md` are relative to the suite root: the directory containing this `AGENTS.md`, `skills/`, and `conventions/`. They must never be resolved against the target repository.

An orchestrator dispatching a subagent must pass the resolved suite root or inline the required convention content. Future plugin packaging must preserve this contract when resources move.

## Subagents

Use the adaptive dispatch rules in `conventions/subagents.md`. Subagents start with isolated context, so prompts must include the task, boundaries, applicable `AGENTS.md` instructions, relevant skill or convention paths, and the required return shape.

Prefer task subagents for exploration, implementation units, and independent review. `explore` and `general` are the portable baseline; specialized reviewer or architect agents may be used when available and must have a `general` fallback. Use herdr for visible long-running processes, not as a second orchestration system by default.

Only the coordinating agent owns the Git index and commits. Concurrent editing subagents need disjoint file ownership and must not stage, commit, switch branches, or rewrite history.

## herdr

When `HERDR_ENV=1`, follow `conventions/herdr-visibility.md`. Long-running tests, builds, servers, and log streams may run in a sibling pane so the user can observe them. Routine file inspection and short commands should stay in the active agent session.

If herdr is unavailable, continue with normal tools; herdr is an enhancement, not a dependency.

## Editing This Repository

- Keep `SKILL.md` files focused. Move generally reusable rules into `conventions/`.
- Avoid framework- or language-specific commands in workflow skills. Discover the target repository's commands at runtime.
- Prefer concrete instructions and stop conditions over motivational prose.
- Do not duplicate a shared convention in multiple skills unless standalone packaging requires it.
- Update this file whenever the suite layout or a workflow contract changes.
- Validate frontmatter, referenced paths, and cross-skill responsibilities after structural edits.
- Run `node scripts/validate-suite.mjs` after changing skills, conventions, or suite layout.

## Future Direction

The suite may later be packaged as an OpenCode plugin similar to `obra/superpowers`. Plugin loading, installation, and skill injection are intentionally out of scope until the reference implementation is available.

"Independently reusable" means a role can be called without `ship` inside an installed complete suite; individual skill directories are not standalone distributions because they depend on shared conventions. Future packaging should preserve the full tree, register `skills/`, and make an explicit decision about collisions from generic role names.

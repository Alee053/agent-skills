# Agent Guide

## Purpose

A small, language-agnostic, project-agnostic agent skill suite for opencode and any agent that loads skills via the [skills.sh](https://skills.sh) convention. It guides an agent from an issue or feature request to a reviewed, verified, publish-ready pull request through a series of focused role skills.

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
- Keep shared discipline in dedicated reference skills (`commits`, `host-capabilities`, `verification`, `subagents`, `exploring-heuristics`, `herdr-visibility`, `external-research`) so role skills stay concise and the rules are invokable directly.
- Detect active MCP servers once per session and prefer them for capabilities they own; route native interaction, tracking, delegation, and research through `host-capabilities`. See `external-research`.
- Do not guess tool commands, APIs, repository structure, or project conventions when they can be inspected.

## Repository Layout

```text
skills/
  ship/                   Main issue-to-PR orchestrator
  exploring/              Repository discovery and context synthesis
  exploring-heuristics/   Reference: exploration scope and stop conditions
  planning/               Chat spec, questions, and checkpoint plan
  implementing/           Checkpoint execution and incremental commits
  reviewing/              Independent diff, architecture, and quality review
  publishing/             Rebase check, push, GitHub PR, and CI monitoring
  syncing-agents-md/      Scoped AGENTS.md maintenance
  commits/                Reference: incremental conventional commits
  verification/           Reference: risk-based verification order
  subagents/              Reference: adaptive dispatch and prompt contract
  herdr-visibility/       Reference: when to use herdr for visible processes
  external-research/      Reference: active MCP detection and web research hierarchy
  host-capabilities/      Reference: native tool routing across supported hosts
  herdr/                  Concise herdr operating skill with on-demand CLI reference
scripts/
  validate-suite.mjs
```

`ship` is the only end-to-end workflow skill. The other workflow skills must remain independently usable. Reference skills are loaded by other skills or directly when their rule applies.

## Skill References

Skills reference each other by name. To load shared rules, use the agent's skill loader with the directory name (for example, load `commits`, `verification`, or `external-research`). Do not invent file paths outside the skill directory; the agent's skill loader resolves skill names to installed locations.

Each skill is self-contained. When the suite is installed via `npx skills Alee053/agent-skills`, each `skills/<name>/` directory is installed independently and may be invoked directly.

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
12. On explicit PR request, fetch and check the base branch once, request approval before any rebase, push, create the PR with `gh`, watch CI, and report conflicts or failures.

For genuinely simple changes, `ship` may propose a fast path that skips the formal explore/plan cycle with the user's explicit approval. See the `ship` skill for criteria.

## Role Skill Contract

Every role skill should state:

- When it activates and when it should not.
- The context or inputs it requires.
- The exact output it returns to its caller.
- Its stopping conditions and approval boundaries.
- Which shared reference skills it loads.
- Which subagent type it dispatches, if any.

A role skill must not silently absorb the responsibility of another role. For example, `exploring` gathers evidence but does not choose an implementation; `reviewing` reports findings but does not rewrite the implementation unless its caller asks.

## Subagents

Use the adaptive dispatch rules in the `subagents` skill. Subagents start with isolated context, so prompts must include the task, boundaries, applicable `AGENTS.md` instructions, the names of skills to load, and the required return shape.

Prefer the `host-capabilities` delegation route for exploration, implementation units, and independent review. Specialized reviewer or architect agents may be used when available, with an available general-purpose subagent or direct execution as the fallback. Use `herdr` for visible long-running processes, not as a second orchestration system by default.

Only the coordinating agent owns the Git index and commits. Concurrent editing subagents need disjoint file ownership and must not stage, commit, switch branches, or rewrite history.

## MCP Awareness and External Research

At the start of any non-trivial task, establish the `host-capabilities` record and record which MCP servers are connected by inspecting the tools exposed in the current session. Typical names: `context7`, `firecrawl`, `exa`, `linear`, `github`, `playwright`.

When repository evidence is insufficient, use the research MCP that fits:

- Library, framework, SDK, or cloud-service docs: prefer `context7`.
- Web search and page extraction: prefer `firecrawl`, then `exa`.
- No research MCP available: follow the host-native fallback in `host-capabilities`.

See the `external-research` skill for the full hierarchy and rules.

## herdr

When `HERDR_ENV=1`, follow the `herdr-visibility` skill. Long-running tests, builds, servers, and log streams may run in a sibling pane so the user can observe them. Routine file inspection and short commands should stay in the active agent session.

If herdr is unavailable, continue with normal tools; herdr is an enhancement, not a dependency.

## Editing This Repository

- Keep `SKILL.md` files focused. Move generally reusable rules into a dedicated reference skill.
- Avoid framework- or language-specific commands in workflow skills. Discover the target repository's commands at runtime.
- Prefer concrete instructions and stop conditions over motivational prose.
- Reference skills by name (for example, `Load \`commits\``); never use `<suite-root>` or sibling-directory paths that do not install via skills.sh.
- Do not duplicate a reference skill's content in multiple workflow skills; load it by name.
- Update this file whenever the suite layout or a workflow contract changes.
- Validate frontmatter, referenced paths, and cross-skill references after structural edits.
- Run `node scripts/validate-suite.mjs` after changing skills or suite layout.

## Future Direction

The suite may later be packaged as an opencode plugin similar to `obra/superpowers`. Plugin loading, installation, and skill injection are intentionally out of scope until the reference implementation is available.

"Independently reusable" means a role can be called without `ship` inside an installed complete suite; individual skill directories depend on shared reference skills, which are also installable via skills.sh.

# agent-skills

A small, language-agnostic, project-agnostic agent skill suite for [opencode](https://opencode.ai) and any agent that loads skills via the [skills.sh](https://skills.sh) convention. It guides an agent from an issue or feature request to a reviewed, verified, publish-ready pull request through a series of focused role skills.

## Why

Most agent frameworks either dump a giant prompt into every conversation or hide all structure behind one orchestrator. This suite keeps orchestration separate from role expertise: one `ship` skill coordinates phases, and each role skill does one concrete job well. Every role is independently usable outside the full workflow.

The suite adapts to its environment. It detects active MCP servers once per session and prefers them for capabilities they own. When repository evidence is insufficient, it falls back through a disciplined web research hierarchy.

## Installation

Install the full suite with [skills.sh](https://skills.sh):

```bash
npx skills Alee053/agent-skills
```

Install a single skill:

```bash
npx skills Alee053/agent-skills --skill ship
```

Project scope (default) installs under `./skills/`. Global scope installs under the agent's user directory:

```bash
npx skills Alee053/agent-skills -g
```

## Skills

### Workflow skills

| Skill | Purpose |
| --- | --- |
| [`ship`](skills/ship/SKILL.md) | End-to-end orchestrator from issue to ready-to-publish PR. |
| [`exploring`](skills/exploring/SKILL.md) | Evidence-based repository discovery before planning. |
| [`planning`](skills/planning/SKILL.md) | Clarifying questions, chat spec, success criteria, checkpoint plan. |
| [`implementing`](skills/implementing/SKILL.md) | Executes an approved plan one checkpoint at a time. |
| [`reviewing`](skills/reviewing/SKILL.md) | Independent review against spec, architecture, and quality standards. |
| [`publishing`](skills/publishing/SKILL.md) | Safe PR publication and CI monitoring after explicit request. |
| [`syncing-agents-md`](skills/syncing-agents-md/SKILL.md) | Keeps scoped `AGENTS.md` guidance accurate after changes. |
| [`herdr`](skills/herdr/SKILL.md) | Optional visibility layer for long-running processes via herdr CLI. |

### Reference skills

Loaded by other skills or directly when their rule applies.

| Skill | Purpose |
| --- | --- |
| [`commits`](skills/commits/SKILL.md) | Incremental conventional commits. |
| [`verification`](skills/verification/SKILL.md) | Risk-based verification order. |
| [`subagents`](skills/subagents/SKILL.md) | Adaptive dispatch and prompt contract. |
| [`exploring-heuristics`](skills/exploring-heuristics/SKILL.md) | Exploration scope and stop conditions. |
| [`herdr-visibility`](skills/herdr-visibility/SKILL.md) | When to use herdr for visible long-running processes. |
| [`external-research`](skills/external-research/SKILL.md) | Active MCP detection and web research hierarchy. |
| [`host-capabilities`](skills/host-capabilities/SKILL.md) | Native tool routing across OpenCode, Claude Code, and other hosts. |

## Workflow

```
issue or request
  -> safe branch
  -> exploring (evidence brief)
  -> planning (questions -> spec -> checkpoint plan)
  -> implementing (incremental commits with verification)
  -> verification (risk-based)
  -> syncing-agents-md (conditional)
  -> reviewing (independent)
  -> report (stop)
  -> publishing (on explicit request)
```

For genuinely simple changes, `ship` may propose a fast path that skips the formal explore/plan cycle with the user's explicit approval.

## Optional Integrations

The suite adapts to the active environment. When these MCP servers are connected, the agent will prefer them:

- **Context7** — library, framework, and SDK documentation.
- **Firecrawl** — web search, scraping, and structured extraction (primary web research tool).
- **Exa** — web search and page fetch (fallback for Firecrawl).
- **Linear** — issue tracking for `ship`.

When no research MCP is connected, the agent follows the host-native fallback in [`host-capabilities`](skills/host-capabilities/SKILL.md).

Optional tooling:

- [`gh`](https://cli.github.com) CLI — required for `publishing`.
- **herdr** — optional visibility layer; activate with `HERDR_ENV=1`.

## Validation

Validate skill frontmatter, structural integrity, and cross-skill references:

```bash
node scripts/validate-suite.mjs
```

## Design Principles

- Orchestration is separate from role expertise.
- Role skills are independently usable.
- Evidence from the target repository wins over generic advice.
- Specs and plans live in chat, not repository files.
- Small, coherent conventional commits; nothing is pushed until publication is requested.
- `AGENTS.md` files are treated as maintained project knowledge.
- Detect active MCPs and route native tools through host capabilities.

See [`AGENTS.md`](AGENTS.md) for the full guide.

## License

MIT

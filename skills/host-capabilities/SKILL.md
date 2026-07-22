---
name: host-capabilities
description: "Reference rules for choosing compatible native tools across OpenCode, Claude Code, and other hosts. Use when a workflow needs user questions, task tracking, subagents, or web research."
license: MIT
---

# host-capabilities

Select tools from the capabilities exposed in the current session, not from the host name, repository files, or a remembered configuration. This reference maps known OpenCode and Claude Code equivalents while preserving safe fallbacks for other hosts.

## Establish the Capability Record

At the start of a non-trivial workflow, inspect the exposed native and MCP tools and record the available capabilities. Pass that record to downstream skills instead of rediscovering it.

- OpenCode normally exposes `question`, `todowrite`, `task`, and `webfetch`.
- Claude Code normally exposes `AskUserQuestion`, `Agent`, `WebSearch`, and `WebFetch`. Its progress tools may be `TaskCreate`, `TaskGet`, `TaskList`, and `TaskUpdate`, or legacy `TodoWrite`.
- MCP tool names and availability are configuration-specific on both hosts. Use only the tools actually exposed in the session.
- When individual capabilities differ from a known host profile, select each route independently. Do not force one host's complete tool set.

## Interaction Route

Use a native multiple-choice tool for a material decision when available.

- OpenCode: use `question`; keep its default custom answer enabled and use `multiple` only for independent choices.
- Claude Code: use `AskUserQuestion`; keep headers to 12 characters, ask one to four questions with two to four options each, and use `multiSelect` only for independent choices. Claude Code supplies `Other` automatically.
- Otherwise: render concise choices in chat and accept a written answer.

Do not add a manual `Other` option when using either native tool. After a native interaction, render a short user-facing status without repeating the choices.

## Checkpoint Route

Use the native progress tracker when available so the current checkpoint is visible.

- OpenCode: use `todowrite`.
- Claude Code: when `TaskCreate`, `TaskList`, and `TaskUpdate` are exposed, use them to create, inspect, and update the checkpoint list. Otherwise use legacy `TodoWrite` when exposed.
- Otherwise: maintain checkpoint statuses in chat with exactly one active item.

Do not require delegated agents to maintain the coordinator's tracker.

## Delegation Route

Use a subagent only when the host exposes a compatible delegation tool and the task benefits from an isolated context.

- OpenCode: use `task` with only the subagent types listed as available in the current session.
- Claude Code: use `Agent` with a configured or available subagent that has the required tool permissions.
- Otherwise: perform the work in the coordinating context rather than inventing an agent type or assuming delegation is possible.

Apply the `subagents` prompt and ownership rules after selecting the route. Do not assume that role labels such as `explore`, `general`, or `reviewer` exist on every host.

## Research Route

Use the strongest exposed research capability for the question.

- Prefer an exposed documentation or web-research MCP that matches the task: documentation before general web search, then focused page extraction.
- On Claude Code without a suitable MCP, use `WebSearch` to locate sources and `WebFetch` to read known URLs.
- On OpenCode without a suitable MCP, use `webfetch` to read known URLs; use any separately exposed search capability only when present.
- If no suitable research tool is available, report the constraint or ask the user for a source rather than fabricating a tool call.

Never infer an MCP tool name from its server name. Record the source and the capability route used for material decisions.

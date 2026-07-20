# Subagent Dispatch

Use subagents when work has independent seams or benefits from an independent context. Do not delegate tiny targeted reads or duplicate work already assigned elsewhere.

## Adaptive Split

Inspect the repository shape before dispatching. Split by the strongest natural boundary: package, service, application, language, layer, or infrastructure area. Use one agent for a small repository and usually two to four for a broad repository. Add more only when the boundaries are genuinely independent.

## Prompt Contract

Every subagent prompt must include:

- The concrete goal and why the result is needed.
- Exact directories, modules, or concerns it owns.
- Explicit exclusions so agents do not scan the same area.
- Applicable `AGENTS.md` instructions and relevant skill/convention paths.
- Whether it may edit or must remain read-only.
- The required result shape and useful file references.
- The checks it should run when editing.
- The resolved suite root or the required convention content; never assume suite-relative paths resolve from the target repository.

Use the narrowest available type. `explore` and `general` are the portable baseline. Prefer a specialized `reviewer` for independent review or `architect` for consequential design choices when the environment provides them; otherwise dispatch `general` with the corresponding role skill and a focused read-only prompt. Specialist availability must never block the workflow.

## Coordination

- Launch independent agents concurrently.
- Do not redo delegated work in the main context.
- Merge results into one decision-oriented summary; do not paste every agent transcript.
- Resolve contradictions with one targeted read or follow-up, not a full rescan.
- Reuse an agent's task ID when a focused follow-up needs its existing context.
- Stop dispatching when the current evidence is sufficient to plan safely.

## Editing Ownership

- The coordinating agent exclusively owns Git operations: staging, committing, branch changes, rebases, and pushes.
- Concurrent editing agents must own disjoint files or directories and must be told not to run Git mutations.
- Work that touches shared files, generated outputs, migrations, or order-dependent contracts must run serially unless isolated worktrees are explicitly arranged.
- Wait for all concurrent edits to finish before running shared verification or creating a checkpoint commit.

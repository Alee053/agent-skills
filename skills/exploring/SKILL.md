---
name: exploring
description: "Explore a repository or affected area before planning a change. Use for evidence-based discovery of execution paths, architecture, conventions, tests, risks, and genuine unknowns. Supports adaptive parallel exploration by repository seam and returns one concise context brief without choosing an implementation."
license: MIT
---

# exploring

Explore only deeply enough to support safe questions and planning. This skill is read-only: do not edit files, choose an implementation, or produce a task plan.

Use it as a standalone discovery skill or from `ship`. Do not use it for a known single-symbol lookup that targeted search can answer directly.

## Required Inputs

- The request, issue, or behavior to investigate.
- Repository root and current branch/worktree context.
- Known scope, constraints, and exclusions.
- Any prior evidence that should not be rediscovered.

Resolve the suite root from this skill's source. Follow `<suite-root>/conventions/exploring-heuristics.md` and `<suite-root>/conventions/subagents.md`; never resolve these paths against the target repository.

## Step 1: Establish Repository Context

In the main context:

1. Discover and read every `AGENTS.md` that applies from repository root through the likely affected directories.
2. Inspect the root structure, manifests, workspace files, lockfiles, CI configuration, and high-signal documentation.
3. Restate the request as an engineering investigation: current behavior, desired outcome, and evidence needed before planning.
4. Identify natural seams such as applications, packages, services, libraries, infrastructure, languages, or runtime layers.

This reconnaissance exists to partition the work. Do not perform the detailed scan before dispatching agents and then repeat it through agents.

## Step 2: Choose the Exploration Shape

Use direct targeted tools when the repository is small or the affected path is already localized.

For a broad repository, select two to four independent seams and dispatch `explore` subagents concurrently. Add more only when each additional agent owns a distinct area and will reduce total work.

Good splits are evidence-driven:

- API service and web application.
- Producer and consumer of a shared contract.
- Runtime code and infrastructure/deployment configuration.
- Separate workspace packages with clear ownership.

Avoid generic frontend/backend/infra roles when the repository does not have those boundaries.

## Step 3: Dispatch Read-Only Explorers

Each subagent prompt must include:

- The issue and the specific decision its evidence should support.
- Its owned directories, execution path, or architectural concern.
- Explicit exclusions, including areas assigned to other agents.
- Paths to applicable `AGENTS.md`, this skill, and relevant conventions.
- An instruction to discover and read any deeper `AGENTS.md` files inside its owned area.
- A read-only instruction.
- The exact return contract below.

Use this return contract:

```text
Area:
Current behavior and execution path:
Relevant files and symbols (with line references):
Contracts, state, and external boundaries:
Repository conventions and commands established by evidence:
Existing tests and coverage gaps:
Risks or likely regressions:
Unknowns that code cannot answer:
```

Ask subagents to read callers, downstream consumers, nearby tests, types, and configuration when relevant. A list of filenames without a traced behavior path is not a sufficient result.

## Step 4: Synthesize, Do Not Concatenate

After direct or delegated exploration completes:

1. Merge overlapping facts into one model of the affected path.
2. Separate repository evidence from inference.
3. Resolve contradictions with one targeted read or, when subagents were used, a focused follow-up to the original agent.
4. Identify cross-seam contracts and regression risks no single agent could see.
5. Filter unknowns down to questions that can materially change implementation.

Do not paste raw agent reports or launch a second broad scan for reassurance.

## Output

Return one concise exploration brief:

```markdown
**Request**
Concrete current behavior, desired outcome, and definition of done.

**Execution Path**
Entry point -> affected modules -> downstream effects, with file references.

**Repository Constraints**
Applicable AGENTS.md instructions, architecture, toolchain, and established patterns.

**Likely Change Surface**
Files/modules likely involved and why. This is evidence, not a chosen solution.

**Verification Surface**
Relevant existing tests and repository-defined commands.

**Risks**
Contracts, state, edge cases, security boundaries, and likely regressions.

**Open Decisions**
Only questions the repository and issue cannot answer.
```

Keep the brief decision-oriented. Include file and line references for consequential claims, not for every sentence.

## Stop Conditions

Stop when the affected path, ownership seams, repository constraints, verification surface, risks, and meaningful unknowns are understood well enough for `planning`.

Stop earlier and report the blocker when the repository, issue content, generated artifacts, credentials, or external system needed for evidence is unavailable. Never fill missing evidence with assumptions.

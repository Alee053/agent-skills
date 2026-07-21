---
name: exploring-heuristics
description: "Reference rules for exploration scope, the questions exploration must answer, and when to stop. Use when discovering repository evidence before planning, or when another skill defers exploration discipline to a shared rule."
license: MIT
---

# exploring-heuristics

Exploration exists to support a correct decision, not to inventory the whole repository.

## Start Broad, Then Narrow

1. Locate applicable `AGENTS.md` files from repository root to the affected directories.
2. Inspect root manifests, workspace definitions, lockfiles, build and CI configuration, and project documentation.
3. Map natural seams such as applications, packages, services, libraries, infrastructure, or language boundaries.
4. Trace the affected path from entry point through the proposed change site to downstream consumers.
5. Read nearby tests, callers, types, configuration, and existing analogous implementations.
6. Record commands and conventions only when established by repository evidence.

## Questions Exploration Must Answer

- Where does the behavior live, and what invokes it?
- Which public interfaces, data contracts, or persisted state can change?
- Which repository conventions constrain the solution?
- Which tests prove the current and desired behavior?
- What could regress outside the obvious change site?
- What remains genuinely ambiguous after reading the code?

## Stop Condition

Stop when the affected execution path, ownership boundaries, relevant conventions, and meaningful unknowns are understood well enough to ask decision-changing questions and produce a safe plan. Do not continue scanning unrelated directories for completeness.

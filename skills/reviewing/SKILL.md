---
name: reviewing
description: "Reviews an implemented diff independently against its approved spec, repository architecture, AGENTS.md instructions, and quality standards. Use after implementation or for a standalone code review."
license: MIT
---

# reviewing

Find defects and meaningful risks before publication. This skill is read-only: it reports findings and never fixes, stages, commits, or pushes unless the caller starts a separate implementation phase.

Use it after implementation in `ship`, for a focused re-review after remediation, or standalone when the user asks to review a working tree, commit range, branch, or PR.

Resolve shared references by skill name. Load `subagents` and `verification` for the rules this skill follows.

## Review Modes and Inputs

### Workflow Review

Require:

- Approved spec, success criteria, and out-of-scope boundaries.
- Exploration summary and applicable `AGENTS.md` files.
- Base and head commits, complete diff, and commit list.
- Verification commands/results and known limitations.
- Candidate architecture or guidance changes.

### Standalone Review

Require the user's review intent and one concrete target: working-tree diff, staged diff, commit range, branch comparison, PR, or supplied patch. Inspect applicable `AGENTS.md` and repository conventions. State when no approved spec, issue context, or verification evidence is available instead of inventing it.

### Focused Re-review

Require the original findings plus the complete post-review diff, including remediation, tests, and `AGENTS.md` synchronization. Verify the fix itself and inspect nearby regression risk; do not rescan unrelated code.

## Independent Reviewer Dispatch

After implementation authorship in `ship`, dispatch one fresh `reviewer` specialist with a read-only mandate, or a read-only `general` fallback carrying this skill's instructions. For a standalone review started in a fresh context, review directly unless breadth or specialization justifies delegation. When already executing as the delegated reviewer, review directly and do not redispatch.

The prompt must include:

- Review mode, target diff/range, and intended behavior.
- Applicable instructions, architecture evidence, and explicit scope.
- Verification evidence and known limitations.
- The severity and output contracts below.
- A requirement to verify every finding against surrounding code and callers.

Independence means the reviewer did not author the implementation and receives the final diff, not only a summary from the implementer.

## Step 1: Establish the Review Surface

1. Inspect status, recent commits, base/head relationship, and the complete intended diff.
2. Read all changed files with enough surrounding context to understand behavior.
3. Trace consequential changes into callers, consumers, types, configuration, migrations, and tests.
4. Separate intended changes from unrelated pre-existing work.
5. Map success criteria to implementation and tests before judging style or structure.

Do not review only commit messages or diff snippets when repository context can establish actual behavior.

## Step 2: Review by Risk

Prioritize:

1. Correctness: wrong behavior, edge cases, error handling, state transitions, concurrency, and partial failures.
2. Regressions: changed contracts, callers, compatibility, persistence, generated outputs, and operational behavior.
3. Architecture: ownership boundaries, dependency direction, duplicated responsibilities, and consistency with established patterns.
4. Security and privacy: trust boundaries, authorization, validation, secrets, command/path handling, serialization, and data exposure.
5. Verification: whether tests exercise observable behavior, important failures, and the original defect or acceptance path.
6. Maintainability: unnecessary complexity, misleading names, hidden coupling, broad fallbacks, and stale guidance.
7. Performance and operations when the changed path makes them relevant.

Do not report subjective preferences, generic best practices without repository evidence, or formatting handled by existing tools. Combine related symptoms under the root cause.

## Step 3: Validate Findings

Before reporting a finding:

- Confirm the behavior from the complete code path, not a suspicious line alone.
- Check whether tests, types, validation, or callers already contain the risk.
- Identify a concrete failure mode or maintenance cost.
- Cite the narrowest useful file and line reference.
- Suggest the smallest safe direction, not an unsolicited rewrite.

If confidence remains low, present it as an open question rather than a defect.

## Severity Contract

- **Critical**: security exposure, data loss/corruption, broken core behavior, or a change unsafe to publish. Must fix.
- **Important**: likely functional regression, violated architecture/contract, missing required behavior, or material test gap. Must fix before publication unless the user explicitly accepts the risk.
- **Suggestion**: worthwhile maintainability or coverage improvement that does not block the approved outcome.

Each finding must contain:

```markdown
**[Severity] Short title** — `path/to/file.ext:line`
Concrete evidence, failure impact, and the smallest corrective direction.
```

Order findings by severity, then user impact. Do not inflate severity to make a review look useful.

## Output Contract

Return:

```markdown
**Findings**
Findings ordered by severity, or "No findings".

**Open Questions / Assumptions**
Only unresolved context that affects confidence.

**Verification Gaps**
Checks not run, behavior not covered, or "None identified".

**Assessment**
One short verdict on alignment with the spec, architecture, and publication readiness.
```

Findings are primary. Keep change summaries secondary and brief.

## Remediation Boundary

Return must-fix findings to `implementing`; the reviewer does not patch its own findings. Whenever remediation or synchronization changes files, review the complete post-review diff again. Stop when no must-fix findings remain or when the caller explicitly accepts a documented residual risk.

## Stop Conditions

Stop and report reduced confidence when the target diff is incomplete, generated code lacks its source, required repository context is unavailable, or verification evidence cannot be established. Never approve publication from a partial surface without stating the limitation.

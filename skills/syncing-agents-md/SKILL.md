---
name: syncing-agents-md
description: "Keeps scoped AGENTS.md guidance accurate after final verification. Use when changes may invalidate guidance or reveal durable, non-obvious repository knowledge."
license: MIT
---

# syncing-agents-md

Keep repository guidance trustworthy as the code evolves. This skill edits only applicable `AGENTS.md` files and never stages or commits them.

Use it after final verification when an implementation or review candidate indicates potentially stale guidance, a durable discovery, or changed architecture, commands, ownership, or generated-source relationships. Also use it standalone when the user asks to audit project agent guidance. Do not load it unconditionally when no trigger exists, and do not use it for changelogs, release notes, issue history, or general documentation cleanup.

Resolve shared references from the suite root, never from the target repository. No subagent is needed by default because the changed-file scope and discoveries should already be known.

## Required Inputs

- Repository root and final changed-file list or diff.
- Implementation summary and any available review findings.
- Candidate discoveries encountered during exploration, implementation, and verification.
- Existing `AGENTS.md` files and their directory scopes.
- Final architecture, commands, and verification evidence.

If the implementation is not final, defer synchronization rather than documenting an intermediate state.

## Scope Model

An `AGENTS.md` applies to its directory and descendants until a deeper file provides more specific guidance. For every changed file:

1. Discover `AGENTS.md` files from repository root through the file's directory.
2. Read the full applicable chain, not only the nearest file.
3. Attribute each existing claim to the most specific guide that owns its subject.
4. Inspect sibling or package-level guides only when the change crosses that boundary.

Do not scan and rewrite unrelated monorepo packages. A broad repository change may legitimately affect several guides; a local change usually should not.

## Step 1: Detect Invalidated Claims

Compare the final diff and repository state against applicable guidance. Look for claims about:

- File paths, package boundaries, module ownership, and dependency direction.
- Runtime behavior, data flow, public contracts, generated files, and persistence.
- Build, test, lint, typecheck, development, deployment, and migration commands.
- Required ordering, environment setup, service dependencies, and operational gotchas.
- Conventions or architecture rules the implementation intentionally changed.

Correct a claim only when repository evidence proves it stale. Preserve still-valid context and user-authored nuance.

## Step 2: Filter Discoveries

Add a discovery only when all are true:

- It is durable beyond the current issue.
- It is non-obvious from a quick read of nearby code.
- It materially changes how a future agent should explore, edit, verify, or operate the area.
- Repository evidence or a verified command confirms it.
- The appropriate `AGENTS.md` scope is clear.

Good candidates include undocumented command requirements, surprising ownership boundaries, generated-source relationships, required service ordering, and failure modes that consumed meaningful investigation.

Exclude:

- Issue summaries, decisions specific to the current feature, and implementation chronology.
- Temporary debugging steps, transient failures, local machine details, and one-off workarounds.
- Obvious facts copied from filenames, manifests, types, or comments.
- Generic engineering advice already enforced elsewhere.
- Speculation, unverified commands, and statements likely to age immediately.

The goal is fewer future dead ends, not a larger file.

## Step 3: Choose the Guidance File

Prefer the nearest existing `AGENTS.md` whose scope fully contains the claim. Put repository-wide commands and architecture in the root guide; package-specific constraints belong in the package guide.

Do not create a new nested guide merely to hold one note. Create a minimal root `AGENTS.md` only when none exists and confirmed durable guidance would otherwise be lost. Propose a new nested guide to the caller when several related, stable rules need a distinct scope; do not create it silently.

## Step 4: Edit Minimally

- Preserve the file's voice, structure, headings, and level of detail.
- Change the smallest passage that restores accuracy.
- Merge a discovery into the relevant existing section when possible.
- Remove contradictions and obsolete instructions rather than appending corrections below them.
- Use commands exactly as defined and verified by the repository.
- Avoid dates, issue IDs, contributor names, and temporary branch details.

Do not enforce a global template. Loose structure is intentional.

## Step 5: Validate

After editing:

1. Reread each changed guide against the final implementation.
2. Confirm every command, path, and architectural statement from repository evidence.
3. Check that deeper guides do not contradict the updated parent guidance.
4. Review the documentation diff for unrelated rewording or duplicated rules.
5. Return the changes to `reviewing` when synchronization happens after the main review.

The coordinating agent stages the guidance files separately and creates a `docs:` commit following `<suite-root>/conventions/commits.md`.

## Output Contract

Return:

```markdown
**Updated Guidance**
- `path/AGENTS.md`: claims corrected or discoveries added, with evidence.

**Unchanged Guidance**
- Applicable files reviewed but unchanged, with a short reason when useful.

**Rejected Discoveries**
- Candidate omitted because it was temporary, obvious, speculative, or issue-specific.

**Proposed New Scope**
- New nested AGENTS.md recommendation, or "None".
```

Keep the report concise. If no edit is warranted, say so explicitly rather than manufacturing documentation churn.

## Stop Conditions

Stop and report uncertainty when the final implementation is still changing, a claim cannot be verified, scoped guides conflict in a way the diff does not resolve, or a proposed update changes policy rather than documenting established behavior. Policy decisions belong to the user.

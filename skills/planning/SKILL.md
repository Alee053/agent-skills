---
name: planning
description: "Creates concise clarifying questions, a shared chat spec, success criteria, and an executive checkpoint plan from repository evidence. Use after exploration and before implementation."
license: MIT
---

# planning

Turn an evidence-backed request into shared intent and an approved implementation outline. This skill is read-only: it writes to chat, not repository files.

Use it after `exploring`, or standalone when the caller already supplies equivalent repository evidence. Do not use it to discover the codebase, implement changes, or expand a request beyond the user's intent.

Resolve shared references from the suite root, never from the target repository. Follow `<suite-root>/conventions/subagents.md` when specialist input is needed.

## Required Inputs

- The original issue or request.
- The exploration brief and applicable `AGENTS.md` constraints.
- Known product, architecture, security, data, deployment, and compatibility constraints.
- User answers already given in the conversation.

If repository evidence is insufficient to ask informed questions, return to `exploring` with a targeted evidence request. Do not compensate with generic assumptions.

## Step 1: Separate Facts from Decisions

Build a private decision list from the exploration brief:

- Facts established by repository evidence.
- Requirements explicitly stated by the user or issue.
- Inferences that are safe because only one repository-consistent interpretation exists.
- Open decisions with multiple materially different outcomes.

Only the last category becomes a user question. Do not ask about naming, style, tools, or file placement when repository conventions already answer them.

## Step 2: Ask Decision-Changing Questions

Ask questions when the answer can change behavior, scope, public interfaces, architecture, persistence, security, deployment, cost, compatibility, or verification.

- Ask a concise batch rather than one question per turn when decisions are independent.
- Offer concrete options and mark the recommended option with a short reason.
- State the practical consequence of each option, not abstract pros and cons.
- Allow a custom answer when the available choices are not exhaustive.
- Carry prior answers forward; never ask the same decision twice.

If an unresolved architecture choice is consequential and repository evidence does not favor one option, dispatch an `architect` specialist when available, otherwise a read-only `general` subagent with the same architecture brief. Give it the request, relevant evidence, constraints, and options. Its result informs the question; it does not replace user approval.

Repeat only while a genuinely material decision remains. Do not prolong alignment for low-impact preferences the agent can safely infer and report.

## Step 3: Render the Shared Spec

When meaningful unknowns are resolved, render a compact chat spec:

```markdown
**Spec**
3-6 sentences covering the current problem, intended behavior, affected boundary, and important constraints.

**Success Criteria**
- Observable outcome that proves the request is satisfied.
- Required edge case, compatibility behavior, or failure mode.
- Verification expectation when it is part of acceptance.

**Out of Scope**
- Only exclusions needed to prevent likely scope drift.
```

Success criteria must be observable and testable. Avoid implementation details unless the user approved them as requirements or the repository architecture dictates them.

## Step 4: Render the Executive Plan

Follow the spec with a short checkpoint plan, usually three to eight items:

```markdown
**Plan**
1. `<area/files>`: change `<behavior or structure>` so `<goal>`.
2. `<next behavior slice>`: implement and verify `<observable outcome>`.
3. `<project guidance>`: update only if implementation changes durable repository knowledge.

**Verification**
`<repository-defined targeted checks>` followed by broader checks justified by the boundary.

**Risks**
Only material regression or delivery risks and how the plan contains them.
```

Each checkpoint is one coherent, ordered, independently committable behavior slice including its tests and targeted verification. Commit shape follows `<suite-root>/conventions/commits.md`: prefer a separate test commit only when both revisions remain green. Name likely files or modules when evidence supports them; do not pretend exact paths are known when they are not.

## Approval Gate

After the spec and plan, stop and ask for explicit approval. Accept clear language such as "approved", "go", or "proceed". Questions, partial agreement, and silence are not approval.

If the user changes the requested behavior, revise the spec and affected checkpoints before asking again. Do not start implementation from a stale plan.

## Output Contract

Return exactly one state:

```text
NeedsDecision
  A concise batch of decision-changing questions, consequences, and recommendations.
  Stop without rendering a spec or plan.

ReadyForApproval
  The shared spec and success criteria.
  The executive checkpoint plan, verification, and material risks.
  A clear approval request.
```

After the user answers `NeedsDecision`, resume with all prior answers and return either another genuinely necessary decision batch or `ReadyForApproval`.

Do not create plan/spec files, edit code, commit, or dispatch implementation agents.

## Stop Conditions

Stop and return to the caller when evidence is missing, a required stakeholder decision is unavailable, the requested outcome conflicts with repository constraints, or the user declines the proposed spec. State the smallest next action that can unblock planning.

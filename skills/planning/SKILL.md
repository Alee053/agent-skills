---
name: planning
description: "Creates concise clarifying questions, a shared chat spec, success criteria, and an executive checkpoint plan from repository evidence. Use after exploration and before implementation."
license: MIT
---

# planning

Turn an evidence-backed request into shared intent and an approved implementation outline. This skill is read-only: it writes to chat, not repository files.

Use it after `exploring`, or standalone when the caller already supplies equivalent repository evidence. Do not use it to discover the codebase, implement changes, or expand a request beyond the user's intent.

Resolve shared references by skill name. Load `subagents` when specialist input is needed.

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
- Use the host's native multiple-choice question tool rather than rendering questions or requesting written answers in chat.
- On OpenCode, use `question`. Give each question a short, friendly `header` (for example, `❓ Storage`), use `multiple` only for independent choices, and keep the default custom answer enabled.
- On Claude Code, use `AskUserQuestion`. Keep headers to 12 characters, ask one to four questions per call with two to four options each, use `multiSelect` only for independent choices, and rely on its automatic `Other` choice.
- Offer concrete options with labels of one to five words. Put the recommended option first, append `(Recommended)` to its label, and describe the practical consequence of every option.
- Never add an `Other` or catch-all option; both native tools supply a custom-answer choice automatically.
- If the appropriate native tool is unavailable or denied, render the same choices under **❓ Decisions Needed** and accept a concise written answer instead.
- Carry prior answers forward; never ask the same decision twice.

If an unresolved architecture choice is consequential and repository evidence does not favor one option, dispatch an `architect` specialist when available, otherwise a read-only `general` subagent with the same architecture brief. Give it the request, relevant evidence, constraints, and options. Its result informs the question; it does not replace user approval.

Repeat only while a genuinely material decision remains. Do not prolong alignment for low-impact preferences the agent can safely infer and report.

## Step 3: Render the Shared Spec

When meaningful unknowns are resolved, render a compact chat spec:

```markdown
**📋 Spec**
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
**🗺️ Plan**
1. `<area/files>`: change `<behavior or structure>` so `<goal>`.
2. `<next behavior slice>`: implement and verify `<observable outcome>`.
3. `<project guidance>`: update only if implementation changes durable repository knowledge.

**Verification**
`<repository-defined targeted checks>` followed by broader checks justified by the boundary.

**Risks**
Only material regression or delivery risks and how the plan contains them.
```

Each checkpoint is one coherent, ordered, independently committable behavior slice including its tests and targeted verification. Commit shape follows `commits`: prefer a separate test commit only when both revisions remain green. Name likely files or modules when evidence supports them; do not pretend exact paths are known when they are not.

## Approval Gate

After the spec and plan, end with `**Approve Plan**` and ask for explicit approval. Accept clear language such as "approved", "go", or "proceed". Questions, partial agreement, and silence are not approval.

If the user changes the requested behavior, revise the spec and affected checkpoints before asking again. Do not start implementation from a stale plan.

## Output Contract

Return exactly one user-facing phase:

```text
❓ Decisions Needed
  Ask the concise decision-changing batch with the host's native question tool when available.
  Otherwise, render the same choices under this heading and accept a concise written answer.
  Stop without rendering a spec or plan.

📋 Spec and Plan for Approval
  The shared spec, success criteria, and executive checkpoint plan.
  Verification and material risks.
  End with a clear approval request.
```

After the user answers the decision batch, resume with all prior answers and return either another genuinely necessary batch or the spec and plan for approval.

Do not create plan/spec files, edit code, commit, or dispatch implementation agents.

## Stop Conditions

Stop and return to the caller when evidence is missing, a required stakeholder decision is unavailable, the requested outcome conflicts with repository constraints, or the user declines the proposed spec. State the smallest next action that can unblock planning.

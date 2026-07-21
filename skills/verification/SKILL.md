---
name: verification
description: "Reference rules for risk-based verification order and evidence standards. Use when validating changed behavior, choosing which checks to run, or when another skill defers verification discipline to a shared rule."
license: MIT
---

# verification

Verification must prove the changed behavior, not merely that files parse.

## Order

1. Reproduce the original failure or exercise the new behavior.
2. Run targeted tests for changed code.
3. Run the target repository's relevant typecheck, lint, and build commands.
4. Run broader integration or end-to-end checks when the changed boundary justifies them.
5. Review the final diff for accidental files, debug code, secrets, and unplanned scope.

Discover commands from repository manifests, CI configuration, documentation, and existing scripts. Do not invent commands from the language alone.

When a check cannot run, state the exact blocker and what remains unverified. Never describe a change as working solely because implementation finished.

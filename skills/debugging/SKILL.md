---
name: debugging
description: Systematic debugging, root cause analysis, and issue resolution
license: MIT
---

## Debugging protocol

### Phase 1: Reproduce
- Get exact steps to reproduce the issue
- Identify the expected vs. actual behavior
- Note the environment, versions, and recent changes

### Phase 2: Gather evidence
- Read error messages and stack traces carefully
- Check logs (application, system, network)
- Inspect git log for recent related changes
- Identify when the issue started (git bisect if needed)

### Phase 3: Hypothesize
- Form 2-4 plausible root causes
- Rank by likelihood and ease of verification
- Consider: recent changes, edge cases, race conditions, resource limits

### Phase 4: Test systematically
- Start with the easiest hypothesis to verify
- Change one variable at a time
- Add targeted logging or breakpoints
- Verify the fix addresses root cause, not just the symptom

### Phase 5: Verify and prevent
- Confirm the fix works in the original reproduction path
- Check for regressions in related functionality
- Add a regression test if applicable
- Document the root cause for future reference

## Common tools
- `bash` for logs, git bisect, strace, curl
- `grep` for finding related code and error patterns
- `read` for understanding call chains and data flow
- `context7` for framework-specific debugging techniques

## Anti-patterns to avoid
- Guessing and patching without understanding the root cause
- Adding try/catch to silence errors without fixing them
- Changing multiple things at once
- Assuming the bug is in the most recently changed code

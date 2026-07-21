---
name: commits
description: "Reference rules for incremental conventional commits during implementation. Use when about to stage, commit, revise implementation history, or when another skill defers commit discipline to a shared rule."
license: MIT
---

# commits

Incremental conventional commits during implementation. Do not wait until the end and collapse unrelated work into one commit.

## Format

```text
<type>(<scope>): <imperative description>
```

Use `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `ci`, `style`, or `build`. Omit the scope when the repository does not have a clear one.

## Rules

- One coherent behavior or structural change per commit.
- Keep the subject lowercase, imperative, and without a trailing period.
- Explain why in the body only when the subject is insufficient.
- Tests are required for new or changed behavior unless genuinely inapplicable.
- Prefer an immediate separate `test:` commit when implementation and test commits are each independently verifiable and green.
- Commit code and tests atomically when splitting them would create a failing or misleading intermediate revision.
- Leave each commit in a working state and run the checkpoint's narrow verification before committing.
- Inspect status and diff before staging; stage only intended files.
- Never commit secrets, credentials, `.env` files, debug artifacts, or AI attribution.
- Never amend, force-push, or rewrite published history without explicit approval. A request to create a PR does not implicitly authorize rewriting an existing remote branch.
- Keep commits local until `publishing` is explicitly requested.

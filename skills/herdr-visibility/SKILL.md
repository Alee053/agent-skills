---
name: herdr-visibility
description: "Reference rules for when to use herdr as a visibility layer for long-running processes. Use when deciding whether to run tests, builds, servers, or logs in a visible sibling pane, or when another skill defers herdr visibility discipline to a shared rule."
license: MIT
---

# herdr-visibility

herdr is an optional visibility layer for long-running processes. It is not the default subagent transport.

## Use It When

- `HERDR_ENV=1`.
- A test suite, build, server, watcher, or log stream will run long enough to benefit from a visible sibling pane.
- The process output is useful for the user to observe while the main agent continues independent work.

## Do Not Use It When

- The environment variable is absent.
- The command is short or blocks the next decision.
- A Task subagent is a better fit for isolated reasoning or code ownership.
- Splitting a pane would add coordination without useful visibility.

## Operating Rules

- Load the `herdr` skill before using the CLI.
- Discover current pane IDs; never guess or reuse stale IDs.
- Prefer `--no-focus` so the user's active context does not move.
- Wait for a specific success or failure signal, then read the relevant output.
- Report the command and result through the normal workflow.
- Close temporary panes after their output is captured unless they host a server or logs the user may still need.

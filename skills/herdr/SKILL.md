---
name: herdr
description: "Controls herdr workspaces, tabs, panes, and visible long-running processes through its CLI. Use only when HERDR_ENV=1 and a task benefits from observable terminal output."
---

# herdr

Use herdr as an optional visibility layer for servers, builds, tests, watchers, and logs. Task subagents remain the default for isolated reasoning and code work.

Before any herdr command, confirm `HERDR_ENV=1`. If it is absent, say the session is not inside herdr and continue with normal tools. Never inspect or control a focused herdr pane from outside herdr.

Load `herdr-visibility` for when-to-use rules. Read `references/cli.md` only when the task needs commands not covered here.

## Core Safety Rules

- Discover current workspace, tab, and pane IDs before acting.
- Treat IDs as temporary; they can compact when panes, tabs, or workspaces close.
- Parse IDs from create/split responses. Never assume the next pane is `1-3` or reuse an old ID without checking.
- Prefer `--no-focus` so the user's active terminal does not move.
- Use explicit timeouts for output and agent-status waits.
- Read the result before reporting success.
- Close temporary panes after capturing output unless they host a process the user still needs.

## Discover the Current Context

```bash
herdr pane list
herdr workspace list
```

The focused pane is the current agent's pane. Record its current ID before splitting.

## Run a Visible Command

Parse the pane ID returned by `pane split`, then use that variable for every later command:

```bash
CURRENT_PANE="<focused-pane-id-from-pane-list>"
NEW_PANE=$(herdr pane split "$CURRENT_PANE" --direction down --no-focus | python3 -c 'import json,sys; print(json.load(sys.stdin)["result"]["pane"]["pane_id"])')
herdr pane run "$NEW_PANE" "<command>"
```

Wait for a concrete success or failure signal with a bounded timeout:

```bash
herdr wait output "$NEW_PANE" --match "<expected output>" --timeout 60000
herdr pane read "$NEW_PANE" --source recent-unwrapped --lines 80
```

If the wait times out, inspect current output and determine whether the process failed, is still running, or used a different completion signal. Do not report success from process existence alone.

## Coordinate with a Visible Agent

Use this only when the user specifically benefits from seeing a separate interactive agent. Prefer Task subagents for normal suite orchestration.

```bash
CURRENT_PANE="<focused-pane-id-from-pane-list>"
AGENT_PANE=$(herdr pane split "$CURRENT_PANE" --direction right --no-focus | python3 -c 'import json,sys; print(json.load(sys.stdin)["result"]["pane"]["pane_id"])')
herdr pane run "$AGENT_PANE" "<agent command>"
herdr wait output "$AGENT_PANE" --match "<ready prompt>" --timeout 15000
herdr pane run "$AGENT_PANE" "<bounded task>"
herdr wait agent-status "$AGENT_PANE" --status done --timeout 120000
herdr pane read "$AGENT_PANE" --source recent-unwrapped --lines 120
```

Do not send prompts or keys to an ID that was guessed or not revalidated.

## Output Contract

Report the visible command, pane ID, completion signal, exit/failure evidence available in output, and whether the pane remains open. The normal workflow still owns the final verification decision.

## Stop Conditions

Stop herdr control when the environment marker is absent, current IDs cannot be established, a pane contains unrelated user work, a command needs interactive secrets, or the expected process state cannot be verified. Fall back to normal tools when safe.

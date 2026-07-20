# herdr CLI Reference

Load this reference only when the concise `herdr` skill does not cover the required operation. Commands communicate with the running herdr instance over its local Unix socket.

For the raw protocol, see <https://herdr.dev/docs/socket-api/>.

## Concepts

- Workspaces are project contexts containing tabs.
- Tabs are subcontexts containing panes.
- Panes are terminal splits running shells, agents, servers, or log streams.
- Agent status is `idle`, `working`, `blocked`, `done`, or `unknown`.
- `done` means an agent finished but its pane has not been viewed.
- Workspace IDs resemble `1`; tab IDs `1:2`; pane IDs `1-3`.

IDs compact as containers close. Always discover or parse the current ID immediately before use.

## Discovery

```bash
herdr workspace list
herdr tab list --workspace <workspace-id>
herdr pane list
```

List and create commands return JSON except `pane read`, which returns text.

## Tabs

```bash
herdr tab create --workspace <workspace-id> --label "logs" --no-focus
herdr tab focus <tab-id>
herdr tab rename <tab-id> "new label"
herdr tab close <tab-id>
```

Parse the created tab and root pane from `result.tab` and `result.root_pane` when needed.

## Panes

```bash
herdr pane get <pane-id>
herdr pane split <pane-id> --direction right --no-focus
herdr pane split <pane-id> --direction down --no-focus
herdr pane close <pane-id>
```

The new ID from `pane split` is `result.pane.pane_id`:

```bash
NEW_PANE=$(herdr pane split "$CURRENT_PANE" --direction right --no-focus | python3 -c 'import json,sys; print(json.load(sys.stdin)["result"]["pane"]["pane_id"])')
```

## Run and Interact

```bash
herdr pane run <pane-id> "<command>"
herdr pane send-text <pane-id> "text without Enter"
herdr pane send-keys <pane-id> Enter
```

`pane run` sends text followed by a real Enter key. These commands print nothing on success.

## Read Output

```bash
herdr pane read <pane-id> --source visible --lines 50
herdr pane read <pane-id> --source recent --lines 80
herdr pane read <pane-id> --source recent-unwrapped --lines 80
```

- `visible` is the current viewport.
- `recent` is recent scrollback as rendered.
- `recent-unwrapped` joins terminal soft wraps and matches the text used by output waits.
- `--format ansi` or `--ansi` returns a rendered ANSI snapshot for TUI feedback loops.

## Wait

```bash
herdr wait output <pane-id> --match "ready" --timeout 30000
herdr wait output <pane-id> --match "server.*ready" --regex --timeout 30000
herdr wait agent-status <pane-id> --status done --timeout 120000
```

Timeouts are milliseconds. A timeout exits with status `1`.

Read existing output before waiting for future output. Use `recent-unwrapped` to inspect the same transcript output matching sees.

## Workspaces

```bash
herdr workspace create --cwd /path/to/project --label "api server" --no-focus
herdr workspace focus <workspace-id>
herdr workspace rename <workspace-id> "new label"
herdr workspace close <workspace-id>
```

`workspace create` returns `result.workspace`, `result.tab`, and `result.root_pane`.

## Safe Recipes

### Run tests visibly

```bash
CURRENT_PANE="<focused-pane-id-from-pane-list>"
TEST_PANE=$(herdr pane split "$CURRENT_PANE" --direction down --no-focus | python3 -c 'import json,sys; print(json.load(sys.stdin)["result"]["pane"]["pane_id"])')
herdr pane run "$TEST_PANE" "<test command>"
herdr wait output "$TEST_PANE" --match "<completion signal>" --timeout 120000
herdr pane read "$TEST_PANE" --source recent-unwrapped --lines 100
```

### Run a server and wait for readiness

```bash
CURRENT_PANE="<focused-pane-id-from-pane-list>"
SERVER_PANE=$(herdr pane split "$CURRENT_PANE" --direction right --no-focus | python3 -c 'import json,sys; print(json.load(sys.stdin)["result"]["pane"]["pane_id"])')
herdr pane run "$SERVER_PANE" "<server command>"
herdr wait output "$SERVER_PANE" --match "<ready signal>" --timeout 30000
herdr pane read "$SERVER_PANE" --source recent-unwrapped --lines 60
```

### Coordinate with an existing pane

```bash
herdr pane list
herdr pane read <current-pane-id> --source recent-unwrapped --lines 80
herdr wait agent-status <current-pane-id> --status done --timeout 120000
herdr pane read <current-pane-id> --source recent-unwrapped --lines 120
```

Re-list panes before each coordination stage because IDs may have compacted.

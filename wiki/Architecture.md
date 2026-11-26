# Architecture

The project uses Electron's three-process boundary intentionally:

| Layer | Location | Responsibility |
| --- | --- | --- |
| **Main** | `src/main/` | Windows, application lifecycle, menus, folder dialogs, Jump Lists, settings persistence |
| **Preload** | `src/preload/` | Minimal typed `contextBridge` API; IPC subscriptions and calls |
| **Renderer** | `src/renderer/src/` | Svelte workspace, title-bar tabs, themes, command launcher and settings UI |
| **Shared** | `src/shared/` | Command IDs, settings types, branding and IPC API contract |

## Why the boundary matters

The renderer runs with `contextIsolation: true`, `sandbox: true` and `nodeIntegration: false`. It cannot import Node filesystem APIs or Electron internals. The preload exposes only approved methods on `window.desktop`, such as `selectFolder()`, `getSettings()`, `updateSettings()` and event subscriptions.

Avoid a generic `invoke(channel, payload)` bridge: it bypasses the narrow API and makes permissions hard to review. When adding native functionality, add one typed capability deliberately.

## Interaction flow

For example, Open Folder:

1. Svelte invokes the `folder.open` command.
2. The renderer calls `window.desktop.selectFolder()`.
3. The preload invokes the approved `folder:select` IPC handler.
4. The main process shows the native directory picker and saves the recent folder.
5. The renderer opens a workspace tab for the returned path; Windows Jump Lists refresh.

## Key files

- `src/shared/commands.ts`: titles, IDs and Jump List allowlist.
- `src/shared/settings.ts`: appearance, pinned actions, pinned tabs and recent folders.
- `src/main/settings.ts`: persisted settings under Electron's userData directory.
- `src/main/index.ts`: BrowserWindow, native event handling and Jump Lists.
- `src/renderer/src/App.svelte`: shell state and command dispatch.
- `src/renderer/src/lib/components/shell/Titlebar.svelte`: tabstrip and actions.
- `src/renderer/src/lib/components/shell/CommandLauncher.svelte`: searchable command palette.

These files are designed to be useful starting points for coding agents. The generated `AGENTS.md` documents preferred edit boundaries and validation commands.

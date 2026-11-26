# Workspace and Tabs

The window uses one continuous title bar: application mark, tabs, New Tab, draggable empty area, command search, pinned actions and native window controls. The search bar sits immediately to the left of the right-hand `+` action by default.

## Tabs

- Click a tab to select it; use `+` to add one.
- Drag tabs to reorder them within the pinned or regular section.
- Right-click a tab to pin, unpin, create or close a tab.
- Pinned tabs move to the left, display a compact icon and restore after relaunch.
- **Maximum pinned tabs: three.** The Pin menu item is disabled when the limit is reached.
- Closing a pinned tab removes it from the saved pinned set.
- Closing the last tab opens a fresh workspace tab, so the window stays usable.

Tabs can represent workspaces, Settings and About. Open Folder creates a workspace tab for the selected directory.

## Keyboard shortcuts

| Windows / Linux | macOS | Action |
| --- | --- | --- |
| `Ctrl+K` | `Cmd+K` | Open the command launcher |
| `Ctrl+T` | `Cmd+T` | New tab |
| `Ctrl+W` | `Cmd+W` | Close active tab |
| `Ctrl+O` | `Cmd+O` | Open folder |
| `Ctrl+B` | `Cmd+B` | Toggle sidebar |
| `Ctrl+,` | `Cmd+,` | Open Settings |
| `Ctrl+1`…`8` | `Cmd+1`…`8` | Switch to the tab at that position |
| `Ctrl+9` | `Cmd+9` | Switch to the final tab |

The numbering includes pinned tabs in their visible left-to-right order, matching Chromium's navigation convention.

## Pinnable action buttons

The command launcher lists registered commands and allows pinning them to the title bar. You can also manage them under Settings → Title-bar commands. Up to eight action buttons are supported; right-click one to remove it. Pin choices persist in application settings. These are **commands**, separate from **pinned tabs**.

For implementation details see [Commands and Jump Lists](Commands-and-Jump-Lists).

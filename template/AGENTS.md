# Development instructions

This application uses Electron, Svelte 5, TypeScript, Tailwind CSS 4, and shadcn-svelte.

## Architecture

- `src/main`: Electron lifecycle, native OS APIs, settings and privileged operations.
- `src/preload`: the only typed bridge from the renderer to Electron. Expose individual methods, never raw `ipcRenderer`.
- `src/shared`: platform-neutral command contracts, types and default settings.
- `src/renderer`: Svelte UI. Never use Node or Electron imports here.
- `src/renderer/src/lib/components/ui`: installed, locally owned shadcn-svelte components.
- `src/renderer/src/lib/components/shell`: reusable desktop chrome.

## Commands and window features

- Register a new application command in `src/shared/commands.ts` before adding a button or shortcut.
- Route command execution through `run()` in `App.svelte` or a domain-specific dispatcher that replaces it.
- Title-bar pinned actions use the same IDs as the command launcher. Persist pins with `AppSettings`.
- Add stable, context-free Windows Jump List tasks to `JUMP_LIST_COMMANDS`. Parse task launch arguments in the main process, including when a second instance is launched.
- Do not implement tray behavior. Closing the final window quits on Windows/Linux; macOS keeps its normal application lifecycle.
- Tabs are application views, not separate Electron windows. Keep `src/renderer/src/lib/components/shell/Titlebar.svelte` independent of domain-specific editors.

## Quality and performance

- Use Svelte 5 runes and TypeScript. Prefer direct, readable functions and early returns.
- Reuse shadcn-svelte components before building another UI primitive.
- Use Tailwind and theme tokens for application appearance; retain the draggable title-bar CSS regions.
- Use `pnpm format`, `pnpm lint`, `pnpm typecheck`, and `pnpm test` before submitting changes.
- Test actual user interactions. The Playwright suite covers tabs, command search and title-bar action pins.
- Do not add boilerplate pages, unused services, empty abstraction layers, or fake controls.

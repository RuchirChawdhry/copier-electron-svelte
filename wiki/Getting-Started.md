# Getting Started

## Prerequisites

- Python environment capable of running Copier 9 (`uvx copier` also works).
- Node.js 24 and pnpm 11.
- Windows, Linux or macOS for development. Native installers should be built and checked on their target operating systems.

## Create an application

```bash
copier copy --trust https://github.com/RuchirChawdhry/copier-electron-svelte.git desktop-demo
cd desktop-demo
pnpm dev
```

Copier prompts for the application name, package slug, GitHub owner, author, description and application ID. It also asks whether to initialize Git and install dependencies. The reverse-DNS application ID is important on Windows: Electron uses it for the taskbar identity and Jump Lists.

For a noninteractive render without running setup tasks:

```bash
copier copy --defaults --skip-tasks https://github.com/RuchirChawdhry/copier-electron-svelte.git desktop-demo
cd desktop-demo
pnpm install
```

## Daily workflow

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Launch Electron and Vite in development mode |
| `pnpm format` | Format project source |
| `pnpm lint` | Run Oxlint and ESLint |
| `pnpm typecheck` | Check Electron TypeScript and Svelte |
| `pnpm test` | Run Vitest unit tests |
| `pnpm build` | Produce production Electron bundles |
| `pnpm test:e2e` | Run Playwright UI tests (graphical session required) |

If you skipped trusted tasks, run `pnpm exec lefthook install` after initializing Git to enable the pre-commit hook.

## Where to work

Start with `src/renderer/src/App.svelte` for the workspace UI. Add reusable UI components under `src/renderer/src/lib/components/`, app commands in `src/shared/commands.ts`, and native operations behind `src/preload/index.ts`. Keep raw Node and Electron APIs out of the renderer.

Next: [Architecture](Architecture) or [Workspace and Tabs](Workspace-and-Tabs).

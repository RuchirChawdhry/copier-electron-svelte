# copier-electron-svelte

An opinionated Copier template for desktop applications with Electron, Svelte 5, TypeScript, Tailwind CSS 4 and shadcn-svelte.

Generated applications include:

- Borumi-style title-bar tabs, including drag reordering, tab menus and a theme-matching workspace context menu.
- Browser-style pinned tabs (up to 3) restored on launch; Ctrl/Cmd+1–9 tab switching.
- A searchable command launcher in the title bar (`Ctrl+K` or `Cmd+K`).
- Pinnable title-bar action buttons, with persisted preferences.
- Windows Jump List tasks and recent workspaces.
- A collapsible workspace sidebar, settings, dark/light/Solarized Dark themes and status bar.
- A narrowly scoped, typed Electron preload API with context isolation and sandboxing.
- TypeScript, ESLint, Oxlint, Prettier, Vitest, Playwright and Lefthook.
- NSIS/MSI, AppImage/DEB and DMG/ZIP packaging scripts.
- A generated GitHub Actions workflow calling `RuchirChawdhry/ci-workflows`.

No system tray, hosted backend, account system or SQLite database is included.

## Documentation

- [Starlight documentation site](https://ruchirchawdhry.github.io/copier-electron-svelte/)
- [GitHub Wiki](https://github.com/RuchirChawdhry/copier-electron-svelte/wiki)
- [Editable documentation source](wiki/) — both destinations use the same pages.
- [Site sitemap index](https://ruchirchawdhry.github.io/copier-electron-svelte/sitemap-index.xml) — generated and validated by the shared Starlight workflow.

Documentation deployment and wiki synchronization reuse the `wiki-pages.yml` and `wiki-publish.yml` reusable workflows from `RuchirChawdhry/ci-workflows`.

## Generate a project

Install [Copier](https://copier.readthedocs.io/) and Node.js 24 with pnpm 11, then run:

```bash
copier copy --trust https://github.com/RuchirChawdhry/copier-electron-svelte.git my-app
cd my-app
pnpm dev
```

`--trust` permits the template's optional setup tasks to initialize Git, install dependencies and install hooks. Without it, run `pnpm install` and `pnpm exec lefthook install` manually.

You can update generated projects when new template releases are tagged using `copier update --trust`.

## Template source

- [`copier.yml`](copier.yml) — questions and setup tasks.
- [`template/`](template/) — application source and tooling.
- [`template/AGENTS.md`](template/AGENTS.md) — generated agent development conventions.

## Template verification

Generate a temporary project with Copier, then run `pnpm typecheck`, `pnpm lint`, `pnpm test` and `pnpm build` inside it. Desktop E2E tests require a graphical session and a Playwright browser installation.

The repository's [Windows template tests](.github/workflows/windows-ci.yml) workflow automatically validates a freshly generated app on `windows-latest`, including Playwright desktop tests. The separate [Windows UI screenshots (WinApp)](.github/workflows/windows-screenshots.yml) workflow runs only when manually dispatched from GitHub Actions. It captures eight application views, including the open right-click workspace menu, directly with Microsoft WinApp CLI, replaces the version-controlled PNGs in root-level [`screenshots/`](screenshots/), and uploads an artifact. See [Quality and CI](wiki/Quality-and-CI.md) for usage and Windows desktop-session requirements.

# copier-electron-svelte

An opinionated Copier template for desktop applications with Electron, Svelte 5, TypeScript, Tailwind CSS 4 and shadcn-svelte.

Generated applications include:

- Borumi-style title-bar tabs, including drag reordering, tab menus and a theme-matching workspace context menu.
- Browser-style pinned tabs (up to 3) restored on launch; Ctrl/Cmd+1–9 tab switching.
- A searchable command launcher in the title bar (`Ctrl+K` or `Cmd+K`).
- Pinnable title-bar action buttons, with persisted preferences.
- Windows Jump Lists with native system icons, action shortcuts, pinned workspaces and recent folders.
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

Install [Copier](https://copier.readthedocs.io/), [Task](https://taskfile.dev/docs/installation) and Node.js 24 with pnpm 11, then run:

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

Run `task build` at this repository root to generate the default app and create an unpacked production build in `.local-generated/dist/`. The generated app also supports `task build` directly, plus `task build:win`, `task build:linux` and `task build:mac` for installers. Development tools are excluded from `app.asar`; production DevTools and Node inspector entry points are disabled. Chromium's embedded DevTools implementation remains in the standard Electron runtime and would require a custom Electron build to remove physically.

To verify a generated app, run `pnpm lint`, `pnpm test` and `task build` inside it. Desktop E2E tests require a graphical session and a Playwright browser installation.

The repository's [Windows template tests](.github/workflows/windows-ci.yml) workflow automatically validates a freshly generated app on `windows-latest`, including Playwright desktop tests. The separate [Windows UI screenshots (WinApp)](.github/workflows/windows-screenshots.yml) workflow runs only when manually dispatched from GitHub Actions. It captures nine application views, including the open right-click workspace menu and the native Windows taskbar Jump List, directly with Microsoft WinApp CLI, replaces the version-controlled PNGs in root-level [`screenshots/`](screenshots/), and uploads an artifact. See [Quality and CI](wiki/Quality-and-CI.md) for usage and Windows desktop-session requirements.

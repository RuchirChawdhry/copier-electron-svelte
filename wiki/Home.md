# Electron + Svelte Copier Template

Build your next desktop app with an already useful workspace shell: Electron, Svelte 5, TypeScript, shadcn-svelte, a tabbed title bar, command launcher, and Windows integration.

## Highlights

- **Workspace ready**: Sidebar, tabs, command launcher, status bar and preferences are already wired together.
- **Desktop integration**: Native folder picker, secure preload boundary and Windows Jump List actions with recent folders.
- **Three themes**: Dark by default, light and a warm Solarized-inspired sepia palette.
- **Agent-friendly**: Shared command definitions, type checking, linting, tests and an `AGENTS.md` in every generated project.
- **Repeatable releases**: Electron Builder targets Windows, Linux and macOS; generated CI reuses centralized workflows.

## Quick start

Install Copier, Node.js 24 and pnpm 11, then run:

```bash
copier copy --trust https://github.com/RuchirChawdhry/copier-electron-svelte.git my-app
cd my-app
pnpm dev
```

`--trust` authorizes the optional setup tasks: Git initialization, dependency installation and Lefthook configuration.

## Read next

- [Getting Started](Getting-Started) — template questions, setup and daily commands.
- [Workspace and Tabs](Workspace-and-Tabs) — pinned tabs, keyboard shortcuts and title-bar actions.
- [Commands and Jump Lists](Commands-and-Jump-Lists) — extend native and in-app commands.
- [Themes and Styling](Themes-and-Styling) — customize dark, light, sepia and shadcn-svelte.
- [Architecture](Architecture) — main/preload/renderer boundaries.
- [Quality and CI](Quality-and-CI) — validation and packaging.
- [Copier Reference](Copier-Reference) — template maintenance and upgrades.
- [Troubleshooting](Troubleshooting) — common setup and platform issues.

The [source repository](https://github.com/RuchirChawdhry/copier-electron-svelte) is public. This wiki is maintained as Markdown in its `wiki/` directory; the same pages are rendered into the GitHub Pages documentation site.

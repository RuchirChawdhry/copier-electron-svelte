# Themes and Styling

The template ships with three complete application themes:

| Theme | Intent | Shell background |
| --- | --- | --- |
| **Dark** | Default, low-glare flat desktop style | `#101010` |
| **Light** | Neutral, high-contrast working surface | `#ffffff` |
| **Solarized** | Solarized Dark, with low-glare teal surfaces and readable text | `#002b36` |

Open Settings → Appearance to switch themes. The title-bar action **Switch theme** cycles Dark → Light → Solarized → Dark. The choice is saved in the user's application settings and restored on relaunch.

Solarized uses [Ethan Schoonover's palette](https://ethanschoonover.com/solarized/): `base03` (`#002b36`) for the main workspace, `base02` (`#073642`) for the sidebar and cards, and `base1` (`#93a1a1`) for text. The text colors have at least a 4.5:1 contrast ratio against those surfaces, including the small labels in the title bar and sidebar.

## Where colors live

`src/renderer/src/assets/main.css` contains two related token groups:

- shadcn-svelte semantic colors (`--background`, `--foreground`, `--card`, `--accent`, `--ring`, etc.);
- workspace shell colors (`--shell-title`, `--shell-tab`, `--shell-tab-active`, `--shell-sidebar`, `--shell-main`, `--shell-stroke`).

The renderer uses `.dark` for the dark and Solarized themes, and adds `.solarized` for Solarized-specific colors. The default `:root` tokens provide light mode. This lets Solarized share shadcn's dark-mode variants while overriding its color tokens. Keep new components on semantic tokens so they follow all three themes without hand-written per-component variants.

Windows and Linux window controls are part of Electron's title-bar overlay, so the renderer informs the main process when the theme changes. `BrowserWindow.setTitleBarOverlay()` adjusts the native control background and symbol colors without rebuilding the window. macOS retains its native traffic-light controls.

## UI component conventions

Use existing shadcn-svelte components before writing a new control. Components live in `src/renderer/src/lib/components/ui/`; workspace-specific components live in `lib/components/shell/`. Use Svelte 5 runes and TypeScript. Keep the title bar flat, context menus square-edged and non-draggable interactive controls marked appropriately.

See [Workspace and Tabs](Workspace-and-Tabs) for title-bar behavior.

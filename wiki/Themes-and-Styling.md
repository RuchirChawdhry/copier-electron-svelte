# Themes and Styling

The template ships with three complete application themes:

| Theme | Intent | Shell background |
| --- | --- | --- |
| **Dark** | Default, low-glare flat desktop style | `#101010` |
| **Light** | Neutral, high-contrast working surface | `#ffffff` |
| **Sepia** | Warm paper-like Solarized-inspired palette | `#fdf6e3` |

Open Settings → Appearance to switch themes. The title-bar action **Switch theme** cycles Dark → Light → Sepia → Dark. The choice is saved in the user's application settings and restored on relaunch.

## Where colors live

`src/renderer/src/assets/main.css` contains two related token groups:

- shadcn-svelte semantic colors (`--background`, `--foreground`, `--card`, `--accent`, `--ring`, etc.);
- workspace shell colors (`--shell-title`, `--shell-tab`, `--shell-tab-active`, `--shell-sidebar`, `--shell-main`, `--shell-stroke`).

The renderer toggles `.dark` or `.sepia` on the document root. The default `:root` tokens provide light mode. Keep new components on semantic tokens so they follow all three themes without hand-written per-component variants.

Windows and Linux window controls are part of Electron's title-bar overlay, so the renderer informs the main process when the theme changes. `BrowserWindow.setTitleBarOverlay()` adjusts the native control background and symbol colors without rebuilding the window. macOS retains its native traffic-light controls.

## UI component conventions

Use existing shadcn-svelte components before writing a new control. Components live in `src/renderer/src/lib/components/ui/`; workspace-specific components live in `lib/components/shell/`. Use Svelte 5 runes and TypeScript. Keep the title bar flat, context menus square-edged and non-draggable interactive controls marked appropriately.

See [Workspace and Tabs](Workspace-and-Tabs) for title-bar behavior.

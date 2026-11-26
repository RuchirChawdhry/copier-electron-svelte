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

## Fonts

The template bundles the **Inter Variable** font through `@fontsource-variable/inter` and imports it in `src/renderer/src/assets/main.css`. It works offline, without a hosted font service. Inter is used for the shell, settings, buttons and shadcn-svelte's `font-sans` utility; the base UI text is 13 px, with smaller labels in the title bar and status bar. No additional display or monospace font is bundled.

To switch to another family, replace the Fontsource dependency and CSS `@import`, then change **`--app-font-family`** in `:root`. Both the application body and Tailwind's `font-sans` utility read this single token, so no component-by-component font edits are needed.

## Scrollbars

The renderer styles Chromium's `::-webkit-scrollbar` parts with an 11 px track and a narrow rounded thumb. The track remains transparent, while the thumb and hover colors come from each theme's `--scrollbar-thumb` tokens. Scrollable workspace content, menus and command results follow the selected theme; the compact horizontal tab and pinned-action strips intentionally hide their scrollbars. A standards-based `scrollbar-color`/`scrollbar-width` fallback covers browsers without the Chromium pseudo-elements.

## UI component conventions

Use existing shadcn-svelte components before writing a new control. Components live in `src/renderer/src/lib/components/ui/`; workspace-specific components live in `lib/components/shell/`. Use Svelte 5 runes and TypeScript. Keep the title bar flat, context menus square-edged and non-draggable interactive controls marked appropriately.

See [Workspace and Tabs](Workspace-and-Tabs) for title-bar behavior.

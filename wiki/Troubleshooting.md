# Troubleshooting

## The application will not start

Run `pnpm install` in the generated project, then `pnpm dev`. Ensure Node.js 24 and pnpm 11 are installed. Electron downloads its platform runtime during installation.

## The title bar or command launcher looks unstyled

Check `src/renderer/src/assets/main.css`, `electron.vite.config.ts` and the installed Tailwind/shadcn dependencies. The UI uses semantic CSS variables; directly setting arbitrary component background colors can break theme switching.

## Pinned tabs are missing after relaunch

Confirm that the tab was pinned from its right-click menu and that the app can write to Electron's userData directory. Only pinned tabs are restored automatically; other temporary tabs are not persisted.

## Windows Jump Lists do not appear

Jump Lists are installed only in a packaged Windows build, not during `pnpm dev`. Build an installer, install and launch the app, then check the taskbar's context menu. Verify that `app_id` in Electron Builder and the main process's AppUserModelID agree. The OS controls whether or when categories appear.

## Playwright fails on a headless Linux runner

Electron UI tests need a graphical display; run with an X server (for example, `xvfb-run`). Browser-only Playwright tests need Chromium installed through Playwright or a valid `CHROMIUM_BIN` executable.

## GitHub Pages did not deploy

In repository Settings → Pages, select **GitHub Actions** as the build/deployment source. Then check the documentation workflow's latest run. The deployed project URL is `https://ruchirchawdhry.github.io/copier-electron-svelte/`.

## Wiki sync fails

GitHub's Wiki must be enabled and initialized with a Home page at least once. The reusable wiki publish job can then push the managed `wiki/*.md` pages. If GitHub's workflow token lacks wiki write access, configure a `WIKI_TOKEN` secret with the required repository permissions. The Starlight site is independent of Wiki git-push authentication because it builds from the committed Markdown files.

See [Quality and CI](Quality-and-CI) for the validation commands.

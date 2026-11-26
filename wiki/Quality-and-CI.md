# Quality and CI

The generated application has four levels of checks:

| Stage | Command | Scope |
| --- | --- | --- |
| Formatting | `pnpm format` | Prettier, including Svelte |
| Static validation | `pnpm lint` and `pnpm typecheck` | Oxlint, ESLint, TypeScript, svelte-check |
| Unit tests | `pnpm test` | Vitest command and application logic |
| Desktop integration | `pnpm test:e2e` | Playwright Chromium and Electron interaction |

The pre-commit Lefthook setup keeps routine edits formatted. Full tests and production builds belong in CI; do not require a long desktop test run on every local commit.

## Centralized CI

Generated projects contain `.github/workflows/checks.yml`, which calls `RuchirChawdhry/ci-workflows/.github/workflows/node-ci.yml@main`. It validates the generated app rather than running a duplicate Node pipeline maintained in each template.

The **template repository** keeps its documentation publishing workflows separate. Starlight pages are built from `wiki/*.md` by the reusable `wiki-pages.yml` workflow in `ci-workflows`. The wiki synchronization workflow also lives there; the two destinations read the same source pages.

## Packaging

Use the generated scripts:

```bash
pnpm build:win
pnpm build:linux
pnpm build:mac
```

Electron Builder configurations include Windows NSIS and MSI, Linux AppImage and DEB, and macOS DMG and ZIP. Build and smoke-test native packages on the target OS. Windows Jump Lists require a packaged Windows app; a Linux unit test does not validate the taskbar integration.

## Documentation validation

The Starlight workflow publishes HTML plus Markdown mirrors, `llms.txt`, `llms-full.txt` and an Astro sitemap. The repository's tracked `sitemap.xml` is generated from the same `wiki/` file names. When changing wiki pages, regenerate it with `python3 scripts/generate_sitemap.py` and commit both changes.

See [Troubleshooting](Troubleshooting) when a check fails.

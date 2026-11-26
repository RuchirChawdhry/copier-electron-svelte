# Quality and CI

The generated application has four levels of checks:

| Stage | Command | Scope |
| --- | --- | --- |
| Formatting | `pnpm format` | Prettier, including Svelte |
| Static validation | `pnpm lint` and `pnpm typecheck` | Oxlint, ESLint, TypeScript, svelte-check |
| Unit tests | `pnpm test` | Vitest command and application logic |
| Desktop integration | `pnpm test:e2e` | Playwright Chromium and Electron interaction |
| Windows screenshots | `pnpm test:screenshots` | Playwright navigation plus WinApp CLI PNG capture of each built-in screen |

The pre-commit Lefthook setup keeps routine edits formatted. Full tests and production builds belong in CI; do not require a long desktop test run on every local commit.

## Centralized CI

Generated projects contain `.github/workflows/checks.yml`, which calls `RuchirChawdhry/ci-workflows/.github/workflows/node-ci.yml@main`. It validates the generated app rather than running a duplicate Node pipeline maintained in each template.

The **template repository** keeps its documentation publishing workflows separate. Starlight pages are built from `wiki/*.md` by the reusable `wiki-pages.yml` workflow in `ci-workflows`. The wiki synchronization workflow also lives there; the two destinations read the same source pages.

## Template repository Windows workflows

- **Windows template tests** (`windows-ci.yml`) runs automatically on pushes to `main` and pull requests that modify the template. It renders a fresh Copier application on `windows-latest`, installs the generated app's pinned Node/pnpm dependencies, then lints, typechecks, runs Vitest, builds Electron, and runs the Playwright desktop integration tests.
- **Windows UI screenshots (WinApp)** (`windows-screenshots.yml`) is a separate **manual** GitHub Actions workflow. Select it under the repository's **Actions** tab, choose **Run workflow**, then download the `windows-ui-screenshots` artifact. It builds a fresh generated app and uses [Microsoft WinApp CLI](https://github.com/microsoft/winappCli) to capture seven states: dark workspace, command launcher, pinned tabs, dark/light/sepia Settings, and About.

The screenshot workflow requires Windows graphical capture support. GitHub-hosted `windows-latest` runners may not expose a usable interactive desktop to Windows Graphics Capture; if captures fail despite successful builds, use a self-hosted Windows runner with an active desktop session. Failed screenshot commands fail the visual test, and the artifact upload still attempts to retain any captures already produced.

## Packaging

Use the generated scripts:

```bash
pnpm build:win
pnpm build:linux
pnpm build:mac
```

Electron Builder configurations include Windows NSIS and MSI, Linux AppImage and DEB, and macOS DMG and ZIP. Build and smoke-test native packages on the target OS. Windows Jump Lists require a packaged Windows app; a Linux unit test does not validate the taskbar integration.

## Documentation validation

The shared Starlight workflow publishes HTML plus Markdown mirrors, `llms.txt`, `llms-full.txt`, and Astro's `sitemap-index.xml` and sitemap pages. It also validates sitemap coverage. Edit the pages under `wiki/`; no per-repository sitemap script or tracked XML file is needed.

See [Troubleshooting](Troubleshooting) when a check fails.

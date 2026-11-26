# Copier Reference

`copier.yml` at the repository root defines the questions and rendering rules. The source application lives in `template/`; only `*.jinja` files use Jinja interpolation, and Copier removes the suffix in generated output.

## Questions

| Variable | Purpose |
| --- | --- |
| `project_name` | Visible application name |
| `project_slug` | npm package and executable-friendly name |
| `github_owner` | GitHub account used in metadata |
| `author` | Package author metadata |
| `description` | Application summary |
| `app_id` | Reverse-DNS identity; must stay stable for installed Windows apps |
| `initialize_git` | Initialize a new Git repository |
| `install_dependencies` | Run pnpm install and install Git hooks |

`template/package.json.jinja`, `template/electron-builder.yml.jinja`, `template/src/shared/brand.ts.jinja`, `template/src/main/index.ts.jinja` and other parameterized files take their metadata from these answers. The rest of the application remains ordinary editable source.

## Update a generated app

Copier records the template source and version in `.copier-answers.yml`. Once the template has a release tag:

```bash
copier update --trust
```

Review conflicts carefully when both your app and the template have changed the same shell files. Keep app-specific business logic outside shared shell files when practical.

## For template maintainers

1. Edit the source under `template/` or the questions in `copier.yml`.
2. Generate a fresh project into a temporary directory with `copier copy --defaults --skip-tasks`.
3. Install its locked dependencies and run lint, typecheck, unit tests and build.
4. Test any Electron integration on its actual operating system.
5. Tag a tested release when the generated contract is stable.

The [Getting Started](Getting-Started) page covers the consumer workflow.

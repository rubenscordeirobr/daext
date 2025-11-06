Welcome DAEx (Departamento de Exatas) website repository!

This file explains the repository conventions, lint/format rules.

## Quick start (local)

1. Install dependencies (requires Node 18+, pnpm):

    ```powershell
    pnpm install
    ```

2. Start the development servers:

    ```powershell
    pnpm dev
    ```

3. Run only web dev (optional):

    ```powershell
    pnpm -C apps/web dev
    ```

## Formatting and linting

We enforce code style and quality using Prettier and ESLint.

- Prettier config: `.prettierrc` (4 spaces, semicolons on).
- ESLint: rules live under `packages/eslint-config/` and are applied across packages.
- Indentation: 4 spaces.
- Semicolons: required.

Commands you should know:

- `pnpm format` — reformat the entire workspace with Prettier.
- `pnpm format:check` — fail if formatting is required.
- `pnpm lint` — run ESLint across the workspace.

## Pre-commit hooks (Husky + lint-staged)

We run Prettier and ESLint on staged files automatically. When you make local commits:

- Husky runs `lint-staged` to format and auto-fix staged files.
- If lint errors remain, the commit will be blocked so you can fix them.

If you need to bypass hooks (not recommended):

```powershell
git commit --no-verify -m "WIP"
```

## Continuous Integration

We run a GitHub Actions workflow on PRs and pushes to `main` that:

1. Installs dependencies with pnpm (pnpm is set up inside the workflow).
2. Runs ESLint and Prettier checks.
3. Optionally (on PRs) runs an `autofix` job that will format files and push them back to the PR branch.

### Auto-fix push behavior

- The `autofix` job will attempt to push formatting changes back to the PR branch using the repository `GITHUB_TOKEN` by default.
- Some organizations or branch protection rules prevent `GITHUB_TOKEN` from pushing — in that case add a Personal Access Token (PAT) with repo write permissions as a repository secret named `BOT_TOKEN`.

To add `BOT_TOKEN`:

1. Create a PAT at https://github.com/settings/tokens (scopes: `repo` for private repositories).
2. In GitHub, go to the repository > Settings > Secrets and variables > Actions > New repository secret.
3. Name it `BOT_TOKEN` and paste the PAT.

If `BOT_TOKEN` is present the workflow will use it — otherwise it falls back to `GITHUB_TOKEN`.

Note: pushes made with `GITHUB_TOKEN` do not re-trigger workflows by default (avoids loops). Using a PAT can re-trigger workflows if desired.

## Code style and rules highlights

- TypeScript strictness: prefer `unknown` over `any` when possible.
- Use `ReturnType<typeof setTimeout>` for browser-safe timeout types.
- Promise-returning handlers should be awaited or called with `void` when used as event handlers.

## Troubleshooting

- If CI reports `pnpm not found`, ensure the workflow contains a step to install pnpm (we use `pnpm/action-setup` already).
- If `autofix` fails to push, check repository secrets and branch protection rules.

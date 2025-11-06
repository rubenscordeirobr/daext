# DAEx Monorepo – AI Coding Agent Instructions

## Project Overview

This is a monorepo for the **Departamento Acadêmico de Exatas (DAEx)** website at UTFPR Guarapuava. The project is a TypeScript-based academic portal with three apps (web, admin, api) and shared packages, managed via **pnpm workspaces**.

**Key Context:** This is a Portuguese-Brazilian academic website (`pt-br` default locale) for professors, research projects, and news. Brand colors: Yellow `#ffbf00`, Black `#000000`, White `#FFFFFF`, Background `#fafdfd`.

## Architecture & Structure

### Monorepo Layout (pnpm workspaces)

```
apps/
  web/      # Public React site (Vite + React Router + Tailwind + i18next)
  admin/    # Admin dashboard (Vite + React, scaffold)
  api/      # Fastify REST API (TypeScript)
packages/
  domain/   # Shared domain models (NewsArticle, Professor, ResearchProject)
  api-client/  # HTTP client (BaseClient + resource-specific clients)
  ui/       # Shared React components (Button, etc.)
  eslint-config/  # Flat ESLint configs (base, react, node)
  tsconfig/  # Shared TypeScript configs (base, react, node)
```

### Critical Dependencies

- **Apps:** Vite, React 18, React Router 6, Fastify, i18next, Tailwind CSS
- **Tooling:** pnpm 9.12.3, TypeScript 5.x, ESLint (flat config), Prettier, Husky + lint-staged
- **API Data:** JSON file-based storage via `JsonStore<T>` (see `apps/api/src/infrastructure/json-store.ts`)

### Service Architecture Pattern

API modules follow a layered pattern (see `apps/api/src/modules/news/`):

1. **Repository interface** (`news.repository.ts`) – defines data operations
2. **JSON implementation** (`json-news.repository.ts`) – uses `JsonStore<T>`
3. **Service layer** (`news.service.ts`) – business logic
4. **Routes** (`news.routes.ts`) – Fastify endpoints with Zod validation

**Example:** Creating a new resource requires all 4 layers + registering routes in `apps/api/src/index.ts`.

### Domain Models

All domain types live in `packages/domain/src/`:

- `NewsArticle` – status: `draft | scheduled | published`, uses ISO date strings
- `Professor` – linked to Lattes curriculum
- `ResearchProject` – associated with professors
- **Primitives:** `EntityId` (string), `Slug` (string), `ISODateString` (string)

Always import domain types from `@daext/domain` (workspace alias).

## Development Workflow

### Setup & Running

```powershell
# First time setup
corepack enable
corepack prepare pnpm@9.12.3 --activate
pnpm install

# Run all apps concurrently (web:5173, admin:5174, api:3000)
pnpm dev

# Run individual apps
pnpm dev:web
pnpm dev:admin
pnpm dev:api
```

### Code Quality (Pre-commit Enforcement)

- **Formatting:** 4 spaces, semicolons required (see `.prettierrc`)
- **Linting:** Flat ESLint configs in `packages/eslint-config/` (base, react, node)
- **Pre-commit:** Husky + lint-staged auto-formats and lints staged files
- **Commands:**
    - `pnpm format` – format entire workspace
    - `pnpm lint` – lint all packages
    - `pnpm typecheck` – TypeScript checks across workspace

**Important:** All edits must follow 4-space indentation and include semicolons. ESLint enforces `projectService: true` for type-aware linting.

### Build & Deploy

```powershell
# Build all apps
pnpm build

# Build-specific deployments (web only)
pnpm -C apps/web run build            # Root domain (/)
pnpm -C apps/web run build:relative   # Relative paths (CDN, file system)
pnpm -C apps/web run build:subdirectory  # Subdirectory (/daext/)
pnpm -C apps/web run build:github-pages  # GitHub Pages
```

**Critical Asset Path Handling:** Web app uses `getAssetPath()` from `apps/web/src/utils/assetPath.ts` for deployment-agnostic asset loading. Vite injects `__BASE_PATH__` at build time (see `apps/web/vite.config.ts`).

**Always use `getAssetPath('assets/images/...')` for static assets in React components.**

## Project-Specific Conventions

### Import Patterns

- **Domain types:** `import { NewsArticle } from '@daext/domain';`
- **API client:** `import { NewsClient } from '@daext/api-client';`
- **Shared UI:** `import { Button } from '@daext/ui';`
- **Use `.js` extensions in API imports** (ESM requirement): `'./infrastructure/json-store.js'`

### React Conventions (apps/web)

- **Routing:** React Router 6 with lazy-loaded pages (`apps/web/src/router/config.tsx`)
- **i18n:** i18next with `pt-br` default, messages in `apps/web/src/i18n/local/`
- **Auto-imports:** Vite `unplugin-auto-import` configured for React hooks (no manual React import needed)
- **Tailwind:** Config at `apps/web/tailwind.config.ts` (uses brand colors)

### API Conventions (apps/api)

- **Validation:** Zod schemas for request validation (see `news.routes.ts`)
- **Error handling:** Custom errors in `apps/api/src/core/errors.ts` (e.g., `NotFoundError`)
- **CORS:** Localhost origins allowed in dev (see `apps/api/src/index.ts`)
- **File storage:** JSON files in `apps/api/data/` directories (news, professors, research)

### TypeScript Strictness

- Prefer `unknown` over `any`
- Use `ReturnType<typeof setTimeout>` for browser-safe timeout types
- Await promise-returning handlers or use `void` prefix for event handlers

## Critical Files to Reference

| File                              | Purpose                               |
| --------------------------------- | ------------------------------------- |
| `pnpm-workspace.yaml`             | Workspace configuration               |
| `packages/domain/src/index.ts`    | All domain types                      |
| `apps/api/src/index.ts`           | API entry point, module registration  |
| `apps/web/src/router/config.tsx`  | Route definitions                     |
| `apps/web/src/utils/assetPath.ts` | Deployment path handling              |
| `packages/eslint-config/base.js`  | ESLint rules (4 spaces, semicolons)   |
| `BRIEFING.md`                     | Project requirements & design specs   |
| `CODE_STYLE.md`                   | Formatting & lint workflow            |
| `DEPLOY.md`                       | Deployment scenarios & build commands |

## Common Tasks

### Adding a New Domain Model

1. Create type in `packages/domain/src/<name>.ts`
2. Export from `packages/domain/src/index.ts`
3. Add validation function (e.g., `isNewsArticle()`)
4. Update API module (repository, service, routes)
5. Add JSON data file in `apps/api/data/<name>/`

### Adding a New API Endpoint

1. Define Zod schema in `<module>.routes.ts`
2. Add method to `<Module>Service`
3. Implement in `Json<Module>Repository` (if data access needed)
4. Register route handler in `register<Module>Routes()`
5. Test with CORS-enabled dev servers (`pnpm dev`)

### Adding a New Route (Web)

1. Create page component in `apps/web/src/pages/<name>/page.tsx`
2. Add lazy import in `apps/web/src/router/config.tsx`
3. Define route in `routes` array
4. Use `getAssetPath()` for any static assets

## Troubleshooting

- **"pnpm not found" in CI:** Workflow uses `pnpm/action-setup@v2`
- **Lint-staged fails:** Check 4-space indentation and semicolons
- **Asset 404s:** Verify `getAssetPath()` usage and build script (`BASE_PATH` env var)
- **CORS errors:** Ensure API origin check allows your dev port (see `apps/api/src/index.ts`)
- **Type errors in ESLint:** Verify `projectService: true` in ESLint config

## Quick Reference Commands

```powershell
pnpm install          # Install all dependencies
pnpm dev              # Run all apps (web, admin, api)
pnpm build            # Build all apps
pnpm lint             # Lint workspace
pnpm format           # Format workspace
pnpm typecheck        # TypeScript check
pnpm clean            # Remove node_modules and build artifacts
```

## Notes for AI Agents

- **Respect 4-space indentation and semicolons** – enforced by pre-commit hooks
- **Use workspace aliases** (`@daext/domain`, `@daext/api-client`) in imports
- **Check `BRIEFING.md`** for UI/UX requirements and brand guidelines
- **Reference existing modules** (e.g., `news`) when creating new API resources
- **Always use `getAssetPath()`** for static assets in web app components
- **Portuguese content default:** News, professor bios, and UI text are in `pt-br`

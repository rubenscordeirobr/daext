# DAEx Monorepo

This repository now uses a pnpm-powered workspaces setup. The high level structure is:

- `apps/web` – public site (existing Vite React codebase)
- `apps/admin` – admin dashboard scaffold (Vite React)
- `apps/api` – Fastify + TypeScript API scaffold
- `packages/ui` – shared React component library scaffold
- `packages/tsconfig` – shared TypeScript configs
- `packages/eslint-config` – shared Flat ESLint configs

Root scripts (run with `pnpm <script>`):
- `dev` / `dev:*` – start one or all apps
- `build` / `build:*` – build one or all apps
- `lint`, `typecheck`, `test` – run tasks across the workspace

Install dependencies once from the repo root using `pnpm install`.


## Quick Start

Basic workflow:
```sh
corepack enable
corepack prepare pnpm@9.12.3 --activate
pnpm install
pnpm dev
```


# Installation & Local Development

This repo is a pnpm monorepo with separate apps for web, admin, and an API.

## Prerequisites
- Node.js 18+ (20+ recommended)
- pnpm (via Corepack or npm)

### Option A — Corepack (preferred)
```sh
corepack enable
corepack prepare pnpm@9.12.3 --activate
pnpm -v
```

### Option B — Install pnpm via npm
```sh
npm install -g pnpm@9.12.3
pnpm -v
```

## Clone the repository
```sh
git clone https://github.com/rubenscordeirobr/daext.git
cd daext
```

## Install dependencies (workspace root)
```sh
pnpm install
```

If you must use npm temporarily, install per project:
```sh
cd apps/web && npm install && cd ../..
cd apps/admin && npm install && cd ../..
cd apps/api && npm install && cd ../..
```

## Run (development)
- All apps (web + admin + api):
```sh
pnpm dev
```
- Only the web app:
```sh
pnpm dev:web
```
- Only the admin app:
```sh
pnpm dev:admin
```
- Only the API:
```sh
pnpm dev:api
```

## Build
- Build everything:
```sh
pnpm build
```
- Build individually:
```sh
pnpm build:web
pnpm build:admin
pnpm build:api
```

## Project structure
- apps/web — public site (Vite React)
- apps/admin — admin dashboard (Vite React)
- apps/api — Fastify API (TypeScript)
- packages/ui — shared React components
- packages/tsconfig — shared tsconfig presets
- packages/eslint-config — shared flat ESLint configs

## Troubleshooting
- pnpm not found: ensure Corepack is enabled or install with `npm install -g pnpm@9.12.3`.
- Windows: open a new terminal after installing pnpm so PATH updates apply.
- Port conflicts:
  - web: 3000
  - admin: 3001
  - api: 4000
- If `pnpm install` fails behind a proxy, configure npm/pnpm proxy or try a different network.

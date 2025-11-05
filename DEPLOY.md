# Deploy Configuration Guide

This project supports multiple deployment scenarios with different asset path configurations.

## Deployment Options

### 1. Root Domain Deployment (e.g., https://yourdomain.com)

```bash
pnpm run build:web
```

- Uses absolute paths (`/assets/...`)
- Best for main domain deployment

### 2. Relative Path Deployment (File system, CDN)

```bash
pnpm -C apps/web run build:relative
```

- Uses relative paths (`assets/...`)
- Works when served from any location
- Good for CDN, local files, or unknown deployment paths

### 3. Subdirectory Deployment (e.g., https://yourdomain.com/daext/)

```bash
pnpm -C apps/web run build:subdirectory
```

- Uses subdirectory paths (`/daext/assets/...`)
- Perfect for hosting in a subdirectory

### 4. GitHub Pages Deployment

```bash
pnpm -C apps/web run build:github-pages
```

- Configured for GitHub Pages with repository name
- Uses `/daext/` as base path

## Asset Path Handling

The web app uses a smart asset path utility (`apps/web/src/utils/assetPath.ts`) that automatically handles different deployment scenarios:

```typescript
import { getAssetPath } from '@/utils/assetPath'

// Usage in components
<img src={getAssetPath('assets/images/logo.png')} alt="Logo" />
```

## Environment Variables

You can also set custom base paths using environment variables:

```bash
# Custom subdirectory
BASE_PATH=/my-custom-path/ pnpm -C apps/web run build

# Relative paths
BASE_PATH=./ pnpm -C apps/web run build

# Root deployment
BASE_PATH=/ pnpm -C apps/web run build
```

## Build Output

All builds create optimized files in the `apps/web/out/` directory:

- `apps/web/out/index.html` - Main HTML file
- `apps/web/out/assets/` - JS, CSS, and other assets
- `apps/web/out/assets/images/` - Image assets

## Testing Deployments

Preview your build locally:

```bash
# Test relative path build
pnpm -C apps/web run preview:relative

# Test normal build
pnpm -C apps/web run build && pnpm -C apps/web run preview
```

## Common Deployment Platforms

### Netlify/Vercel

```bash
pnpm -C apps/web run build:relative
```

### Apache/Nginx Subdirectory

```bash
pnpm -C apps/web run build:subdirectory
```

### GitHub Pages

```bash
pnpm -C apps/web run build:github-pages
```

### CDN/Static Hosting

```bash
pnpm -C apps/web run build:relative
```

# Deploy Configuration Guide

This project supports multiple deployment scenarios with different asset path configurations.

## 🚀 Deployment Options

### 1. **Root Domain Deployment** (e.g., https://yourdomain.com)
```bash
npm run build
```
- Uses absolute paths (`/assets/...`)
- Best for main domain deployment

### 2. **Relative Path Deployment** (File system, CDN)
```bash
npm run build:relative
```
- Uses relative paths (`assets/...`)
- Works when served from any location
- Good for CDN, local files, or unknown deployment paths

### 3. **Subdirectory Deployment** (e.g., https://yourdomain.com/daext/)
```bash
npm run build:subdirectory
```
- Uses subdirectory paths (`/daext/assets/...`)
- Perfect for hosting in a subdirectory

### 4. **GitHub Pages Deployment**
```bash
npm run build:github-pages
```
- Configured for GitHub Pages with repository name
- Uses `/daext/` as base path

## 📁 Asset Path Handling

The project uses a smart asset path utility (`src/utils/assetPath.ts`) that automatically handles different deployment scenarios:

```typescript
import { getAssetPath } from '../utils/assetPath';

// Usage in components
<img src={getAssetPath("assets/images/logo.png")} alt="Logo" />
```

## 🌐 Environment Variables

You can also set custom base paths using environment variables:

```bash
# Custom subdirectory
BASE_PATH=/my-custom-path/ npm run build

# Relative paths
BASE_PATH=./ npm run build

# Root deployment
BASE_PATH=/ npm run build
```

## 📦 Build Output

All builds create optimized files in the `out/` directory:
- `out/index.html` - Main HTML file
- `out/assets/` - JS, CSS, and other assets
- `out/assets/images/` - Image assets

## 🔍 Testing Deployments

Preview your build locally:
```bash
# Test relative path build
npm run preview:relative

# Test normal build
npm run build && npm run preview
```

## Common Deployment Platforms

### **Netlify/Vercel**
```bash
npm run build:relative
```

### **Apache/Nginx Subdirectory**
```bash
npm run build:subdirectory
```

### **GitHub Pages**
```bash
npm run build:github-pages
```

### **CDN/Static Hosting**
```bash
npm run build:relative
```
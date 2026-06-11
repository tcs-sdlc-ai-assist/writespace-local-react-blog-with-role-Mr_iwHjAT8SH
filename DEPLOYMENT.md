# Deployment Guide

This document covers deployment of the WriteSpace single-page application (SPA). WriteSpace is a fully static, client-side application with no backend or server-side dependencies. All data is persisted in the browser's localStorage.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Build](#build)
- [Vercel Deployment](#vercel-deployment)
- [vercel.json Configuration](#verceljson-configuration)
- [Environment Variables](#environment-variables)
- [Other Static Hosts](#other-static-hosts)
- [CI/CD Considerations](#cicd-considerations)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm (included with Node.js)
- All dependencies installed via `npm install`

---

## Build

Create an optimized production build:

```bash
npm run build
```

This runs `vite build` under the hood (defined in `package.json`). The output is written to the **`dist/`** directory, which contains all static assets ready for deployment:

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
```

To preview the production build locally before deploying:

```bash
npm run preview
```

This starts a local static server at `http://localhost:4173` serving the `dist/` directory.

---

## Vercel Deployment

WriteSpace is configured for deployment on [Vercel](https://vercel.com/) as a static SPA.

### Steps

1. **Push the repository** to GitHub, GitLab, or Bitbucket.

2. **Import the project** in the [Vercel dashboard](https://vercel.com/new):
   - Select your repository.
   - Vercel will auto-detect the Vite framework.

3. **Verify build settings** (Vercel typically auto-detects these):
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

4. **Deploy.** Click the Deploy button. Vercel will install dependencies, run the build, and publish the `dist/` directory.

5. **Verify routing.** After deployment, confirm that direct URL access to any route (e.g., `https://your-app.vercel.app/dashboard`) loads the application correctly and does not return a 404. The included `vercel.json` handles this via SPA rewrites.

### Subsequent Deployments

Vercel automatically deploys on every push to the connected branch (typically `main`). Preview deployments are created for pull requests.

---

## vercel.json Configuration

The project includes a `vercel.json` file at the repository root that configures SPA routing:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### What This Does

- **SPA Rewrite Rule:** All incoming requests, regardless of path, are rewritten to serve `index.html`. This is essential for client-side routing with React Router v6.
- Without this rule, navigating directly to a route like `/dashboard` or `/admin/users` would result in a 404 error because no corresponding file exists on the server.
- Static assets (JS, CSS, images) in the `dist/assets/` directory are still served correctly because Vercel serves existing files before applying rewrite rules.

### Important

Do not remove or modify `vercel.json` unless you understand the impact on client-side routing. All routes defined in `src/App.jsx` depend on this rewrite rule for direct URL access.

---

## Environment Variables

**No environment variables are required.** WriteSpace is a fully client-side application with no backend, no API keys, and no external service integrations.

- There is no `.env` file needed for development or production.
- The application does not use `import.meta.env.VITE_*` variables.
- All data is stored in the browser's localStorage.
- The hard-coded admin account (`admin` / `admin`) is built into the application source code.

If environment variables are added in the future, they must be prefixed with `VITE_` to be exposed to the client-side bundle by Vite (e.g., `VITE_API_URL`). These can be configured in:

- A local `.env` file (not committed to version control; listed in `.gitignore`)
- The Vercel dashboard under **Project Settings → Environment Variables**

---

## Other Static Hosts

WriteSpace can be deployed to any static hosting provider. The key requirement is that **all routes must be rewritten to `index.html`** to support client-side routing.

### Netlify

Create a `netlify.toml` file (or use the Netlify dashboard):

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Or create a `public/_redirects` file:

```
/*    /index.html   200
```

### GitHub Pages

GitHub Pages does not natively support SPA rewrites. Use a 404.html workaround:

1. Copy `dist/index.html` to `dist/404.html` as a post-build step.
2. GitHub Pages will serve `404.html` for unknown routes, which loads the SPA.

### Apache

Add a `.htaccess` file to the `dist/` directory:

```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### Nginx

Add the following to your server block:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

---

## CI/CD Considerations

### Automated Testing

Run the test suite before every deployment to catch regressions:

```bash
npm test
```

This executes `vitest run`, which runs all unit and integration tests once. The test suite includes:

- **Utility tests:** `src/utils/auth.test.js`, `src/utils/storage.test.js`
- **Page tests:** `src/pages/Home.test.jsx`, `src/pages/LandingPage.test.jsx`, `src/pages/LoginPage.test.jsx`
- **Routing tests:** `src/App.test.jsx`

### Recommended CI Pipeline

A typical CI/CD pipeline for WriteSpace:

```
1. Install dependencies     →  npm install
2. Run tests                →  npm test
3. Build production bundle  →  npm run build
4. Deploy dist/ directory   →  (Vercel auto-deploys, or upload dist/ to your host)
```

### Example GitHub Actions Workflow

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm

      - run: npm install
      - run: npm test
      - run: npm run build
```

If using Vercel's GitHub integration, Vercel handles the build and deploy steps automatically. The GitHub Actions workflow above can still be used to run tests on pull requests before merging.

### Branch Strategy

- **`main` branch:** Production deployments. Vercel deploys automatically on push.
- **Pull requests:** Vercel creates preview deployments for each PR, providing a unique URL to review changes before merging.

### Build Caching

- Vercel caches `node_modules` between builds automatically.
- For other CI providers, cache the `node_modules` directory keyed on `package-lock.json` to speed up installs.

---

## Troubleshooting

### 404 on Direct URL Access

**Symptom:** Navigating directly to `/dashboard`, `/admin`, or any non-root route returns a 404.

**Cause:** The hosting provider is not configured to rewrite all routes to `index.html`.

**Fix:** Ensure the SPA rewrite rule is in place. For Vercel, verify that `vercel.json` exists at the repository root with the rewrite configuration shown above.

### Blank Page After Deploy

**Symptom:** The deployed site shows a blank white page.

**Cause:** Build output may be missing or the base path may be incorrect.

**Fix:**
1. Verify `npm run build` completes without errors locally.
2. Check that the output directory is set to `dist` in your hosting provider's settings.
3. Open the browser developer console for JavaScript errors.

### Tests Failing in CI

**Symptom:** Tests pass locally but fail in CI.

**Cause:** The test environment may differ (Node.js version, missing dependencies).

**Fix:**
1. Ensure CI uses Node.js v18 or later.
2. Run `npm install` (not `npm ci`) if `package-lock.json` is not committed.
3. Verify that `vitest` and `jsdom` are listed in `devDependencies` in `package.json`.
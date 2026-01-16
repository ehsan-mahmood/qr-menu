# GitHub Pages Deployment Guide

This guide explains how to deploy the Digital Menu frontend as a static demo on GitHub Pages.

## Overview

The frontend is configured to run in **demo mode** when deployed to GitHub Pages. Demo mode:
- ✅ Works completely without a backend
- ✅ Uses localStorage for data persistence
- ✅ Automatically enables TEST_MODE when on GitHub Pages
- ✅ Tracks orders and analytics locally in the browser

## Prerequisites

- Node.js 18+ installed
- Git repository on GitHub
- GitHub Pages enabled in repository settings

## Automatic Deployment (Recommended)

The repository includes a GitHub Actions workflow that automatically deploys when you push to the `main` branch.

### Setup Steps

1. **Enable GitHub Actions** (if not already enabled):
   - Go to repository Settings > Actions > General
   - Ensure "Allow all actions and reusable workflows" is enabled

2. **Push to main branch**:
   ```bash
   git add .
   git commit -m "Prepare for GitHub Pages deployment"
   git push origin main
   ```

3. **Configure GitHub Pages**:
   - Go to repository Settings > Pages
   - Source: Select "gh-pages" branch
   - Folder: Select "/ (root)"
   - Click "Save"

4. **Wait for deployment**:
   - Check Actions tab to see deployment progress
   - Once complete, your site will be available at:
     - `https://<username>.github.io/<repo-name>/`

## Manual Deployment

If you prefer to deploy manually:

### Option 1: Using the deployment script

```bash
cd frontend
chmod +x deploy-gh-pages.sh
./deploy-gh-pages.sh
```

Then follow the instructions printed by the script.

### Option 2: Manual steps

```bash
# Build the project
cd frontend
npm install
npm run build

# Create or checkout gh-pages branch
git checkout --orphan gh-pages
git rm -rf .

# Copy dist contents to root
cp -r dist/* .

# Create .nojekyll file (prevents Jekyll processing)
touch .nojekyll

# Commit and push
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages
```

## Configuration

### Base Path

If deploying to a subdirectory (e.g., `/qrmenu/`), set the base path:

**Option 1: Environment variable during build**
```bash
VITE_BASE_PATH=/qrmenu/ npm run build
```

**Option 2: Update vite.config.js**
```javascript
base: '/qrmenu/',  // or your repo name
```

### Custom Domain

To use a custom domain:

1. Create a `CNAME` file in `frontend/public/`:
   ```
   yourdomain.com
   ```

2. Update the GitHub Actions workflow to include the CNAME:
   ```yaml
   publish_dir: ./frontend/dist
   cname: yourdomain.com
   ```

3. Configure DNS:
   - Add CNAME record pointing to `<username>.github.io`

## Demo Mode Features

When running on GitHub Pages, the app automatically:

1. **Detects GitHub Pages** via hostname (`github.io`)
2. **Enables TEST_MODE** automatically
3. **Uses localStorage** for:
   - Order persistence
   - Analytics tracking
   - Menu scans and views
   - Item click tracking

### Demo Flow

The demo supports the full workflow described in `docs/demo_mode_checklist.md`:

1. **Menu Upload/OCR** - Simulated with test data
2. **QR Code Scan** - Uses pre-configured QR tokens
3. **Order Placement** - Stored in localStorage
4. **Dashboard/Analytics** - Real-time updates from localStorage
5. **Order Management** - Status updates persist across sessions

## Troubleshooting

### Build fails

- Ensure Node.js 18+ is installed
- Clear `node_modules` and reinstall: `rm -rf node_modules package-lock.json && npm install`

### Assets not loading

- Check `base` path in `vite.config.js` matches your GitHub Pages URL structure
- Ensure all asset paths are relative (Vite handles this automatically)

### 404 errors on page refresh

- This is normal for SPAs on GitHub Pages
- Consider using a custom domain with proper routing, or document that users should navigate via the app (not refresh)

### Demo mode not activating

- Verify you're accessing the site via `github.io` domain
- Check browser console for `TEST_MODE` and `DEMO_MODE` values
- Ensure `config.js` properly detects GitHub Pages hostname

## Local Testing

To test the GitHub Pages build locally:

```bash
cd frontend
npm run build
npm run preview
```

This serves the built files exactly as they would appear on GitHub Pages.

## Updating the Demo

1. Make changes to the frontend code
2. Commit and push to `main` branch
3. GitHub Actions will automatically rebuild and deploy
4. Changes appear within 1-2 minutes

## Notes

- **No backend required** - Everything runs client-side
- **Data is local** - Each visitor has their own localStorage
- **No payments** - Payment flows are simulated
- **Persistent across sessions** - Data persists in browser localStorage
- **Reset data** - Users can clear localStorage to reset demo data

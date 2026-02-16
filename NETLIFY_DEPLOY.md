# Netlify Deployment Instructions

## Quick Setup

1. **Connect Repository**
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect to your GitHub repository: `arynsehgl/streamsnatch`

2. **Build Settings** (Netlify should auto-detect from `netlify.toml`, but verify):
   - **Base directory**: Leave empty or set to `.`
   - **Build command**: `cd client && npm install && npm run build`
   - **Publish directory**: `client/dist`
   - **Node version**: `18` (or latest LTS)

3. **Environment Variables** (if you deploy backend separately):
   - If your backend is deployed elsewhere, add:
     - `VITE_API_URL` = `https://your-backend-url.com`

4. **Deploy**
   - Click "Deploy site"
   - Netlify will automatically build and deploy

## Troubleshooting

### Download returns "Page not found" or a blank/HTML page
- Netlify only hosts the frontend. When you click Download, the app calls `/api/download`; on Netlify that hits Netlify’s server and returns a 404 HTML page.
- **Fix:** Deploy the backend (e.g. Railway, Render) and in Netlify set **Environment variable** `VITE_API_URL` = `https://your-backend-url.com` (no trailing slash). Then redeploy the frontend.

### If you see "Page not found" on the site (not download):

1. **Check Build Logs**
   - Go to Deploys → Click on latest deploy → View build logs
   - Ensure build completed successfully

2. **Verify Settings Match**
   - Site settings → Build & deploy → Build settings
   - Should match `netlify.toml` values

3. **Check Published Files**
   - Go to Deploys → Click deploy → Browse published files
   - Should see `index.html` and `_redirects` in the root
   - Should see `assets/` folder with CSS and JS files

4. **Force Redeploy**
   - Deploys → Trigger deploy → Clear cache and deploy site

## Important Notes

- The frontend is a Single Page Application (SPA)
- All routes should redirect to `index.html` (handled by `_redirects` file)
- The backend must be deployed separately (Railway, Render, etc.)
- API calls will fail until backend is deployed and `VITE_API_URL` is set

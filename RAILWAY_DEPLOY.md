# Deploy backend to Railway (step-by-step)

Use this so your Netlify site can download videos. Railway runs your Node + yt-dlp + FFmpeg server.

---

## Step 1: Push the Dockerfile to GitHub

1. The repo has a **Dockerfile** at the root that builds only the backend (Node + yt-dlp + FFmpeg).
2. Commit and push:
   ```bash
   git add Dockerfile .dockerignore RAILWAY_DEPLOY.md
   git commit -m "Add Railway Dockerfile for backend"
   git push origin main
   ```

---

## Step 2: Create a Railway account

1. Go to [railway.app](https://railway.app).
2. Click **Login** → sign in with **GitHub**.
3. Authorize Railway to access your GitHub if asked.

---

## Step 3: Create a new project from GitHub

1. On Railway dashboard, click **New Project**.
2. Choose **Deploy from GitHub repo**.
3. Select your repo: **arynsehgl/streamsnatch** (or your repo name).
4. Railway may ask “Which directory?” — leave **Root** (we build from repo root).
5. Click **Deploy**. Railway will try to build. We’ll set the Dockerfile next if needed.

---

## Step 4: Confirm build uses the Dockerfile

1. In your Railway project, click the **service** (the box that was created).
2. Go to **Settings**.
3. Under **Build**:
   - **Builder**: Dockerfile (Railway should detect the root `Dockerfile`).
   - **Root directory**: leave blank.
   - **Dockerfile path**: leave blank (so it uses `./Dockerfile`).
4. **Start command**: leave blank (the Dockerfile already has `CMD ["node", "index.js"]`).
5. Save. Go to **Deployments** and click **Redeploy** (or push a new commit to trigger a deploy).

---

## Step 5: Get your backend URL

1. In the same service, open the **Settings** tab.
2. Under **Networking** / **Public Networking**, click **Generate Domain** (or use the default if one exists).
3. Copy the URL, e.g. `https://your-app-name.up.railway.app` (no trailing slash).

---

## Step 6: Set `VITE_API_URL` on Netlify

1. Go to [Netlify](https://app.netlify.com) → your site.
2. **Site configuration** → **Environment variables** (or **Build & deploy** → **Environment**).
3. **Add a variable** (or **Edit variables**):
   - **Key:** `VITE_API_URL`
   - **Value:** your Railway URL, e.g. `https://your-app-name.up.railway.app`
   - No trailing slash.
4. Save.
5. **Trigger a new deploy** so the frontend is rebuilt with this variable (e.g. **Deploy site** → **Trigger deploy**).

---

## Step 7: Test

1. Open your Netlify site.
2. Paste a YouTube URL, click **Analyze**, then choose a format and **Download**.
3. The request should go to Railway; the file should download. If it doesn’t, check Step 5 and 6 (correct URL, redeploy Netlify).

---

## Notes

- **Railway free tier:** You get a monthly credit (e.g. $5). Light use (5–10 people, rarely) usually stays within free tier. Check [Railway pricing](https://railway.app/pricing).
- **No storage:** The server only uses temporary disk; files are deleted after streaming. No database or long-term storage needed.
- **CORS:** The server already allows all origins; your Netlify domain will work.
- **Build failed?**
  1. In Railway → your service → **Settings** → **Build**: set **Root directory** to blank (repo root). If it’s set to `server`, the Dockerfile won’t find `server/`.
  2. **Builder** must be **Dockerfile** (not Nixpacks). If you don’t see that, add a file named `Dockerfile` at the repo root (we already have one).
  3. Open **Deployments** → click the failed deploy → read the **Build logs**. The last few lines usually show the error (e.g. `COPY failed: file not found` = wrong root directory).

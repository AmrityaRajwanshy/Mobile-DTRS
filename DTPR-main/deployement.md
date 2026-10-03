# Vercel & Git Deployment Guide

This repository is fully configured and ready to be pushed to GitHub and deployed on **Vercel**.

---

## 1. Push to GitHub

From your terminal in this directory (`c:\Users\AMRITYA\Desktop\SIH 2026\Train\finalMobile`):

```bash
# 1. Stage all files
git add .

# 2. Create initial commit
git commit -m "Initial commit: Mobile-ready DTRS System with Next.js frontend"

# 3. Create a new repository on GitHub (e.g. named 'dtrs-system')
# 4. Link and push to your remote:
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPO_NAME>.git
git push -u origin main
```

---

## 2. Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and log in with your GitHub account.
2. Click **Import** next to your repository.
3. In the **Configure Project** screen:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click **Edit** and select:
     ```
     BlackSheep2 - RRU/Frontend
     ```
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

4. **Environment Variables** (Optional / Recommended):
   If your Python backend is hosted (e.g., on Render, Railway, AWS, or Fly.io):
   - Add variable: `BACKEND_API_URL`
   - Value: `https://your-backend-service.onrender.com` (no trailing slash)
   *(If not set, it defaults to `http://127.0.0.1:8000` for local development).*

5. Click **Deploy**. Your app will build and go live on a `*.vercel.app` URL!

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
   - **Root Directory**: Select `Frontend` (or leave default if deploying root directly)
     ```
     Frontend
     ```
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

4. **Environment Variables on Vercel**:
   In your Vercel Project Dashboard under **Settings -> Environment Variables**, configure:
   - `BACKEND_API_URL`
     - Value: `https://your-backend-service.onrender.com` (your hosted backend URL, no trailing slash)
   - `BACKEND_URL`
     - Value: `https://your-backend-service.onrender.com` (alias for BACKEND_API_URL)
   - `NEXT_PUBLIC_BACKEND_API_URL`
     - Value: `https://your-backend-service.onrender.com`
   - `LIVE_API_KEY` (Optional)
     - Value: `your_railradar_api_key` (if you want live tracking enabled globally)

5. Click **Deploy**. Your app will build and go live on your `*.vercel.app` URL!

---

## 3. Verified Endpoints Reference

All endpoints are dual-decorated and support both `/api/<route>` and `/<route>`:

| Endpoint | Method | Description |
|---|---|---|
| `/api/search` | `GET` | Train search by train number, name, or route |
| `/api/train_info` | `GET` | Complete timetable, halts, distance, and EA slack |
| `/api/segments` | `GET` | Filterable corridor segments & station transitions |
| `/api/corridors` | `GET` | 7 National Rail corridors with state border progressions |
| `/api/state_borders` | `GET` | 29 territorial state border clusters & metrics |
| `/api/predict` | `GET` | Mathematical compound delay simulation |
| `/api/railradar/auto_fetch_and_freeze` | `GET` | Dynamic ground truth telemetry & frozen state matching |
| `/api/railradar/live` | `GET` | Raw upstream RailRadar live train telemetry |
| `/api/railradar/config` | `GET`, `POST` | Check and dynamically configure Live API Key |
| `/api/simulation/status` | `GET` | Sandbox status & modifications count |
| `/api/simulation/push` | `POST` | Push proposed delay modifications to simulation DB |
| `/api/simulation/reset` | `POST` | Restore pristine baseline conditions from WIN.db |


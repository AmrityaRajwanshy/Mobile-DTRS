# 🚀 Single-Platform Vercel Deployment Guide

This project is now configured as a **unified Full-Stack application** designed to run **100% on Vercel alone**. Both the **Next.js 14 Frontend** and the **Python FastAPI Backend** run seamlessly inside the same single Vercel project with **zero external hosting platforms needed** (no Render, no Railway, no Fly.io).

---

## 🏗️ How Single-Platform Vercel Architecture Works

1. **Next.js 14 Frontend (`src/`)**:
   - Vercel automatically detects Next.js from `package.json` at the repository root.
   - Handles all user interface rendering, React components, and static asset routes (`/`, `/_next/*`, etc.).

2. **FastAPI Python Backend (`api/index.py` & `Backend/`)**:
   - Vercel Serverless automatically detects Python from `requirements.txt` and `api/index.py`.
   - The ASGI application `app` in `api/index.py` boots FastAPI with cached master datasets and SQLite databases (`WIN.db`).
   - `vercel.json` automatically routes all `/api/*` traffic directly to `api/index.py`.

3. **Zero CORS & Zero Extra URL Config**:
   - Both Frontend and Backend share the same domain (`https://<your-project>.vercel.app`).
   - Browser calls to `/api/search`, `/api/predict`, etc. resolve locally within Vercel.

---

## 1. Push to GitHub

From your terminal in the project directory:

```bash
# 1. Stage all files
git add .

# 2. Commit changes
git commit -m "Configure full-stack single-platform deployment for Vercel"

# 3. Push to your main branch
git push origin main
```

---

## 2. Deploy on Vercel (1-Click Setup)

1. Go to [vercel.com/new](https://vercel.com/new) and log in with your GitHub account.
2. Click **Import** next to your `Mobile-DTRS` repository.
3. In the **Configure Project** screen:
   - **Framework Preset**: `Next.js` *(Auto-detected)*
   - **Root Directory**: `./` *(Default repository root — do NOT change)*
   - **Build Command**: `npm run build` *(Auto-detected)*
   - **Output Directory**: `.next` *(Auto-detected)*
   - **Install Command**: `npm install` *(Auto-detected)*

4. **Environment Variables (Optional)**:
   In Vercel Dashboard under **Settings -> Environment Variables**:
   - `LIVE_API_KEY` (Optional)
     - Value: `your_railradar_api_key` *(If you want dynamic live GPS telemetry enabled in production)*

5. Click **Deploy**!
   - Vercel builds the Next.js frontend bundle.
   - Vercel compiles the Python serverless function at `api/index.py`.
   - Your entire full-stack app goes live at `https://<your-project>.vercel.app`!

---

## 3. Verified Endpoints Reference (All live on your Vercel URL)

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
| `/api/simulation/status` | `GET` | Sandbox status & modifications count |
| `/api/simulation/push` | `POST` | Push proposed delay modifications to simulation DB |
| `/api/simulation/reset` | `POST` | Restore pristine baseline conditions from WIN.db |

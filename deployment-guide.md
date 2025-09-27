# Deployment Guide for Full-Stack Project

## Overview
This project has two parts:
- **Frontend**: Next.js application (deploy to Vercel)
- **Backend**: Node.js/Express API (deploy to Railway/Render/Heroku)

## Step 1: Deploy Backend

### Option A: Railway (Recommended)
1. Go to [railway.app](https://railway.app)
2. Connect your GitHub account
3. Create new project from GitHub repo
4. Select your repository
5. Railway will auto-detect the backend folder
6. Set environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string
   - `CORS_ORIGIN`: Your Vercel frontend URL (update after frontend deployment)

### Option B: Render
1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repository
4. Set build command: `cd backend && npm install`
5. Set start command: `cd backend && npm start`
6. Add environment variables as above

## Step 2: Deploy Frontend to Vercel

### Method 1: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - Project name: your-project-name
# - Directory: ./frontend
# - Override settings? N
```

### Method 2: Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Import project from GitHub
3. Select your repository
4. Configure:
   - Framework Preset: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`

## Step 3: Environment Variables

### Frontend (Vercel)
In Vercel dashboard, add environment variable:
- `NEXT_PUBLIC_API_URL`: Your backend URL (from Railway/Render)

### Backend (Railway/Render)
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Secure random string
- `CORS_ORIGIN`: Your Vercel frontend URL

## Step 4: Update Configuration

After both deployments:
1. Update `frontend/config/api.ts` with your backend URL
2. Update backend CORS settings with your frontend URL
3. Redeploy if necessary

## Database Setup
For production, use MongoDB Atlas:
1. Create account at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create cluster
3. Get connection string
4. Add to backend environment variables

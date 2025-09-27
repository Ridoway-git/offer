# Deploy to Render (Free Alternative)

## Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Connect your repository

## Step 2: Deploy Backend
1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `coupon-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: `Node`

## Step 3: Add Environment Variables
In Render dashboard, add:
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: `my-super-secret-jwt-key-123456`
- `CORS_ORIGIN`: `https://frontend-omega-one-81.vercel.app`

## Step 4: Update Frontend
Update `frontend/config/api.ts` with new Render URL

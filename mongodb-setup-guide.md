# MongoDB Setup Guide

## Option 1: MongoDB Atlas (Free & Recommended)

### Step 1: Create MongoDB Atlas Account
1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Sign up for free
3. Create a new cluster (choose free tier)

### Step 2: Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your actual password
5. Replace `<dbname>` with `couponapp` (or any name you like)

Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/couponapp?retryWrites=true&w=majority`

### Step 3: Add to Railway
1. Go to Railway dashboard → Variables
2. Add: `MONGODB_URI` = your connection string
3. Redeploy

## Option 2: Railway MongoDB (Easier)

1. In Railway dashboard, click "+ New"
2. Select "Database" → "MongoDB"
3. Railway will create a MongoDB instance
4. Copy the connection string from Railway
5. Add as `MONGODB_URI` variable

## Test Connection
Visit: https://offer-production.up.railway.app/health
Should show MongoDB connection status

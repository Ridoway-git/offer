# Deploy to Heroku (Free Alternative)

## Step 1: Install Heroku CLI
```bash
# Download from heroku.com or use:
npm install -g heroku
```

## Step 2: Login to Heroku
```bash
heroku login
```

## Step 3: Create Heroku App
```bash
heroku create coupon-app-backend
```

## Step 4: Deploy Backend
```bash
cd backend
git init
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

## Step 5: Add Environment Variables
```bash
heroku config:set MONGODB_URI="your-mongodb-connection-string"
heroku config:set JWT_SECRET="my-super-secret-jwt-key-123456"
heroku config:set CORS_ORIGIN="https://frontend-omega-one-81.vercel.app"
```

## Step 6: Update Frontend
Update API URL to your Heroku app URL

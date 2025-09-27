# Railway Environment Variables

Add these variables in your Railway dashboard:

## Variables to Add in Railway:
1. Go to your Railway project → Variables tab
2. Add these variables:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name
JWT_SECRET=my-super-secret-jwt-key-123456789
CORS_ORIGIN=https://frontend-mdurmw3cb-ridoooways-projects.vercel.app
```

## Vercel Environment Variables:

1. Go to Vercel dashboard → Your project → Settings → Environment Variables
2. Add this variable:

```
NEXT_PUBLIC_API_URL=https://offer-production.up.railway.app
```

## Test Your Backend:
Visit: https://offer-production.up.railway.app/health

Should return: {"status":"OK","message":"Backend server is running"}

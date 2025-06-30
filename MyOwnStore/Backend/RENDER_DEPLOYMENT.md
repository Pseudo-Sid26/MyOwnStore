# Render Deployment Configuration

## ✅ Changes Made to .env:
- Changed NODE_ENV to `production`
- Changed PORT to `10000` (Render requirement)
- Updated JWT_SECRET to a stronger key
- Increased BCRYPT_ROUNDS to 12 for better security
- Added FRONTEND_URL placeholder

## 🚀 Render Dashboard Settings:

### Service Configuration:
- **Name**: `myownstore-backend`
- **Environment**: `Node`
- **Region**: Oregon (US West) or your preferred
- **Branch**: `main`
- **Root Directory**: `Backend`

### Build & Deploy Settings:
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Auto-Deploy**: Yes

### Environment Variables (Set in Render Dashboard):
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://shimpirohit02:1234@backendapi.kymt5.mongodb.net/MyOwnStore?retryWrites=true&w=majority&appName=backEndApi
JWT_SECRET=MyOwnStore_2024_SuperSecure_JWT_Secret_Key_Production_Random_12345
BCRYPT_ROUNDS=12
FRONTEND_URL=https://your-frontend-app.vercel.app
```

## 🔗 After Deployment Test URLs:
- Health Check: `https://your-app.onrender.com/api/health`
- API Root: `https://your-app.onrender.com/`
- Products: `https://your-app.onrender.com/api/products`

## ⚠️ Important Notes:
1. **MongoDB Atlas**: Make sure to whitelist all IPs (0.0.0.0/0) in Atlas
2. **Cold Starts**: Free tier apps sleep after 15 minutes of inactivity
3. **Logs**: Check Render logs if deployment fails
4. **CORS**: Currently set to allow all origins for easy deployment

## 🎯 Deployment Steps:
1. Push code to GitHub
2. Create new Web Service on Render
3. Connect your GitHub repository
4. Set root directory to `Backend`
5. Configure build/start commands
6. Add environment variables
7. Deploy!

Your backend is now production-ready! 🚀

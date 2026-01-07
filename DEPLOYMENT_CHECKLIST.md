# 🚀 PathWise Deployment Checklist

## ✅ Current Status

### Deployments Started
- ✅ **Backend:** Deploying to Railway
- ✅ **Frontend:** Deploying to Railway
- ✅ **Code:** All pushed to GitHub

### Live URLs (Once Deployed)
- **Frontend:** https://frontend-production-752a.up.railway.app
- **Backend API:** https://pathwise-production-0768.up.railway.app
- **API Docs:** https://pathwise-production-0768.up.railway.app/docs

---

## 🔧 What I Need From You

### 1. **Environment Variables (CRITICAL)**

You need to set these in Railway for both services:

#### **Backend Service Environment Variables**

Go to Railway → Backend Service → Variables and add:

```env
# OpenAI API Key (REQUIRED)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Database (Already set by Railway)
DATABASE_URL=postgresql://... (Railway auto-sets this)

# NextAuth Secret (REQUIRED)
NEXTAUTH_SECRET=your-secret-key-here-min-32-chars

# Google OAuth (REQUIRED for Google Sign-In)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# URLs
NEXTAUTH_URL=https://frontend-production-752a.up.railway.app
FRONTEND_URL=https://frontend-production-752a.up.railway.app

# OpenAI Model
OPENAI_MODEL=gpt-4
```

#### **Frontend Service Environment Variables**

Go to Railway → Frontend Service → Variables and add:

```env
# NextAuth
NEXTAUTH_SECRET=same-secret-as-backend
NEXTAUTH_URL=https://frontend-production-752a.up.railway.app

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# API URL
NEXT_PUBLIC_API_URL=https://pathwise-production-0768.up.railway.app
```

---

### 2. **Get Your API Keys**

#### **OpenAI API Key** (REQUIRED)
1. Go to: https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with `sk-`)
4. Add to Railway backend variables as `OPENAI_API_KEY`

**Cost:** ~$0.002 per API call (very affordable)

#### **Google OAuth Credentials** (REQUIRED for Sign-In)
1. Go to: https://console.cloud.google.com/apis/credentials
2. Create a new project or select existing
3. Click "Create Credentials" → "OAuth 2.0 Client ID"
4. Application type: "Web application"
5. Authorized redirect URIs:
   ```
   https://frontend-production-752a.up.railway.app/api/auth/callback/google
   http://localhost:3000/api/auth/callback/google
   ```
6. Copy Client ID and Client Secret
7. Add both to Railway variables

#### **Generate NEXTAUTH_SECRET**
Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```
Copy the output and use it for `NEXTAUTH_SECRET` in both services.

---

### 3. **Database Setup** (AUTO-HANDLED)

Railway automatically provisions PostgreSQL. Just verify:

1. Go to Railway → Database Service
2. Check that `DATABASE_URL` is set
3. Database will auto-create tables on first backend start

---

### 4. **Verify Deployment**

Once deployments complete (5-10 minutes):

#### **Check Backend**
1. Visit: https://pathwise-production-0768.up.railway.app/docs
2. You should see the API documentation (Swagger UI)
3. Try the `/health` endpoint

#### **Check Frontend**
1. Visit: https://frontend-production-752a.up.railway.app
2. You should see the landing page
3. Try signing in with Google

---

## 🎯 Quick Start Actions

### **Immediate Actions (Do These Now)**

1. **Get OpenAI API Key**
   - Visit: https://platform.openai.com/api-keys
   - Create key
   - Add to Railway backend

2. **Set Up Google OAuth**
   - Visit: https://console.cloud.google.com/apis/credentials
   - Create OAuth credentials
   - Add to Railway (both services)

3. **Generate & Set NEXTAUTH_SECRET**
   - Run: `openssl rand -base64 32`
   - Add to Railway (both services)

4. **Wait for Deployments**
   - Check Railway dashboard
   - Wait for "Success" status
   - Usually takes 5-10 minutes

5. **Test the Website**
   - Visit frontend URL
   - Sign in with Google
   - Try creating a roadmap

---

## 🔍 Troubleshooting

### **If Backend Fails to Deploy**

Check Railway logs for:
- Missing environment variables
- Database connection errors
- Python dependency issues

**Fix:** Ensure all environment variables are set correctly

### **If Frontend Fails to Deploy**

Check Railway logs for:
- Missing `NEXT_PUBLIC_API_URL`
- Build errors
- Node.js version issues

**Fix:** Verify all `NEXT_PUBLIC_*` variables are set

### **If Sign-In Doesn't Work**

1. Check Google OAuth redirect URIs match exactly
2. Verify `NEXTAUTH_SECRET` is the same in both services
3. Check `NEXTAUTH_URL` points to frontend URL

### **If API Calls Fail**

1. Check `NEXT_PUBLIC_API_URL` in frontend
2. Verify CORS is enabled in backend
3. Check Railway logs for errors

---

## 📋 Post-Deployment Checklist

Once everything is deployed:

- [ ] Backend is accessible at API URL
- [ ] Frontend loads correctly
- [ ] Google Sign-In works
- [ ] Can create a roadmap
- [ ] AI chat responds
- [ ] All pages load without errors

---

## 🎨 Optional Enhancements

### **Custom Domain** (Optional)
1. Go to Railway → Frontend Service → Settings
2. Add custom domain
3. Update `NEXTAUTH_URL` to your domain

### **Email Notifications** (Optional)
Add Resend API key for email notifications:
```env
RESEND_API_KEY=re_your_key_here
```

### **File Storage** (Optional)
For resume uploads, add:
```env
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=your_bucket
```

Or use Cloudinary:
```env
CLOUDINARY_URL=cloudinary://your_url
```

---

## 🆘 Need Help?

### **Railway Dashboard**
- View logs: Railway → Service → Deployments → Click deployment
- Check variables: Railway → Service → Variables
- Monitor usage: Railway → Project → Usage

### **Common Issues**

**"Internal Server Error"**
- Check backend logs in Railway
- Verify all environment variables are set
- Check database connection

**"Failed to fetch"**
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify backend is running
- Check CORS settings

**"Authentication Error"**
- Verify Google OAuth credentials
- Check redirect URIs
- Ensure `NEXTAUTH_SECRET` matches

---

## ✅ Success Criteria

Your website is ready when:

1. ✅ Frontend loads at your URL
2. ✅ You can sign in with Google
3. ✅ You can create a learning roadmap
4. ✅ AI chat responds to messages
5. ✅ All dashboard pages load
6. ✅ No console errors

---

## 📞 Next Steps After Setup

Once the website is live:

1. **Test All Features**
   - Create a roadmap
   - Chat with AI Study Buddy
   - Upload a resume
   - Generate a project
   - Join a study group

2. **Invite Beta Users**
   - Share the URL
   - Collect feedback
   - Monitor usage in Railway

3. **Monitor Performance**
   - Check Railway metrics
   - Monitor API usage
   - Track OpenAI costs

4. **Plan Marketing**
   - Create landing page content
   - Set up social media
   - Prepare launch announcement

---

**Current Time:** January 7, 2026, 7:40 PM UTC+03:00
**Deployment Status:** In Progress
**Estimated Time to Live:** 5-10 minutes (after you add environment variables)

---

## 🎯 IMMEDIATE ACTION REQUIRED

**Right now, go to Railway and add these 3 critical variables to the backend:**

1. `OPENAI_API_KEY` - Get from https://platform.openai.com/api-keys
2. `GOOGLE_CLIENT_ID` - Get from Google Cloud Console
3. `GOOGLE_CLIENT_SECRET` - Get from Google Cloud Console

**Without these, the website won't work!**

Once you add them, Railway will automatically redeploy and your website will be live! 🚀

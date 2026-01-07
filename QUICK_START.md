# ⚡ PathWise - Quick Start Guide

## 🚀 Your Website is Deploying!

**Status:** ✅ Deployments started on Railway  
**Time:** ~5-10 minutes until live  
**Action Required:** Add environment variables (see below)

---

## 🎯 3 Things You MUST Do Right Now

### 1️⃣ Get OpenAI API Key (2 minutes)

1. Go to: **https://platform.openai.com/api-keys**
2. Click **"Create new secret key"**
3. Copy the key (starts with `sk-`)
4. Go to Railway → Backend Service → Variables
5. Add: `OPENAI_API_KEY` = `your-key-here`

**Cost:** ~$5-10/month for moderate usage

---

### 2️⃣ Set Up Google Sign-In (5 minutes)

1. Go to: **https://console.cloud.google.com/apis/credentials**
2. Create project (if needed)
3. Click **"Create Credentials"** → **"OAuth 2.0 Client ID"**
4. Application type: **"Web application"**
5. Add these redirect URIs:
   ```
   https://frontend-production-752a.up.railway.app/api/auth/callback/google
   http://localhost:3000/api/auth/callback/google
   ```
6. Copy **Client ID** and **Client Secret**
7. Add to Railway (BOTH backend and frontend):
   - `GOOGLE_CLIENT_ID` = `your-client-id`
   - `GOOGLE_CLIENT_SECRET` = `your-client-secret`

---

### 3️⃣ Generate Secret Key (30 seconds)

Run this command in your terminal:
```bash
openssl rand -base64 32
```

Copy the output and add to Railway (BOTH backend and frontend):
- `NEXTAUTH_SECRET` = `the-generated-secret`

---

## 📍 Your URLs

Once deployed (check Railway dashboard):

- **Website:** https://frontend-production-752a.up.railway.app
- **API:** https://pathwise-production-0768.up.railway.app
- **API Docs:** https://pathwise-production-0768.up.railway.app/docs

---

## ✅ Verify It's Working

1. Visit your website URL
2. Click **"Sign in with Google"**
3. Sign in with your Google account
4. Click **"Generate Roadmap"**
5. Enter a goal (e.g., "Learn React")
6. Watch the AI create your roadmap! 🎉

---

## 🎨 All Available Features

Once logged in, you can access:

1. **Dashboard** - Overview of your progress
2. **Roadmaps** - AI-generated learning paths
3. **AI Study Buddy** - Chat with AI tutor
4. **Projects** - Generate practice projects
5. **Resume Scanner** - Upload & analyze resume
6. **Mentors** - Find expert mentors
7. **Study Groups** - Join learning communities
8. **Scheduler** - Smart study planning
9. **Income Tracker** - Track learning ROI
10. **Gamification** - XP, levels, achievements

---

## 🆘 Troubleshooting

### Website won't load?
- Check Railway deployment status
- Verify all environment variables are set
- Wait 5-10 minutes for build to complete

### Can't sign in?
- Verify Google OAuth redirect URIs are correct
- Check `NEXTAUTH_SECRET` is set in both services
- Ensure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct

### AI not responding?
- Verify `OPENAI_API_KEY` is set correctly
- Check you have credits in OpenAI account
- View backend logs in Railway for errors

---

## 💰 Costs

### Required Services
- **Railway:** $5/month (after free tier)
- **OpenAI API:** ~$5-10/month (pay-as-you-go)
- **Google OAuth:** FREE

### Total: ~$10-15/month

---

## 🎯 What Happens Next?

1. **Now:** Add environment variables to Railway
2. **5-10 min:** Deployments complete
3. **Test:** Sign in and create a roadmap
4. **Share:** Invite friends to try it
5. **Grow:** Add custom domain, marketing, etc.

---

## 📞 Need Help?

Check these files in your repo:
- `DEPLOYMENT_CHECKLIST.md` - Detailed setup guide
- `FINAL_IMPLEMENTATION_SUMMARY.md` - All features list
- `FEATURES_ROADMAP.md` - Development roadmap

---

## 🎉 You're Almost There!

Your PathWise platform is **99% ready**. Just add those 3 environment variables and you'll have a fully functional AI-powered career development platform!

**Go to Railway now and add the variables!** 🚀

---

**Last Updated:** January 7, 2026, 7:42 PM UTC+03:00

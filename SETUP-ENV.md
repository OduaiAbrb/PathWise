# ⚡ ENVIRONMENT SETUP - 2 MINUTES

## ✅ DONE:
- ✅ Generated secret: `ioU7YvrR3KGeNEC97JU8qvTRSxoLfpbedlgqMkv8JQY=`
- ✅ Created `frontend/.env.local`
- ✅ Created `backend/.env`

## 🔑 YOU NEED TO DO:

### 1. GET OPENAI API KEY (REQUIRED - 1 minute)
1. Go to: https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with `sk-...`)
4. Open `backend/.env`
5. Replace `sk-PASTE-YOUR-OPENAI-KEY-HERE` with your actual key

### 2. SET RAILWAY ENVIRONMENT VARIABLES (2 minutes)

Go to Railway dashboard and add these to **BOTH** services:

#### Frontend Service Variables:
```
NEXTAUTH_URL=https://frontend-production-752a.up.railway.app
NEXTAUTH_SECRET=ioU7YvrR3KGeNEC97JU8qvTRSxoLfpbedlgqMkv8JQY=
NEXT_PUBLIC_API_URL=https://pathwise-production-0768.up.railway.app
```

#### Backend Service Variables:
```
SECRET_KEY=ioU7YvrR3KGeNEC97JU8qvTRSxoLfpbedlgqMkv8JQY=
NEXTAUTH_SECRET=ioU7YvrR3KGeNEC97JU8qvTRSxoLfpbedlgqMkv8JQY=
OPENAI_API_KEY=sk-your-actual-key-here
OPENAI_MODEL=gpt-4o-mini
CORS_ORIGINS=https://frontend-production-752a.up.railway.app,http://localhost:3000
```

Railway will auto-provide: `DATABASE_URL` and `REDIS_URL` (if you add Redis service)

## 🚀 THAT'S IT!

Railway will auto-redeploy when you save the variables.

## 💰 COST:
- OpenAI: ~$0.01-0.05 per roadmap
- Railway: Free tier works fine
- Everything else: Optional

## ⚠️ SECURITY:
- ✅ `.env` files are in `.gitignore` (safe)
- ✅ Never commit API keys to GitHub
- ✅ Secret is random and secure

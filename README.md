# PathWise AI

AI-powered career acceleration platform that transforms job descriptions into personalized learning roadmaps.

## Features

- 🎯 **AI Roadmap Generation** - Paste any job description and get a personalized learning path
- 📊 **Progress Tracking** - Track your learning journey with visual progress indicators
- 💬 **AI Assistant** - Get help and guidance from an AI career coach
- 📚 **Curated Resources** - Access quality learning materials for each skill
- 🏆 **Portfolio Projects** - Build real projects to showcase your skills
- 💳 **Pro Features** - Unlimited roadmaps, priority AI access, and more

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS 3.4
- **Animation**: Framer Motion
- **State**: Zustand + React Query
- **Auth**: NextAuth.js

### Backend
- **Framework**: FastAPI
- **Database**: PostgreSQL 16
- **Cache**: Redis
- **AI**: OpenAI GPT-4
- **Payments**: LemonSqueezy

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 16
- Redis

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your values
npm run dev
```

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your values
uvicorn app.main:app --reload
```

## Environment Variables

### Frontend (.env.local)
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret
NEXT_PUBLIC_API_URL=http://localhost:8000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Backend (.env)
```
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/pathwise
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-secret-key
OPENAI_API_KEY=sk-your-key
LEMONSQUEEZY_API_KEY=your-key
```

## Project Structure

```
PathWise/
├── frontend/
│   ├── src/
│   │   ├── app/              # Next.js app router pages
│   │   ├── components/       # React components
│   │   │   ├── ui/          # Reusable UI components
│   │   │   └── landing/     # Landing page sections
│   │   └── lib/             # Utilities, types, store
│   └── public/              # Static assets
│
├── backend/
│   ├── app/
│   │   ├── api/             # API routes
│   │   ├── core/            # Config, security
│   │   ├── db/              # Database models
│   │   ├── schemas/         # Pydantic schemas
│   │   └── services/        # Business logic, AI
│   └── requirements.txt
│
└── README.md
```

## API Documentation

When the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## License

MIT License - see LICENSE file for details.

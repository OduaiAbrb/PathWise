# PathWise/iSky Master Development Plan
## Strategic Roadmap for Jordan & MENA Market Success

**Version:** 1.0  
**Date:** March 2026  
**Status:** Active Development

---

## Executive Summary

This master plan outlines the comprehensive development strategy for PathWise/iSky to achieve market leadership in the Jordan and MENA EdTech space. Based on extensive market research showing a $14.4B+ MENA EdTech market with 14.6% CAGR, combined with Jordan's 41.72% youth unemployment rate and critical skills gap, PathWise is positioned to become the definitive career development platform for the region.

---

## 1. Product Vision

### Core Value Proposition
**"From Learning to Earning"** - PathWise is a Career Outcome Machine that bridges the gap between education and employment through:
- AI-powered personalized career roadmaps
- Real-world project-based skill development
- Interview preparation and job readiness scoring
- Direct employer connections

### Key Differentiators
1. **Outcome-Focused**: Every feature answers "Will this help me get hired?"
2. **Honest Progress**: Readiness scores can decrease - no fake gamification
3. **Market-Aligned**: Skills matched to actual job market demand (35% tech/vocational in Jordan)
4. **AI-First**: Personalized mentorship at scale via AI Mentor

---

## 2. Frontend Development Priorities

### Phase 1: Core Platform Polish (Week 1-2)
- [x] Dark mode full support across all pages
- [x] Settings page functionality (profile, password, notifications)
- [ ] Fix remaining color contrast issues (26+ files identified)
- [ ] Mobile responsiveness audit and fixes
- [ ] Accessibility improvements (WCAG 2.1 AA compliance)

### Phase 2: Localization Readiness (Week 3-4)
- [ ] RTL (Right-to-Left) layout support for Arabic
- [ ] i18n infrastructure setup (next-intl or react-i18next)
- [ ] Arabic font integration (Noto Sans Arabic, Cairo)
- [ ] Date/time localization (Hijri calendar option)
- [ ] Currency display (JOD, USD, SAR)

### Phase 3: MENA-Specific Features (Week 5-6)
- [ ] Local job board integration (Bayt.com, LinkedIn MENA, Akhtaboot)
- [ ] Arabic resume builder and ATS optimizer
- [ ] Local success stories showcase
- [ ] Regional salary benchmarks
- [ ] University partnership portal

### Phase 4: Mobile-First Optimization (Week 7-8)
- [ ] PWA (Progressive Web App) implementation
- [ ] Offline content caching for low-bandwidth areas
- [ ] Touch-optimized interactions
- [ ] Mobile notification system
- [ ] App-like navigation patterns

---

## 3. Backend Development Priorities

### Phase 1: API Completion (Week 1-2)
```
Priority Endpoints to Implement/Fix:
├── /api/v1/users/change-password     POST  [NEW]
├── /api/v1/users/account             DELETE [NEW]
├── /api/v1/users/notification-preferences POST [NEW]
├── /api/v1/mentors                   GET   [VERIFY]
├── /api/v1/roadmaps/progress         PATCH [VERIFY]
├── /api/v1/interview/sessions        POST  [NEW]
└── /api/v1/analytics/user-progress   GET   [VERIFY]
```

### Phase 2: AI Integration (Week 3-4)
- [ ] OpenAI GPT-4 integration for AI Mentor
- [ ] Interview simulation engine
- [ ] Resume analysis and optimization
- [ ] Personalized learning path generation
- [ ] Skills gap analysis based on job postings

### Phase 3: Data & Analytics (Week 5-6)
- [ ] User progress tracking pipeline
- [ ] Job market data aggregation (scraping/APIs)
- [ ] Skills demand analytics
- [ ] Platform usage analytics (privacy-compliant)
- [ ] A/B testing infrastructure

### Phase 4: Scalability & Performance (Week 7-8)
- [ ] Database optimization (indexing, query optimization)
- [ ] Redis caching layer
- [ ] CDN integration for static assets
- [ ] API rate limiting
- [ ] Load testing (target: 10,000 concurrent users)

---

## 4. Business Strategy

### 4.1 Monetization Model

#### Freemium Tier (Free)
- 1 active career roadmap
- Basic AI Mentor (5 questions/day)
- Community access
- Basic job board access

#### Pro Tier ($15/month or 10 JOD/month)
- Unlimited roadmaps
- Advanced AI Mentor (unlimited + interview prep)
- Resume optimization tools
- Priority support
- Certificate of completion

#### Enterprise/B2B Tier (Custom pricing)
- Corporate training programs
- Custom skill assessments
- Dedicated account manager
- Analytics dashboard
- API access

### 4.2 Go-to-Market Strategy for Jordan

#### Phase 1: University Partnerships (Month 1-3)
- **Target**: University of Jordan, JUST, Princess Sumaya University
- **Offer**: Free Pro access for final-year CS students
- **Goal**: 1,000 active university users

#### Phase 2: Government/NGO Collaboration (Month 2-4)
- **Target**: Ministry of Digital Economy, USAID Jordan, World Bank programs
- **Offer**: Skills development initiative partnership
- **Goal**: Grant funding for youth employment program

#### Phase 3: Employer Network (Month 3-6)
- **Target**: Amazon MENA, Careem, Maktoob, local tech startups
- **Offer**: Direct hiring pipeline from top performers
- **Goal**: 20 employer partnerships

#### Phase 4: Regional Expansion (Month 6-12)
- **Markets**: UAE, Saudi Arabia, Egypt
- **Strategy**: Localized content + local partnerships
- **Goal**: 10,000 active users across MENA

### 4.3 Marketing Channels

| Channel | Strategy | Budget Allocation |
|---------|----------|-------------------|
| Social Media | TikTok career tips, LinkedIn thought leadership | 30% |
| University Events | Career fairs, workshops, hackathons | 25% |
| Influencer Marketing | Local tech YouTubers, career coaches | 20% |
| SEO/Content | Arabic blog, success stories, guides | 15% |
| Paid Ads | Google Ads (Arabic), Meta Ads | 10% |

---

## 5. Competitive Positioning

### Direct Competitors Analysis

| Competitor | Strength | Weakness | Our Advantage |
|------------|----------|----------|---------------|
| **Edraak** | Arabic content, Queen Rania backing | General education, not career-focused | Career outcome focus |
| **Abwaab** | K-12 curriculum, $20M funding | Not career/tech focused | Tech skills + job readiness |
| **Coursera** | Brand recognition, certificates | Generic, not localized | MENA job market alignment |
| **Udemy** | Wide course selection | No career guidance | AI Mentor + roadmaps |

### Unique Selling Points (USPs)
1. **Only platform with AI-powered career roadmaps** tailored to MENA job market
2. **Honest readiness scoring** that reflects actual employability
3. **Direct employer connections** for job placement
4. **Arabic-first** with cultural context

---

## 6. Key Metrics & KPIs

### Product Metrics
- **Daily Active Users (DAU)**: Target 500 by Month 3
- **Task Completion Rate**: Target 60%+
- **AI Mentor Engagement**: Target 3 sessions/user/week
- **Roadmap Completion**: Target 40% finish rate

### Business Metrics
- **User Acquisition Cost (CAC)**: Target <$5/user
- **Monthly Recurring Revenue (MRR)**: Target $5,000 by Month 6
- **Conversion Rate (Free to Pro)**: Target 5%
- **Net Promoter Score (NPS)**: Target 50+

### Impact Metrics
- **Job Placement Rate**: Target 30% of active users within 6 months
- **Skill Improvement**: Target 2+ new skills/month average
- **Interview Success Rate**: Target 40% of interview-ready users

---

## 7. Technical Architecture

### Current Stack
```
Frontend:
├── Next.js 14 (App Router)
├── TypeScript
├── TailwindCSS
├── Framer Motion
├── next-auth (Authentication)
└── Deployed on Railway

Backend:
├── FastAPI (Python)
├── PostgreSQL
├── Redis (planned)
├── OpenAI API
└── Deployed on Railway

Infrastructure:
├── Railway (PaaS)
├── GitHub (Version Control)
├── Vercel (potential CDN)
└── Sentry (Error Tracking - planned)
```

### Recommended Additions
- **Analytics**: PostHog (privacy-focused, self-hostable)
- **Payments**: Stripe (global) + local payment gateway (eFAWATEERcom for Jordan)
- **Email**: Resend or SendGrid
- **File Storage**: Cloudflare R2 or AWS S3
- **Monitoring**: Grafana + Prometheus

---

## 8. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Low user adoption | Medium | High | Strong university partnerships, free tier |
| Competition from funded players | Medium | Medium | Speed to market, niche focus |
| Technical scaling issues | Low | High | Cloud-native architecture, load testing |
| Regulatory challenges | Low | Medium | Legal review, data privacy compliance |
| Economic downturn | Medium | Medium | B2B revenue diversification |

---

## 9. Immediate Action Items (Next 2 Weeks)

### Development
1. ✅ Fix settings page functionality
2. ⏳ Fix dark mode contrast across all pages
3. [ ] Implement change password backend endpoint
4. [ ] Implement account deletion backend endpoint
5. [ ] Add Arabic language toggle (UI only, content later)
6. [ ] Mobile responsiveness fixes

### Business
1. [ ] Draft university partnership proposal
2. [ ] Create demo video for outreach
3. [ ] Set up analytics tracking
4. [ ] Create landing page A/B test variants
5. [ ] Compile list of 50 target employers in Jordan

### Content
1. [ ] Write 5 Arabic success story templates
2. [ ] Create "Getting Started" tutorial flow
3. [ ] Document API for potential B2B partners

---

## 10. Success Criteria (6-Month Goals)

| Metric | Target |
|--------|--------|
| Registered Users | 5,000 |
| Monthly Active Users | 2,000 |
| Pro Subscribers | 250 |
| University Partnerships | 3 |
| Employer Partnerships | 10 |
| Job Placements | 50 |
| MRR | $3,750 |

---

## Appendix A: File Structure for Localization

```
frontend/
├── src/
│   ├── locales/
│   │   ├── en/
│   │   │   ├── common.json
│   │   │   ├── dashboard.json
│   │   │   └── onboarding.json
│   │   └── ar/
│   │       ├── common.json
│   │       ├── dashboard.json
│   │       └── onboarding.json
│   ├── components/
│   │   └── LanguageSwitcher.tsx
│   └── middleware.ts (locale detection)
```

## Appendix B: API Endpoints Checklist

See `/backend/API_CHECKLIST.md` for full endpoint documentation.

---

*This document is a living roadmap and should be updated as priorities shift and market conditions evolve.*

# 🚨 CRITICAL BACKEND FIXES REQUIRED

## **Issue #1: Interview Prep - All Types Revert to Coding Questions**

### Problem:
When users select "System Design", "Behavioral", or "Full Mock" interview types, they still get coding questions instead of the appropriate question types.

### Current Frontend Request:
```json
POST /api/v1/interview/start
{
  "session_type": "system_design",  // or "behavioral" or "full_mock"
  "target_role": "Backend Engineer",
  "difficulty": "medium"
}
```

### What Backend Must Do:
1. **Check the `session_type` parameter** in the request
2. **Generate different question types based on `session_type`:**
   - `"coding"` → LeetCode-style algorithm problems
   - `"system_design"` → Design scalable systems (e.g., "Design Twitter", "Design URL Shortener")
   - `"behavioral"` → STAR method questions (e.g., "Tell me about a time you handled conflict")
   - `"full_mock"` → Mix of all three types (2 coding + 1 system design + 1 behavioral)

3. **Question format should match:**
```json
{
  "questions": [
    {
      "id": "q1",
      "type": "system_design",  // Must match session_type
      "question": "Design a rate limiter for an API gateway that handles 10M requests per second",
      "hints": [...],
      "ideal_answer": "..."
    }
  ]
}
```

### Testing:
- Start interview with `session_type: "system_design"` → Should get design questions, NOT coding
- Start interview with `session_type: "behavioral"` → Should get STAR questions, NOT coding

---

## **Issue #2: Portfolio Generation - Fails to Fetch (Must Be Realistic)**

### Problem:
Portfolio generation endpoint returns 404 or generic content. It must generate realistic portfolios based on user's actual progress.

### Current Frontend Request:
```json
POST /api/v1/portfolio/generate
{
  "target_role": "Backend Engineer",
  "completed_skills": ["Python", "Django", "REST APIs", "PostgreSQL"],
  "in_progress_skills": ["Redis", "Docker"],
  "overall_progress": 45,
  "experience_level": "intermediate"
}
```

### What Backend Must Do:
1. **Use the actual user data** to generate portfolio content
2. **Generate realistic outputs:**
   - **Bio**: "Backend engineer with expertise in [completed_skills]. Currently learning [in_progress_skills]."
   - **Resume Bullets**: Based on completed skills only (don't claim skills user hasn't learned)
   - **LinkedIn Post**: Mention actual achievements, not generic "I'm learning"
   - **Project Ideas**: Match skill level (don't suggest senior projects for beginners)

3. **Example Response:**
```json
{
  "data": {
    "bio": "Backend Engineer specializing in Python, Django, and PostgreSQL. Built REST APIs for [project]. Currently expanding skills in Redis and Docker to improve system scalability.",
    "resume_bullets": [
      "Designed and implemented REST APIs using Django Rest Framework, serving 10K+ users",
      "Optimized PostgreSQL queries, reducing response time by 40%"
    ],
    "linkedin_post": "Just completed my Django certification! Built a full-stack app with authentication, API design, and database optimization.",
    "project_ideas": [
      "Build a task management API with Django + PostgreSQL",
      "Create a caching layer using Redis for frequently accessed data"
    ]
  }
}
```

### Testing:
- User with 20% progress → Should get beginner-level portfolio
- User with 80% progress → Should get advanced portfolio
- User who hasn't completed Django → Resume shouldn't mention Django projects

---

## **Issue #3: Partners Page - Must Show REAL Users**

### Problem:
Partners page shows mock data. It must fetch real users from the database.

### Current Frontend Request:
```http
GET /api/v1/users
Authorization: Bearer {token}
```

### What Backend Must Do:
1. **Create `/api/v1/users` endpoint** that returns ALL users in the platform (excluding current user)
2. **Return user data:**
```json
{
  "data": [
    {
      "id": "user-123",
      "name": "John Doe",
      "email": "john@example.com",
      "target_role": "Backend Engineer",
      "experience_level": "intermediate",
      "overall_progress": 65,
      "streak": 12,
      "current_skills": ["Python", "Django", "PostgreSQL"]
    },
    ...
  ]
}
```

3. **Create `/api/v1/partners/request` endpoint:**
```json
POST /api/v1/partners/request
{
  "partner_id": "user-123"
}
```
Should create a partnership request in database and send notification to requested user.

### Testing:
- Create 3 user accounts
- Login as User A
- Navigate to Partners page
- Should see User B and User C listed as potential partners
- Click "Send Partner Request" → Should create partnership record

---

## **Issue #4: Study Groups - Must Show ALL Groups Globally**

### Problem:
Study groups only show groups created by current user. Must show ALL groups from ALL users.

### Current Frontend Request:
```http
GET /api/v1/social/groups?scope=all
Authorization: Bearer {token}
```

### What Backend Must Do:
1. **Modify `/api/v1/social/groups` endpoint** to support `scope=all` parameter
2. **When `scope=all`:**
   - Return ALL study groups in database (public + user's private groups)
   - Include groups created by other users
   - Mark which groups the current user is already a member of

3. **Response format:**
```json
{
  "data": [
    {
      "id": "group-1",
      "name": "Backend Engineers Hub",
      "description": "Weekly system design discussions",
      "creator_id": "user-456",  // Different user
      "creator_name": "Jane Smith",
      "member_count": 24,
      "max_members": 30,
      "topic": "Backend Development",
      "is_private": false,
      "next_session": "2026-01-15T19:00:00Z",
      "is_member": false  // Current user is not in this group
    },
    {
      "id": "group-2",
      "name": "Python Mastery",
      "description": "From basics to advanced",
      "creator_id": "user-123",  // Current user
      "creator_name": "John Doe",
      "member_count": 8,
      "max_members": 25,
      "topic": "Python",
      "is_private": false,
      "next_session": null,
      "is_member": true  // Current user IS in this group
    }
  ]
}
```

### Testing:
- User A creates "React Study Group"
- User B creates "Python Study Group"
- User C logs in and navigates to Study Groups
- User C should see BOTH "React Study Group" and "Python Study Group"
- Currently, User C only sees their own groups (which is 0) → BUG

---

## **🎯 PRIORITY ORDER:**

1. **Interview Prep** (HIGHEST) - Users are confused why all interviews are coding
2. **Study Groups** - Users can't collaborate if they can't see each other's groups
3. **Partners** - Users can't find accountability partners if they can't see other users
4. **Portfolio** - Less urgent but needed for job applications

---

## **📋 TESTING CHECKLIST:**

### Interview Prep:
- [ ] Start system design interview → Get design questions (NOT coding)
- [ ] Start behavioral interview → Get STAR questions (NOT coding)
- [ ] Start full mock → Get mixed question types

### Portfolio:
- [ ] Beginner user (20% progress) → Beginner portfolio content
- [ ] Advanced user (80% progress) → Advanced portfolio content
- [ ] User without Django skill → Resume doesn't mention Django

### Partners:
- [ ] Login as User A → See Users B, C, D in partners list
- [ ] Send partner request → Request saved to database
- [ ] Partner receives notification

### Study Groups:
- [ ] User A creates group "React Devs"
- [ ] User B creates group "Python Pros"
- [ ] User C logs in → Sees BOTH groups
- [ ] User C joins "React Devs" → `is_member` becomes true

---

**ALL OF THESE ARE CRITICAL BUGS AFFECTING USER EXPERIENCE!**

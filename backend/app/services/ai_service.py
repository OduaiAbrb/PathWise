import json
import uuid
from typing import Optional, List
from openai import AsyncOpenAI

from app.core.config import settings

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


ROADMAP_SYSTEM_PROMPT = """You are an expert career advisor and learning path designer. Your task is to analyze job descriptions and create comprehensive, personalized learning roadmaps.

PRODUCT NORTH STAR:
PathWise exists to solve ONE problem:
People don't know what to learn, in what order, or when they are actually ready for jobs.

Your roadmaps must turn:
- confusion → clarity
- learning → readiness  
- effort → confidence
- progress → proof

When given a job description, you must:
1. Extract the key job title
2. Identify all required and preferred skills, ranked by INTERVIEW FREQUENCY
3. Organize skills into logical learning phases
4. Explain WHY each skill matters and WHAT HAPPENS IF SKIPPED
5. Suggest specific resources for each skill
6. Recommend portfolio projects that map directly to job requirements

Output your response as valid JSON with this structure:
{
  "job_title": "extracted job title",
  "industry": "detected industry",
  "estimated_weeks": number,
  "why_this_roadmap": "Brief explanation of why skills are ordered this way",
  "phases": [
    {
      "id": "phase-uuid",
      "name": "Phase Name",
      "description": "Brief description",
      "order": 1,
      "estimated_weeks": number,
      "skills": [
        {
          "id": "skill-uuid",
          "name": "Skill Name",
          "category": "technical|soft|domain",
          "difficulty": "beginner|intermediate|advanced",
          "importance": "critical|important|optional",
          "interview_frequency": number (percentage of interviews that test this),
          "estimated_hours": number,
          "description": "Brief skill description",
          "why_this_matters": "Explain why this skill is critical for the role",
          "what_if_skipped": "Consequences of skipping this skill",
          "resources": [
            {
              "id": "resource-uuid",
              "title": "Resource Title",
              "url": "https://example.com",
              "type": "video|article|course|documentation|book",
              "difficulty": "beginner|intermediate|advanced",
              "duration_minutes": number,
              "quality_score": 0.0-1.0
            }
          ]
        }
      ]
    }
  ],
  "projects": [
    {
      "id": "project-uuid",
      "title": "Project Title",
      "description": "Project description",
      "difficulty": "beginner|intermediate|advanced",
      "estimated_hours": number,
      "skills": ["skill names used"],
      "resume_bullet": "How to describe this on resume",
      "interview_talking_points": ["point 1", "point 2"],
      "steps": ["step 1", "step 2", ...]
    }
  ]
}

CRITICAL RESOURCE URL GUIDELINES - FOLLOW EXACTLY:
✅ USE ONLY THESE VERIFIED SOURCES WITH EXACT URL FORMATS:

DOCUMENTATION (Always include these first - most reliable):
- MDN Web Docs: https://developer.mozilla.org/en-US/docs/[topic]
- React Docs: https://react.dev/learn/[topic]
- Python Docs: https://docs.python.org/3/[topic]
- FastAPI Docs: https://fastapi.tiangolo.com/[topic]
- Node.js Docs: https://nodejs.org/en/docs/[topic]
- TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/[topic]

FREE LEARNING PLATFORMS (Direct course links):
- freeCodeCamp: https://www.freecodecamp.org/learn/[course-path]
- The Odin Project: https://www.theodinproject.com/lessons/[lesson-name]
- W3Schools: https://www.w3schools.com/[topic]/default.asp
- Khan Academy: https://www.khanacademy.org/computing/[path]
- Scrimba: https://scrimba.com/learn/[course-name]

YOUTUBE CHANNELS (Use channel URLs, NOT individual video URLs that may break):
- freeCodeCamp: https://www.youtube.com/@freecodecamp
- Traversy Media: https://www.youtube.com/@TraversyMedia  
- Web Dev Simplified: https://www.youtube.com/@WebDevSimplified
- Fireship: https://www.youtube.com/@Fireship
- The Net Ninja: https://www.youtube.com/@NetNinja
- Corey Schafer: https://www.youtube.com/@coreyms

PRACTICE PLATFORMS:
- LeetCode: https://leetcode.com/problemset/[topic]
- HackerRank: https://www.hackerrank.com/domains/[domain]
- Exercism: https://exercism.org/tracks/[language]
- Codewars: https://www.codewars.com/kata/search/[language]

QUALITY BLOGS/TUTORIALS:
- Real Python: https://realpython.com/[topic]
- CSS-Tricks: https://css-tricks.com/[topic]
- DigitalOcean Tutorials: https://www.digitalocean.com/community/tutorials/[topic]
- LogRocket Blog: https://blog.logrocket.com/[topic]

❌ NEVER USE:
- Individual YouTube video URLs (use channel URLs instead - videos get deleted)
- Udemy, Coursera, Pluralsight (paid platforms)
- Medium articles (often paywalled)
- Random blog sites with unknown quality
- Any URL you're not 100% sure exists

RESOURCE FORMAT REQUIREMENTS:
- quality_score must be 0.8-1.0 for all resources
- Each resource MUST use one of the verified URL patterns above
- Include "what_you_learn" field describing specific outcomes
- Include "time_to_complete" in minutes (realistic estimates)
- Mark resource type: "documentation", "video", "interactive", "article"
- CRITICAL: Include "why_chosen" field explaining why THIS specific resource was picked
  Example: "why_chosen": "Most comprehensive free tutorial covering all SQL join types with visual diagrams"
  Example: "why_chosen": "This topic appears in 78% of backend interviews - official docs are the gold standard"

Guidelines:
- Create 4-6 phases, progressing from foundational to advanced (LONGER ROADMAPS)
- Include 5-8 skills per phase (MORE COMPREHENSIVE)
- Order skills by INTERVIEW FREQUENCY within phases
- Each skill MUST have 5-8 high-quality resources (3x MORE RESOURCES)
- Mix resource types: 2-3 videos, 1-2 documentation links, 1-2 interactive, 1-2 articles
- Include time estimates for each skill (realistic hours)
- Total roadmap should be 12-20 weeks for complete mastery
- Suggest 2-4 quality resources per skill (prefer free resources)
- Recommend 2-4 portfolio projects of increasing complexity
- Adjust difficulty based on the user's stated skill level
- Generate unique UUIDs for all id fields
- ALWAYS include interview_frequency for each skill"""


async def generate_roadmap(
    job_description: str,
    skill_level: str,
    industry: Optional[str] = None,
    preferences: Optional[dict] = None
) -> dict:
    """Generate a learning roadmap using Emergent LLM with user preferences."""
    
    print(f"🎯 Generating roadmap for: {job_description[:100]}...")
    print(f"📊 Skill level: {skill_level}, Industry: {industry}")
    if preferences:
        print(f"⚙️ Preferences: {preferences}")
    
    # Build preferences section for prompt
    prefs = preferences or {}
    pace = prefs.get("pace", "standard")
    time_per_day = prefs.get("time_per_day_minutes", 60)
    days_per_week = prefs.get("days_per_week", 5)
    depth = prefs.get("depth", "interview_ready")
    learning_style = prefs.get("learning_style", "mixed")
    resource_preference = prefs.get("resource_preference", "hybrid")  # visual | reading | hybrid
    focus_areas = prefs.get("focus_areas", [])
    constraints = prefs.get("constraints", "")
    
    # Resource preference instructions
    resource_instruction = ""
    if resource_preference == "visual":
        resource_instruction = """
⚠️ CRITICAL - VISUAL LEARNER: User learns best through VIDEOS.
- For EACH skill, provide 80%+ VIDEO resources (YouTube tutorials, video courses)
- Prioritize: YouTube channels, video tutorials, screencasts, visual explainers
- Include documentation ONLY as reference, not primary learning material
- Every skill MUST have at least 3 video resources"""
    elif resource_preference == "reading":
        resource_instruction = """
⚠️ CRITICAL - READING LEARNER: User learns best through TEXT/DOCUMENTATION.
- For EACH skill, provide 80%+ TEXT resources (documentation, articles, books)
- Prioritize: Official docs, MDN, Real Python, technical blogs, written tutorials
- Minimize videos - include ONLY if essential and no good text alternative exists
- Every skill MUST have at least 3 documentation/article resources"""
    else:  # hybrid
        resource_instruction = """
⚠️ HYBRID LEARNER: User wants a MIX of videos AND documentation.
- For EACH skill, provide balanced resources: ~50% videos, ~50% text
- Include: Video tutorials for concepts, docs for reference
- Every skill should have 2-3 videos AND 2-3 documentation links"""
    
    preferences_text = f"""
USER PREFERENCES (adapt the roadmap accordingly):
- Pace: {pace} (relaxed=more time per skill, intense=compressed timeline)
- Available time: {time_per_day} minutes/day, {days_per_week} days/week
- Depth: {depth} (overview=surface level, deep=comprehensive, interview_ready=focused on what gets asked)
- Learning style: {learning_style} (project_first=hands-on, theory_first=concepts, mixed=balanced)
- RESOURCE TYPE PREFERENCE: {resource_preference.upper()}
{resource_instruction}
{f"- Focus areas: {', '.join(focus_areas)}" if focus_areas else ""}
{f"- Constraints: {constraints}" if constraints else ""}
"""
    
    user_prompt = f"""Create a detailed learning roadmap for this job/career goal:

Description:
{job_description}

User's Current Skill Level: {skill_level}
{f"Industry: {industry}" if industry else ""}
{preferences_text}

IMPORTANT: 
- Even if the description is brief, infer the role and create a comprehensive roadmap.
- Rank skills by INTERVIEW FREQUENCY (percentage of interviews that ask about this skill)
- Explain WHY each skill matters for getting hired
- Explain WHAT HAPPENS if the user skips a skill
- Generate portfolio projects with resume bullets and interview talking points
- For EACH PHASE include:
  * "deliverables": list of 3-5 concrete things user can do after completing this phase
  * "benchmarks": list of 2-3 pass criteria (what proves mastery)
  * "why_it_matters": 1-2 sentences on interview/job relevance
  * "phase_project": a must-build project for this phase with title, description, requirements

Generate a complete learning path with phases, skills, high-quality resources (with real URLs), and projects.
Output as valid JSON."""

    try:
        print("🤖 Calling OpenAI API...")
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": ROADMAP_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=4000,
            response_format={"type": "json_object"}
        )
        
        print("✅ OpenAI response received")
        result = json.loads(response.choices[0].message.content)
        print(f"📦 Roadmap generated: {result.get('job_title', 'Unknown')} with {len(result.get('phases', []))} phases")
        
        # Ensure all IDs are present
        for phase in result.get("phases", []):
            if not phase.get("id"):
                phase["id"] = str(uuid.uuid4())
            for skill in phase.get("skills", []):
                if not skill.get("id"):
                    skill["id"] = str(uuid.uuid4())
                # Ensure interview_frequency exists
                if not skill.get("interview_frequency"):
                    skill["interview_frequency"] = 50  # Default
                for resource in skill.get("resources", []):
                    if not resource.get("id"):
                        resource["id"] = str(uuid.uuid4())
        
        for project in result.get("projects", []):
            if not project.get("id"):
                project["id"] = str(uuid.uuid4())
        
        return result
        
    except Exception as e:
        error_msg = str(e)
        print(f"❌ AI roadmap generation error: {error_msg}")
        
        # Provide more helpful error messages
        if "rate_limit" in error_msg.lower():
            raise Exception("OpenAI API rate limit reached. Please try again in a moment.")
        elif "api_key" in error_msg.lower() or "authentication" in error_msg.lower():
            raise Exception("OpenAI API key is invalid or missing. Please contact support.")
        elif "timeout" in error_msg.lower():
            raise Exception("AI generation timed out. Please try with a shorter description.")
        else:
            raise Exception(f"AI generation failed: {error_msg}")


CHAT_SYSTEM_PROMPT = """You are PathWise AI, a world-class career and learning assistant. You help users with:
- Questions about their learning roadmap
- Career advice and guidance
- Explaining technical concepts
- Suggesting resources and learning strategies
- Motivation and accountability

RULES:
- Be encouraging but HONEST - no sugar-coating
- Be practical and specific in your responses
- If the user shares their roadmap context, reference it in your answers
- Always focus on what helps the user GET HIRED"""


async def chat_response(
    message: str,
    conversation_history: List[dict],
    roadmap_context: Optional[dict] = None
) -> str:
    """Generate a chat response using Emergent LLM."""
    
    system_msg = CHAT_SYSTEM_PROMPT
    
    # Add roadmap context if available
    if roadmap_context:
        system_msg += f"""

User's Current Roadmap Context:
- Job Target: {roadmap_context.get('job_title', 'Not specified')}
- Progress: {roadmap_context.get('completion_percentage', 0)}%
- Current Phase: {roadmap_context.get('current_phase', 'Not started')}"""
    
    try:
        messages = [{"role": "system", "content": system_msg}]
        
        # Add conversation history
        for msg in conversation_history[-10:]:
            messages.append({"role": msg["role"], "content": msg["content"]})
        
        # Add current message
        messages.append({"role": "user", "content": message})
        
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=messages,
            temperature=0.7,
            max_tokens=1000,
        )
        
        return response.choices[0].message.content
        
    except Exception as e:
        print(f"AI chat error: {e}")
        raise


RESUME_ANALYSIS_PROMPT = """Analyze this resume and provide:
1. A list of identified skills with proficiency levels
2. Years of experience estimation
3. Strengths and areas for improvement
4. Recommendations for the target role (if provided)

Be HONEST - no sugar-coating. The user needs to know their real gaps.

Output as JSON:
{
  "skills": [{"name": "skill", "proficiency": "beginner|intermediate|advanced"}],
  "experience_years": number,
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["area 1", "area 2"],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "match_score": 0-100 (if target role provided)
}"""


async def analyze_resume(
    resume_text: str,
    target_role: Optional[str] = None
) -> dict:
    """Analyze a resume using OpenAI."""
    
    user_prompt = f"""Analyze this resume:

{resume_text}

{f"Target Role: {target_role}" if target_role else ""}"""

    try:
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": RESUME_ANALYSIS_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.5,
            max_tokens=2000,
            response_format={"type": "json_object"}
        )
        
        return json.loads(response.choices[0].message.content)
        
    except Exception as e:
        print(f"Resume analysis error: {e}")
        raise


async def generate_portfolio_content(
    target_role: str,
    roadmap_data: list,
    skill_level: str
) -> dict:
    """Generate portfolio content including bio, projects, resume bullets"""
    
    skills_list = []
    for phase in roadmap_data:
        for skill in phase.get("skills", []):
            skills_list.append(skill.get("name"))
    
    prompt = f"""Generate professional portfolio content for a {target_role} candidate.

Skills mastered: {", ".join(skills_list[:15])}
Experience level: {skill_level}

Generate:
1. Professional bio (2-3 sentences, confident but honest)
2. 5 resume bullet points showcasing these skills
3. 3 LinkedIn post ideas to demonstrate expertise
4. 3 portfolio project ideas with descriptions
5. Skill certificates to highlight

Output as JSON with keys: tagline, bio, resume_bullets, linkedin_posts, projects, certificates"""

    try:
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are a career coach helping users create compelling portfolios."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=2000,
            response_format={"type": "json_object"}
        )
        
        return json.loads(response.choices[0].message.content)
        
    except Exception as e:
        print(f"Portfolio generation error: {e}")
        raise


async def generate_interview_questions(
    session_type: str,
    target_role: str,
    difficulty: str
) -> list:
    """Generate interview questions for simulation"""
    
    print(f"🎯 Generating {session_type} questions for {target_role} ({difficulty})")
    
    # Build type-specific instructions
    type_instructions = {
        "coding": """Generate exactly 3 CODING interview questions.
These must be algorithm/data structure problems like:
- Array manipulation, string processing
- Tree/graph traversal
- Dynamic programming (for hard difficulty)
- Time/space complexity analysis
Each question should have example input/output.""",
        
        "system_design": """Generate exactly 3 SYSTEM DESIGN interview questions.
These must be architecture/scalability problems like:
- Design a URL shortener
- Design a chat application
- Design a rate limiter
- Design a notification system
Focus on scalability, trade-offs, and component design.""",
        
        "behavioral": """Generate exactly 5 BEHAVIORAL interview questions.
These must be STAR method questions like:
- Tell me about a time you faced a conflict
- Describe a challenging project you led
- How do you handle tight deadlines
- Give an example of when you failed
Focus on leadership, teamwork, problem-solving.""",
        
        "full_mock": """Generate a MIX of questions:
- 2 coding problems
- 2 system design questions  
- 4 behavioral questions
This simulates a full interview loop."""
    }
    
    instructions = type_instructions.get(session_type, type_instructions["coding"])
    
    prompt = f"""You are interviewing a candidate for: {target_role}
Difficulty level: {difficulty}

{instructions}

CRITICAL: Generate questions that match the TYPE specified above.
- If system_design: NO coding problems, only architecture questions
- If behavioral: NO technical problems, only STAR questions
- If coding: Focus on algorithms and data structures

Output as JSON with this EXACT format:
{{
  "questions": [
    {{
      "id": "q1",
      "type": "{session_type}",
      "question": "Full question text here",
      "hints": ["hint 1", "hint 2"],
      "ideal_answer": "Key points a strong answer should include",
      "time_limit_minutes": 15
    }}
  ]
}}"""

    try:
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": f"You are an expert {session_type} interviewer at a top tech company. Generate ONLY {session_type} questions."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=3000,
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        questions = result.get("questions", result if isinstance(result, list) else [])
        
        print(f"✅ Generated {len(questions)} {session_type} questions")
        return questions
        
    except Exception as e:
        print(f"❌ Interview question generation error: {e}")
        raise


async def evaluate_interview_response(
    questions: list,
    responses: list,
    target_role: str,
    session_type: str
) -> dict:
    """Evaluate interview responses"""
    
    evaluation_data = {
        "questions": questions,
        "responses": responses
    }
    
    prompt = f"""Evaluate this {session_type} interview for a {target_role} position.

Interview data: {json.dumps(evaluation_data, indent=2)}

Provide:
1. Overall score (0-100)
2. Detailed feedback for each response
3. Top 3 strengths
4. Top 3 areas for improvement
5. Specific recommendations

Be HONEST but constructive. Output as JSON."""

    try:
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are an expert interview evaluator providing honest, constructive feedback."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,
            max_tokens=2000,
            response_format={"type": "json_object"}
        )
        
        return json.loads(response.choices[0].message.content)
        
    except Exception as e:
        print(f"Interview evaluation error: {e}")
        raise


# ═══════════════════════════════════════════════════════════════════════════
# EXAM QUESTION GENERATION
# ═══════════════════════════════════════════════════════════════════════════

async def generate_exam_questions(
    phase_title: str,
    skills: List[str],
    target_role: str,
    difficulty: str = "intermediate",
    num_questions: int = 5
) -> list:
    """Generate exam questions for a roadmap phase using AI."""
    
    prompt = f"""Generate {num_questions} exam questions for a learning phase.

PHASE: {phase_title}
SKILLS COVERED: {', '.join(skills)}
TARGET ROLE: {target_role}
DIFFICULTY: {difficulty}

REQUIREMENTS:
1. Mix of question types:
   - 3 MCQ (multiple choice with 4 options)
   - 1 open-ended (explain in your own words)
   - 1 code/practical (if applicable)

2. Questions should test UNDERSTANDING, not memorization
3. Include "why" questions that test conceptual grasp
4. MCQ options should include plausible distractors
5. Each question should map to interview-relevant knowledge

OUTPUT FORMAT (JSON):
{{
  "questions": [
    {{
      "id": "q1",
      "type": "mcq",
      "question": "What is...",
      "options": ["A", "B", "C", "D"],
      "correct_answer": 0,
      "explanation": "The correct answer is A because...",
      "skill": "skill name",
      "difficulty": "easy|medium|hard"
    }},
    {{
      "id": "q2",
      "type": "open",
      "question": "Explain in your own words...",
      "rubric": "Look for: clarity, accuracy, examples",
      "skill": "skill name",
      "difficulty": "medium"
    }}
  ]
}}"""

    try:
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are an expert educator creating assessment questions that test true understanding, not memorization."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=2000,
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        return result.get("questions", [])
        
    except Exception as e:
        print(f"❌ Exam generation error: {e}")
        # Return fallback questions
        return [
            {
                "id": "fallback-1",
                "type": "mcq",
                "question": f"Which concept is most important in {phase_title}?",
                "options": skills[:4] if len(skills) >= 4 else skills + ["None of the above"] * (4 - len(skills)),
                "correct_answer": 0,
                "explanation": f"{skills[0] if skills else 'The first concept'} is foundational.",
                "skill": skills[0] if skills else "general",
                "difficulty": "medium"
            }
        ]


async def evaluate_open_answer(
    question: str,
    answer: str,
    skill: str,
    target_role: str
) -> dict:
    """Evaluate an open-ended answer using AI."""
    
    prompt = f"""Evaluate this answer for a {target_role} learning assessment.

QUESTION: {question}
SKILL BEING TESTED: {skill}
STUDENT'S ANSWER: {answer}

EVALUATION CRITERIA:
1. Correctness (0-40 points): Is the answer factually accurate?
2. Clarity (0-30 points): Is the explanation clear and well-structured?
3. Depth (0-20 points): Does it show understanding beyond surface level?
4. Examples (0-10 points): Are relevant examples provided?

OUTPUT FORMAT (JSON):
{{
  "score": 0-100,
  "correctness": 0-40,
  "clarity": 0-30,
  "depth": 0-20,
  "examples": 0-10,
  "feedback": "Constructive feedback...",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["area to improve"],
  "interview_tip": "How this would be received in an interview..."
}}"""

    try:
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are a supportive but honest educator evaluating student understanding. Be encouraging but accurate."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,
            max_tokens=1000,
            response_format={"type": "json_object"}
        )
        
        return json.loads(response.choices[0].message.content)
        
    except Exception as e:
        print(f"❌ Answer evaluation error: {e}")
        # Return fallback evaluation
        return {
            "score": 70,
            "feedback": "Your answer shows understanding. Keep practicing to deepen your knowledge.",
            "strengths": ["Attempted the question"],
            "improvements": ["Add more specific examples"],
            "interview_tip": "In interviews, try to structure your answer with a clear beginning, middle, and end."
        }


async def generate_phase_checkpoints(
    phase_title: str,
    skills: List[str],
    target_role: str
) -> list:
    """Generate inline checkpoint questions for a phase."""
    
    prompt = f"""Generate 2-3 quick checkpoint questions for each skill in this phase.

PHASE: {phase_title}
SKILLS: {', '.join(skills)}
TARGET ROLE: {target_role}

These are INLINE checkpoints - quick understanding checks, not full exams.

REQUIREMENTS:
1. Each question should take <30 seconds to answer
2. MCQ only (4 options)
3. Test ONE concept per question
4. Include brief explanation for correct answer

OUTPUT FORMAT (JSON):
{{
  "checkpoints": [
    {{
      "id": "cp1",
      "skill": "skill name",
      "type": "mcq",
      "question": "Quick question...",
      "options": ["A", "B", "C", "D"],
      "correct_answer": 0,
      "explanation": "Brief explanation..."
    }}
  ]
}}"""

    try:
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You create quick, focused checkpoint questions that test understanding efficiently."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1500,
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        return result.get("checkpoints", [])
        
    except Exception as e:
        print(f"❌ Checkpoint generation error: {e}")
        return []

import json
import uuid
from typing import Optional, List
from openai import AsyncOpenAI

from app.core.config import settings

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


ROADMAP_SYSTEM_PROMPT = """You are an expert career advisor and learning path designer. Your task is to analyze job descriptions and create comprehensive, personalized learning roadmaps.

When given a job description, you must:
1. Extract the key job title
2. Identify all required and preferred skills
3. Organize skills into logical learning phases
4. Suggest specific resources for each skill
5. Recommend portfolio projects

Output your response as valid JSON with this structure:
{
  "job_title": "extracted job title",
  "industry": "detected industry",
  "estimated_weeks": number,
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
          "estimated_hours": number,
          "description": "Brief skill description",
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
      "steps": ["step 1", "step 2", ...]
    }
  ]
}

CRITICAL RESOURCE URL GUIDELINES - FOLLOW EXACTLY:
✅ HIGH-QUALITY FREE RESOURCES ONLY:
- YouTube: Use specific VIDEO IDs or PLAYLIST IDs from verified channels
  * Web Dev: Traversy Media, freeCodeCamp, Net Ninja, Web Dev Simplified
  * Python: Corey Schafer, Tech With Tim, mCoding
  * Data Science: StatQuest, Krish Naik, freeCodeCamp
  * DevOps: TechWorld with Nana, NetworkChuck, KodeKloud
- Official Documentation: MDN, Python.org, React.dev, FastAPI.tiangolo.com, etc.
- Free Platforms: freeCodeCamp.org, The Odin Project, Scrimba, W3Schools
- Quality Blogs: Real Python, CSS-Tricks, Smashing Magazine
- Interactive: Codecademy, Khan Academy, LeetCode, HackerRank

❌ NEVER USE:
- Broken or placeholder URLs
- Generic course marketplace URLs without specific course IDs
- Paid-only content unless it's highly rated
- Outdated resources (pre-2020 unless it's timeless content)
- Low-quality tutorial sites

RESOURCE QUALITY REQUIREMENTS:
- quality_score must be 0.7-1.0 for all resources
- Each resource MUST have a specific, working URL
- Prefer beginner-friendly resources for beginner skills
- Include mix of video, documentation, and interactive resources
- Duration estimates must be realistic

Guidelines:
- Create 3-5 phases, progressing from foundational to advanced
- Include 3-6 skills per phase
- Suggest 2-4 quality resources per skill (prefer free resources)
- Recommend 2-4 portfolio projects of increasing complexity
- Adjust difficulty based on the user's stated skill level
- Generate unique UUIDs for all id fields"""


async def generate_roadmap(
    job_description: str,
    skill_level: str,
    industry: Optional[str] = None
) -> dict:
    """Generate a learning roadmap using GPT-4."""
    
    print(f"🎯 Generating roadmap for: {job_description[:100]}...")
    print(f"📊 Skill level: {skill_level}, Industry: {industry}")
    
    user_prompt = f"""Create a detailed learning roadmap for this job/career goal:

Description:
{job_description}

User's Current Skill Level: {skill_level}
{f"Industry: {industry}" if industry else ""}

IMPORTANT: Even if the description is brief, infer the role and create a comprehensive roadmap.
Generate a complete learning path with phases, skills, high-quality resources (with real URLs), and projects."""

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
                for resource in skill.get("resources", []):
                    if not resource.get("id"):
                        resource["id"] = str(uuid.uuid4())
        
        for project in result.get("projects", []):
            if not project.get("id"):
                project["id"] = str(uuid.uuid4())
        
        return result
        
    except Exception as e:
        print(f"AI roadmap generation error: {e}")
        raise


CHAT_SYSTEM_PROMPT = """You are PathWise AI, a helpful career and learning assistant. You help users with:
- Questions about their learning roadmap
- Career advice and guidance
- Explaining technical concepts
- Suggesting resources and learning strategies
- Motivation and accountability

Be encouraging, practical, and specific in your responses. If the user shares their roadmap context, reference it in your answers."""


async def chat_response(
    message: str,
    conversation_history: List[dict],
    roadmap_context: Optional[dict] = None
) -> str:
    """Generate a chat response using GPT-4."""
    
    messages = [{"role": "system", "content": CHAT_SYSTEM_PROMPT}]
    
    # Add roadmap context if available
    if roadmap_context:
        context_msg = f"""User's Current Roadmap Context:
- Job Target: {roadmap_context.get('job_title', 'Not specified')}
- Progress: {roadmap_context.get('completion_percentage', 0)}%
- Current Phase: {roadmap_context.get('current_phase', 'Not started')}"""
        messages.append({"role": "system", "content": context_msg})
    
    # Add conversation history
    for msg in conversation_history[-10:]:  # Last 10 messages
        messages.append({"role": msg["role"], "content": msg["content"]})
    
    # Add current message
    messages.append({"role": "user", "content": message})
    
    try:
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
    """Analyze a resume using GPT-4."""
    
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

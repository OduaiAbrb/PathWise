import json
import uuid
from typing import Optional, List
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from emergentintegrations.llm.chat import LlmChat, UserMessage
from app.core.config import settings

# Use Emergent LLM key if available, fall back to OpenAI
API_KEY = settings.EMERGENT_LLM_KEY or settings.OPENAI_API_KEY
MODEL_NAME = "gpt-4o"  # Using gpt-4o via Emergent


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
- Order skills by INTERVIEW FREQUENCY within phases
- Suggest 2-4 quality resources per skill (prefer free resources)
- Recommend 2-4 portfolio projects of increasing complexity
- Adjust difficulty based on the user's stated skill level
- Generate unique UUIDs for all id fields
- ALWAYS include interview_frequency for each skill"""


async def generate_roadmap(
    job_description: str,
    skill_level: str,
    industry: Optional[str] = None
) -> dict:
    """Generate a learning roadmap using Emergent LLM."""
    
    print(f"🎯 Generating roadmap for: {job_description[:100]}...")
    print(f"📊 Skill level: {skill_level}, Industry: {industry}")
    
    user_prompt = f"""Create a detailed learning roadmap for this job/career goal:

Description:
{job_description}

User's Current Skill Level: {skill_level}
{f"Industry: {industry}" if industry else ""}

IMPORTANT: 
- Even if the description is brief, infer the role and create a comprehensive roadmap.
- Rank skills by INTERVIEW FREQUENCY (percentage of interviews that ask about this skill)
- Explain WHY each skill matters for getting hired
- Explain WHAT HAPPENS if the user skips a skill
- Generate portfolio projects with resume bullets and interview talking points

Generate a complete learning path with phases, skills, high-quality resources (with real URLs), and projects.
Output as valid JSON."""

    try:
        print(f"🤖 Calling Emergent LLM API with key: {API_KEY[:20]}...")
        
        chat = LlmChat(
            api_key=API_KEY,
            session_id=f"roadmap-{uuid.uuid4()}",
            system_message=ROADMAP_SYSTEM_PROMPT
        ).with_model("openai", MODEL_NAME)
        
        user_message = UserMessage(text=user_prompt)
        response_text = await chat.send_message(user_message)
        
        print("✅ LLM response received")
        
        # Parse JSON from response
        # Handle case where response might have markdown code blocks
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0]
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0]
            
        result = json.loads(response_text.strip())
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
        chat = LlmChat(
            api_key=API_KEY,
            session_id=f"chat-{uuid.uuid4()}",
            system_message=system_msg
        ).with_model("openai", MODEL_NAME)
        
        # Add conversation history as messages
        for msg in conversation_history[-10:]:
            chat.messages.append({"role": msg["role"], "content": msg["content"]})
        
        user_message = UserMessage(text=message)
        response = await chat.send_message(user_message)
        
        return response
        
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
    """Analyze a resume using Emergent LLM."""
    
    user_prompt = f"""Analyze this resume:

{resume_text}

{f"Target Role: {target_role}" if target_role else ""}"""

    try:
        chat = LlmChat(
            api_key=API_KEY,
            session_id=f"resume-{uuid.uuid4()}",
            system_message=RESUME_ANALYSIS_PROMPT
        ).with_model("openai", MODEL_NAME)
        
        user_message = UserMessage(text=user_prompt)
        response_text = await chat.send_message(user_message)
        
        # Parse JSON from response
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0]
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0]
            
        return json.loads(response_text.strip())
        
    except Exception as e:
        print(f"Resume analysis error: {e}")
        raise

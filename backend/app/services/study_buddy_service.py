"""Personal AI Mentor service (renamed from Study Buddy) for learning assistance and interview preparation."""
from typing import List, Optional
import uuid
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from emergentintegrations.llm.chat import LlmChat, UserMessage
from app.core.config import settings

# Use Emergent LLM key if available
API_KEY = settings.EMERGENT_LLM_KEY or settings.OPENAI_API_KEY
MODEL_NAME = "gpt-4o"

# Personal AI Mentor System Prompt (world-class)
STUDY_BUDDY_SYSTEM_PROMPT = """You are PathWise Personal AI Mentor, the world's most effective career guidance AI. Your role is to:

1. **Explain concepts contextually** - Know the user's roadmap and explain how each topic connects to their goal
2. **Quiz on current roadmap step** - Test understanding with progressively harder questions
3. **Give strict, honest feedback** - No sugar-coating, no participation trophies
4. **Track repeated mistakes** - Notice patterns and call them out
5. **Recommend next actions** - Always end with what to do next
6. **Debug code** - Help identify and fix coding issues with clear explanations
7. **Review projects** - Provide constructive but direct feedback

You MUST always know:
- User's target role
- Current position in roadmap
- Weakest skills that need attention
- Interview readiness level

Be direct, professional, and focused on outcomes. Use examples and analogies, but keep responses efficient and actionable."""

# Interview Pressure Mode System Prompt
INTERVIEW_MODE_SYSTEM_PROMPT = """You are a strict, senior tech interviewer at a top company (think Google/Meta level). 

Your role:
1. **Ask probing technical questions** - Go deep, ask follow-ups
2. **Give harsh, honest feedback** - Real interviewers don't coddle
3. **Score responses 1-10** with specific reasons
4. **Simulate rejection** if answer is poor (e.g., "Unfortunately, we won't be moving forward with your application because...")
5. **Time pressure awareness** - Remind candidate when they're taking too long
6. **Follow-up questions** - Dig into weak spots

Interview topics:
- System Design
- Data Structures & Algorithms
- Behavioral (STAR method expected)
- Technical Problem Solving
- Code Review

BE STRICT. This is training for real interviews where rejection is the default outcome."""


async def chat_with_study_buddy(
    message: str,
    conversation_history: List[dict],
    user_context: Optional[dict] = None,
    additional_context: Optional[str] = None
) -> str:
    """Have a conversation with the Personal AI Mentor."""
    
    system_msg = STUDY_BUDDY_SYSTEM_PROMPT
    
    # Add additional context if provided (from frontend)
    if additional_context:
        system_msg += f"\n\n{additional_context}"
    
    # Add user context if available
    if user_context:
        system_msg += f"""

User Context:
- Current Learning: {user_context.get('current_skill', 'Not specified')}
- Skill Level: {user_context.get('skill_level', 'beginner')}
- Recent Topics: {', '.join(user_context.get('recent_topics', []))}"""
    
    try:
        chat = LlmChat(
            api_key=API_KEY,
            session_id=f"mentor-{uuid.uuid4()}",
            system_message=system_msg
        ).with_model("openai", MODEL_NAME)
        
        # Add conversation history as messages
        for msg in conversation_history[-20:]:
            chat.messages.append({"role": msg["role"], "content": msg["content"]})
        
        user_message = UserMessage(text=message)
        response = await chat.send_message(user_message)
        
        return response
        
    except Exception as e:
        print(f"Personal AI Mentor error: {e}")
        raise


async def chat_interview_mode(
    message: str,
    conversation_history: List[dict],
    user_context: Optional[str] = None
) -> str:
    """Interview Pressure Mode - strict interviewer simulation."""
    
    system_msg = INTERVIEW_MODE_SYSTEM_PROMPT
    
    # Add user context if provided
    if user_context:
        system_msg += f"\n\n{user_context}"
    
    try:
        chat = LlmChat(
            api_key=API_KEY,
            session_id=f"interview-{uuid.uuid4()}",
            system_message=system_msg
        ).with_model("openai", MODEL_NAME)
        
        # Add conversation history
        for msg in conversation_history[-10:]:
            chat.messages.append({"role": msg["role"], "content": msg["content"]})
        
        user_message = UserMessage(text=message)
        response = await chat.send_message(user_message)
        
        return response
        
    except Exception as e:
        print(f"Interview mode error: {e}")
        raise


async def explain_concept(concept: str, skill_level: str = "beginner") -> str:
    """Get a detailed explanation of a concept."""
    
    prompt = f"""Explain the concept of "{concept}" for a {skill_level} level learner.

Include:
1. A simple definition
2. Why it's important
3. A real-world analogy
4. A practical example
5. Common misconceptions

Keep it clear and engaging."""
    
    try:
        chat = LlmChat(
            api_key=API_KEY,
            session_id=f"explain-{uuid.uuid4()}",
            system_message=STUDY_BUDDY_SYSTEM_PROMPT
        ).with_model("openai", MODEL_NAME)
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        return response
        
    except Exception as e:
        print(f"Concept explanation error: {e}")
        raise


async def debug_code(code: str, error_message: str, language: str) -> dict:
    """Help debug code and identify issues."""
    
    prompt = f"""Help debug this {language} code:

```{language}
{code}
```

Error message:
{error_message}

Provide:
1. What's causing the error
2. How to fix it
3. Corrected code
4. Best practices to avoid this in the future"""
    
    try:
        chat = LlmChat(
            api_key=API_KEY,
            session_id=f"debug-{uuid.uuid4()}",
            system_message=STUDY_BUDDY_SYSTEM_PROMPT
        ).with_model("openai", MODEL_NAME)
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        return {
            "explanation": response,
            "language": language,
        }
        
    except Exception as e:
        print(f"Code debug error: {e}")
        raise


async def generate_quiz(topic: str, difficulty: str, num_questions: int = 5) -> dict:
    """Generate a quiz to test understanding."""
    
    prompt = f"""Create a {difficulty} level quiz about {topic} with {num_questions} questions.

Format as JSON:
{{
  "questions": [
    {{
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "correct_answer": 0,
      "explanation": "Why this is correct"
    }}
  ]
}}

Output ONLY valid JSON, nothing else."""
    
    try:
        chat = LlmChat(
            api_key=API_KEY,
            session_id=f"quiz-{uuid.uuid4()}",
            system_message="You are a quiz generator. Output valid JSON only."
        ).with_model("openai", MODEL_NAME)
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        import json
        # Parse JSON from response
        if "```json" in response:
            response = response.split("```json")[1].split("```")[0]
        elif "```" in response:
            response = response.split("```")[1].split("```")[0]
            
        return json.loads(response.strip())
        
    except Exception as e:
        print(f"Quiz generation error: {e}")
        raise


async def review_project(
    project_description: str,
    code_or_demo: str,
    criteria: List[str]
) -> dict:
    """Review a project and provide feedback."""
    
    criteria_text = "\n".join([f"- {c}" for c in criteria])
    
    prompt = f"""Review this project:

**Description:**
{project_description}

**Code/Demo:**
{code_or_demo}

**Review Criteria:**
{criteria_text}

Provide:
1. Overall assessment (score out of 10)
2. Strengths
3. Areas for improvement
4. Specific suggestions
5. Next steps

Format as JSON only."""
    
    try:
        chat = LlmChat(
            api_key=API_KEY,
            session_id=f"review-{uuid.uuid4()}",
            system_message=STUDY_BUDDY_SYSTEM_PROMPT
        ).with_model("openai", MODEL_NAME)
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        import json
        # Parse JSON from response
        if "```json" in response:
            response = response.split("```json")[1].split("```")[0]
        elif "```" in response:
            response = response.split("```")[1].split("```")[0]
            
        return json.loads(response.strip())
        
    except Exception as e:
        print(f"Project review error: {e}")
        raise


async def suggest_learning_path(
    current_skills: List[str],
    target_role: str,
    time_available: str
) -> dict:
    """Suggest a personalized learning path."""
    
    skills_text = ", ".join(current_skills)
    
    prompt = f"""Create a learning path for someone who:
- Currently knows: {skills_text}
- Wants to become: {target_role}
- Has: {time_available} available for learning

Provide a structured learning plan with:
1. Skills to learn (in order)
2. Estimated time for each
3. Recommended resources
4. Milestones to track progress

Format as JSON only."""
    
    try:
        chat = LlmChat(
            api_key=API_KEY,
            session_id=f"path-{uuid.uuid4()}",
            system_message=STUDY_BUDDY_SYSTEM_PROMPT
        ).with_model("openai", MODEL_NAME)
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        import json
        # Parse JSON from response
        if "```json" in response:
            response = response.split("```json")[1].split("```")[0]
        elif "```" in response:
            response = response.split("```")[1].split("```")[0]
            
        return json.loads(response.strip())
        
    except Exception as e:
        print(f"Learning path error: {e}")
        raise

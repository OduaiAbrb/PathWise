"""AI Study Buddy service for voice chat and learning assistance."""
from typing import List, Optional
from openai import AsyncOpenAI
from app.core.config import settings

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

STUDY_BUDDY_SYSTEM_PROMPT = """You are PathWise AI Study Buddy, a friendly and encouraging learning companion. Your role is to:

1. **Explain concepts** - Break down complex topics into simple, digestible explanations
2. **Answer questions** - Provide clear, accurate answers to learning questions
3. **Provide encouragement** - Motivate and support learners through their journey
4. **Suggest resources** - Recommend learning materials when appropriate
5. **Quiz understanding** - Ask questions to test comprehension
6. **Debug code** - Help identify and fix coding issues
7. **Review work** - Provide constructive feedback on projects

Be conversational, patient, and adapt your explanations to the user's level. Use analogies and examples to make concepts clear."""


async def chat_with_study_buddy(
    message: str,
    conversation_history: List[dict],
    user_context: Optional[dict] = None
) -> str:
    """Have a conversation with the AI Study Buddy."""
    
    messages = [{"role": "system", "content": STUDY_BUDDY_SYSTEM_PROMPT}]
    
    # Add user context if available
    if user_context:
        context_msg = f"""User Context:
- Current Learning: {user_context.get('current_skill', 'Not specified')}
- Skill Level: {user_context.get('skill_level', 'beginner')}
- Recent Topics: {', '.join(user_context.get('recent_topics', []))}"""
        messages.append({"role": "system", "content": context_msg})
    
    # Add conversation history
    for msg in conversation_history[-20:]:  # Last 20 messages
        messages.append({"role": msg["role"], "content": msg["content"]})
    
    # Add current message
    messages.append({"role": "user", "content": message})
    
    try:
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=messages,
            temperature=0.7,
            max_tokens=1500,
        )
        
        return response.choices[0].message.content
        
    except Exception as e:
        print(f"Study Buddy error: {e}")
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
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": STUDY_BUDDY_SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000,
        )
        
        return response.choices[0].message.content
        
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
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": STUDY_BUDDY_SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,
            max_tokens=1500,
        )
        
        content = response.choices[0].message.content
        
        return {
            "explanation": content,
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
}}"""
    
    try:
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are a quiz generator. Output valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=2000,
            response_format={"type": "json_object"}
        )
        
        import json
        return json.loads(response.choices[0].message.content)
        
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

Format as JSON."""
    
    try:
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": STUDY_BUDDY_SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            temperature=0.6,
            max_tokens=2000,
            response_format={"type": "json_object"}
        )
        
        import json
        return json.loads(response.choices[0].message.content)
        
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

Format as JSON."""
    
    try:
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": STUDY_BUDDY_SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=2500,
            response_format={"type": "json_object"}
        )
        
        import json
        return json.loads(response.choices[0].message.content)
        
    except Exception as e:
        print(f"Learning path error: {e}")
        raise

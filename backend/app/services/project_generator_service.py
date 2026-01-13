"""AI Project Generator service."""
from typing import List, Optional
from openai import AsyncOpenAI
import uuid
import random

from app.core.config import settings

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

# Project categories for variety
PROJECT_CATEGORIES = [
    "CLI Tool", "Web App", "API Service", "Data Pipeline", "Automation Script",
    "Browser Extension", "Mobile App", "Desktop App", "Game", "Library/Package",
    "Testing Framework", "DevOps Tool", "Monitoring Dashboard", "Chat Bot",
    "E-commerce", "Social Platform", "Content Management", "Analytics Tool"
]

# Unique themes for variety
PROJECT_THEMES = [
    "fitness tracking", "recipe management", "budget tracking", "habit tracker",
    "inventory system", "booking system", "quiz platform", "job board",
    "social media scheduler", "note-taking app", "weather dashboard",
    "portfolio builder", "event planner", "music player", "podcast manager",
    "file organizer", "password manager", "URL shortener", "blog platform",
    "email newsletter", "survey creator", "feedback collector", "time tracker"
]


async def generate_project_idea(
    skills: List[str],
    difficulty: str,
    interests: Optional[List[str]] = None,
    time_available: Optional[str] = None,
    custom_prompt: Optional[str] = None,
    exclude_titles: Optional[List[str]] = None
) -> dict:
    """Generate a custom project idea based on skills and interests."""
    
    skills_text = ", ".join(skills)
    interests_text = ", ".join(interests) if interests else "general"
    
    # Add randomness for variety
    random_category = random.choice(PROJECT_CATEGORIES)
    random_theme = random.choice(PROJECT_THEMES)
    random_seed = random.randint(1000, 9999)
    
    # Build exclusion list to avoid repetition
    exclusion_text = ""
    if exclude_titles:
        exclusion_text = f"\n\n⚠️ DO NOT generate these projects (already exists): {', '.join(exclude_titles)}"
    
    # Custom prompt support
    custom_guidance = ""
    if custom_prompt:
        custom_guidance = f"\n\n🎯 USER'S SPECIFIC REQUEST: {custom_prompt}\nBuild the project around this request."
    
    prompt = f"""Create a UNIQUE and CREATIVE project idea (seed: {random_seed}).

**Skills to practice:** {skills_text}
**Difficulty level:** {difficulty}
**Interests:** {interests_text}
**Suggested category:** {random_category}
**Theme inspiration:** {random_theme}
{f"**Time available:** {time_available}" if time_available else ""}
{custom_guidance}
{exclusion_text}

IMPORTANT REQUIREMENTS:
1. Be CREATIVE - don't use generic names like "Task Manager" or "Todo App"
2. Give it a memorable, branded name (e.g., "TaskForge", "NoteNinja", "BudgetBuddy")
3. Make it something the user would be PROUD to show in an interview
4. Include SPECIFIC features that demonstrate the skills listed
5. Provide CLEAR step-by-step instructions that a beginner can follow

Generate a detailed project in JSON format:
{{
  "title": "Creative branded project name",
  "tagline": "One-line catchy description",
  "description": "Detailed 2-3 sentence description of what it does and why it's useful",
  "difficulty": "{difficulty}",
  "estimated_hours": 0,
  "tech_stack": ["tech1", "tech2"],
  "learning_objectives": ["What you'll learn 1", "What you'll learn 2"],
  "features": [
    {{"name": "Feature name", "description": "What it does", "priority": "must-have|nice-to-have"}}
  ],
  "requirements": [
    {{"id": "req-1", "description": "Clear requirement", "type": "functional|technical"}}
  ],
  "getting_started": {{
    "prerequisites": ["What you need installed"],
    "setup_commands": ["npm init -y", "npm install express"],
    "first_steps": ["Step 1: Create project folder", "Step 2: Initialize package.json"]
  }},
  "implementation_steps": [
    {{
      "step": 1,
      "title": "Step title",
      "description": "Detailed what to do",
      "estimated_hours": 0,
      "skills_used": [],
      "code_hint": "Brief code example or file to create",
      "success_criteria": "How to know you completed this step"
    }}
  ],
  "test_cases": [
    {{"id": "test-1", "description": "What to test", "expected_result": "Expected outcome"}}
  ],
  "bonus_challenges": ["challenge1", "challenge2"],
  "resume_bullet": "Impressive resume bullet point for this project",
  "interview_talking_points": ["Point 1", "Point 2", "Point 3"],
  "deployment_guide": {{
    "recommended_platform": "Vercel|Railway|Heroku|etc",
    "deployment_steps": ["Step 1", "Step 2"],
    "demo_tips": "How to demo this project effectively"
  }}
}}"""
    
    try:
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are a creative project idea generator. Output valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.8,
            max_tokens=3000,
            response_format={"type": "json_object"}
        )
        
        import json
        project = json.loads(response.choices[0].message.content)
        
        # Add unique IDs
        project["id"] = str(uuid.uuid4())
        
        return project
        
    except Exception as e:
        print(f"Project generation error: {e}")
        raise


async def generate_implementation_guide(project_description: str, tech_stack: List[str]) -> dict:
    """Generate detailed implementation guide for a project."""
    
    tech_text = ", ".join(tech_stack)
    
    prompt = f"""Create a detailed implementation guide for this project:

**Project:** {project_description}
**Tech Stack:** {tech_text}

Provide a comprehensive guide in JSON:
{{
  "setup_instructions": [
    {{"step": 1, "title": "", "commands": [], "description": ""}}
  ],
  "file_structure": {{
    "directories": ["dir1", "dir2"],
    "key_files": [{{"path": "", "purpose": ""}}]
  }},
  "implementation_phases": [
    {{
      "phase": 1,
      "name": "Phase name",
      "description": "What to build",
      "tasks": [
        {{"task": "", "code_snippet": "", "explanation": ""}}
      ],
      "testing": "How to test this phase"
    }}
  ],
  "code_examples": [
    {{"file": "", "language": "", "code": "", "explanation": ""}}
  ],
  "common_pitfalls": [
    {{"issue": "", "solution": ""}}
  ],
  "deployment_guide": {{
    "platform": "",
    "steps": [],
    "environment_variables": []
  }}
}}"""
    
    try:
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are a senior software engineer creating implementation guides. Output valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.6,
            max_tokens=4000,
            response_format={"type": "json_object"}
        )
        
        import json
        return json.loads(response.choices[0].message.content)
        
    except Exception as e:
        print(f"Implementation guide error: {e}")
        raise


async def generate_test_cases(project_description: str, features: List[dict]) -> List[dict]:
    """Generate comprehensive test cases for a project."""
    
    features_text = "\n".join([f"- {f['name']}: {f['description']}" for f in features])
    
    prompt = f"""Generate comprehensive test cases for this project:

**Project:** {project_description}

**Features:**
{features_text}

Create test cases in JSON:
{{
  "unit_tests": [
    {{"test_name": "", "function": "", "input": "", "expected_output": "", "description": ""}}
  ],
  "integration_tests": [
    {{"test_name": "", "scenario": "", "steps": [], "expected_result": ""}}
  ],
  "e2e_tests": [
    {{"test_name": "", "user_story": "", "steps": [], "expected_result": ""}}
  ],
  "edge_cases": [
    {{"scenario": "", "test": "", "expected_behavior": ""}}
  ]
}}"""
    
    try:
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are a QA engineer creating test cases. Output valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,
            max_tokens=3000,
            response_format={"type": "json_object"}
        )
        
        import json
        return json.loads(response.choices[0].message.content)
        
    except Exception as e:
        print(f"Test case generation error: {e}")
        raise


async def review_project_code(code: str, project_requirements: List[str]) -> dict:
    """Review project code against requirements."""
    
    requirements_text = "\n".join([f"- {r}" for r in project_requirements])
    
    prompt = f"""Review this project code against requirements:

**Requirements:**
{requirements_text}

**Code:**
{code}

Provide detailed review in JSON:
{{
  "overall_score": 0-100,
  "requirements_met": [
    {{"requirement": "", "met": true|false, "notes": ""}}
  ],
  "code_quality": {{
    "score": 0-100,
    "strengths": [],
    "issues": [],
    "suggestions": []
  }},
  "best_practices": {{
    "followed": [],
    "missing": []
  }},
  "security_concerns": [],
  "performance_notes": [],
  "next_steps": []
}}"""
    
    try:
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are a senior code reviewer. Output valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,
            max_tokens=3000,
            response_format={"type": "json_object"}
        )
        
        import json
        return json.loads(response.choices[0].message.content)
        
    except Exception as e:
        print(f"Code review error: {e}")
        raise


async def suggest_project_improvements(
    current_project: dict,
    user_feedback: Optional[str] = None
) -> dict:
    """Suggest improvements and next features for a project."""
    
    prompt = f"""Suggest improvements for this project:

**Current Project:**
{current_project}

{f"**User Feedback:** {user_feedback}" if user_feedback else ""}

Provide suggestions in JSON:
{{
  "quick_wins": [
    {{"improvement": "", "impact": "high|medium|low", "effort": "low|medium|high", "description": ""}}
  ],
  "feature_additions": [
    {{"feature": "", "value": "", "complexity": "", "learning_opportunity": ""}}
  ],
  "refactoring_opportunities": [
    {{"area": "", "current_issue": "", "proposed_solution": "", "benefits": []}}
  ],
  "scalability_improvements": [],
  "ux_enhancements": [],
  "learning_extensions": [
    {{"skill": "", "how_to_apply": "", "resources": []}}
  ]
}}"""
    
    try:
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are a product manager suggesting improvements. Output valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=2500,
            response_format={"type": "json_object"}
        )
        
        import json
        return json.loads(response.choices[0].message.content)
        
    except Exception as e:
        print(f"Improvement suggestion error: {e}")
        raise

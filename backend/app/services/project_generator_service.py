"""AI Project Generator service."""
from typing import List, Optional
from openai import AsyncOpenAI
import uuid

from app.core.config import settings

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


async def generate_project_idea(
    skills: List[str],
    difficulty: str,
    interests: Optional[List[str]] = None,
    time_available: Optional[str] = None
) -> dict:
    """Generate a custom project idea based on skills and interests."""
    
    skills_text = ", ".join(skills)
    interests_text = ", ".join(interests) if interests else "general"
    
    prompt = f"""Create a unique project idea for someone learning:

**Skills to practice:** {skills_text}
**Difficulty level:** {difficulty}
**Interests:** {interests_text}
{f"**Time available:** {time_available}" if time_available else ""}

Generate a detailed project in JSON format:
{{
  "title": "Project title",
  "description": "Detailed description",
  "difficulty": "{difficulty}",
  "estimated_hours": 0,
  "tech_stack": ["tech1", "tech2"],
  "learning_objectives": ["objective1", "objective2"],
  "features": [
    {{"name": "Feature name", "description": "What it does", "priority": "must-have|nice-to-have"}}
  ],
  "requirements": [
    {{"id": "req-1", "description": "Requirement description", "type": "functional|technical"}}
  ],
  "implementation_steps": [
    {{"step": 1, "title": "Step title", "description": "What to do", "estimated_hours": 0, "skills_used": []}}
  ],
  "test_cases": [
    {{"id": "test-1", "description": "What to test", "expected_result": "Expected outcome"}}
  ],
  "bonus_challenges": ["challenge1", "challenge2"],
  "real_world_applications": ["application1", "application2"]
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

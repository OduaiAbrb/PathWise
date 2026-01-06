"""Resume parsing and skill gap analysis service."""
from typing import List, Optional
import PyPDF2
import io
from openai import AsyncOpenAI
from app.core.config import settings

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


async def parse_resume_pdf(file_content: bytes) -> str:
    """Extract text from PDF resume."""
    try:
        pdf_file = io.BytesIO(file_content)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        
        return text.strip()
    except Exception as e:
        print(f"PDF parsing error: {e}")
        raise


async def analyze_resume(resume_text: str, target_role: Optional[str] = None) -> dict:
    """Analyze resume and extract skills, experience, etc."""
    
    prompt = f"""Analyze this resume and extract:

Resume:
{resume_text}

{f"Target Role: {target_role}" if target_role else ""}

Provide a detailed analysis in JSON format:
{{
  "skills": [
    {{"name": "skill name", "proficiency": "beginner|intermediate|advanced", "years": 0}}
  ],
  "experience_years": 0,
  "education": [
    {{"degree": "", "field": "", "institution": "", "year": 0}}
  ],
  "work_history": [
    {{"title": "", "company": "", "duration": "", "responsibilities": []}}
  ],
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["area 1", "area 2"],
  "summary": "Brief professional summary",
  "match_score": 0-100
}}"""
    
    try:
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are an expert resume analyzer. Output valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,
            max_tokens=3000,
            response_format={"type": "json_object"}
        )
        
        import json
        return json.loads(response.choices[0].message.content)
        
    except Exception as e:
        print(f"Resume analysis error: {e}")
        raise


async def calculate_skill_gap(
    current_skills: List[dict],
    job_description: str
) -> dict:
    """Calculate skill gap between current skills and job requirements."""
    
    skills_text = "\n".join([f"- {s['name']} ({s.get('proficiency', 'unknown')})" for s in current_skills])
    
    prompt = f"""Analyze the skill gap for this job:

**Current Skills:**
{skills_text}

**Job Description:**
{job_description}

Provide analysis in JSON:
{{
  "required_skills": [
    {{"skill": "", "importance": "critical|important|nice-to-have", "has_skill": true|false, "proficiency_gap": ""}}
  ],
  "missing_skills": ["skill1", "skill2"],
  "matching_skills": ["skill1", "skill2"],
  "overall_match_percentage": 0-100,
  "learning_priority": [
    {{"skill": "", "reason": "", "estimated_weeks": 0}}
  ],
  "recommendations": ["recommendation 1", "recommendation 2"]
}}"""
    
    try:
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are a career advisor analyzing skill gaps. Output valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,
            max_tokens=2500,
            response_format={"type": "json_object"}
        )
        
        import json
        return json.loads(response.choices[0].message.content)
        
    except Exception as e:
        print(f"Skill gap analysis error: {e}")
        raise


async def optimize_resume_for_ats(resume_text: str, job_description: str) -> dict:
    """Optimize resume for Applicant Tracking Systems."""
    
    prompt = f"""Optimize this resume for ATS systems for this job:

**Resume:**
{resume_text}

**Job Description:**
{job_description}

Provide optimization suggestions in JSON:
{{
  "ats_score": 0-100,
  "missing_keywords": ["keyword1", "keyword2"],
  "keyword_suggestions": [
    {{"keyword": "", "where_to_add": "", "example": ""}}
  ],
  "formatting_issues": ["issue1", "issue2"],
  "section_improvements": [
    {{"section": "", "current": "", "suggested": "", "reason": ""}}
  ],
  "optimized_summary": "ATS-optimized professional summary",
  "action_items": ["action 1", "action 2"]
}}"""
    
    try:
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are an ATS optimization expert. Output valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,
            max_tokens=3000,
            response_format={"type": "json_object"}
        )
        
        import json
        return json.loads(response.choices[0].message.content)
        
    except Exception as e:
        print(f"ATS optimization error: {e}")
        raise


async def generate_cover_letter(
    resume_text: str,
    job_description: str,
    company_name: str,
    job_title: str
) -> str:
    """Generate a customized cover letter."""
    
    prompt = f"""Write a compelling cover letter for:

**Job:** {job_title} at {company_name}
**Job Description:**
{job_description}

**Candidate's Resume:**
{resume_text}

Write a professional, engaging cover letter that:
1. Shows enthusiasm for the role
2. Highlights relevant experience
3. Demonstrates cultural fit
4. Includes specific examples
5. Has a strong call to action

Keep it to 3-4 paragraphs, professional but personable."""
    
    try:
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are an expert cover letter writer."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1500,
        )
        
        return response.choices[0].message.content
        
    except Exception as e:
        print(f"Cover letter generation error: {e}")
        raise

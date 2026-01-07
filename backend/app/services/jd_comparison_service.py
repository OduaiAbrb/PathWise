"""
Job Description Comparison Service
Allows users to save multiple JDs and compare skill requirements
"""

from typing import Dict, List
from collections import Counter
import json

from openai import AsyncOpenAI
from app.core.config import settings


class JDComparisonService:
    """Service for comparing job descriptions"""

    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    async def extract_skills_from_jd(self, job_description: str) -> Dict:
        """Extract skills and requirements from a job description"""
        prompt = f"""Analyze this job description and extract structured information.

Job Description:
{job_description}

Return a JSON object with:
{{
    "job_title": "extracted job title",
    "company": "company name if mentioned, else null",
    "skills": {{
        "required": ["list of required technical skills"],
        "preferred": ["list of nice-to-have technical skills"],
        "soft_skills": ["list of soft skills mentioned"]
    }},
    "experience_level": "entry/mid/senior/lead",
    "industry": "detected industry"
}}

Be specific with skill names. Return ONLY valid JSON."""

        try:
            response = await self.client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=1000
            )
            
            content = response.choices[0].message.content.strip()
            if content.startswith("```"):
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]
            
            return json.loads(content)
        except Exception as e:
            print(f"Error extracting skills: {e}")
            return {
                "job_title": "Unknown",
                "company": None,
                "skills": {"required": [], "preferred": [], "soft_skills": []},
                "experience_level": "mid",
                "industry": "technology"
            }

    async def compare_job_descriptions(self, job_descriptions: List[Dict]) -> Dict:
        """Compare multiple job descriptions and find patterns"""
        if not job_descriptions:
            return {
                "common_skills": [],
                "unique_skills": {},
                "recommendations": {"must_learn": [], "should_learn": [], "nice_to_have": []},
                "industry_trends": []
            }

        all_required = []
        all_preferred = []
        
        for jd in job_descriptions:
            skills = jd.get("skills", {})
            all_required.extend(skills.get("required", []))
            all_preferred.extend(skills.get("preferred", []))

        required_counts = Counter(all_required)
        preferred_counts = Counter(all_preferred)
        total_jds = len(job_descriptions)

        common_skills = []
        for skill, count in required_counts.most_common():
            frequency = int((count / total_jds) * 100)
            common_skills.append({
                "skill": skill,
                "frequency": frequency,
                "count": count,
                "type": "required"
            })

        for skill, count in preferred_counts.most_common():
            if skill not in required_counts:
                frequency = int((count / total_jds) * 100)
                common_skills.append({
                    "skill": skill,
                    "frequency": frequency,
                    "count": count,
                    "type": "preferred"
                })

        common_skills.sort(key=lambda x: x["frequency"], reverse=True)

        must_learn = [s["skill"] for s in common_skills if s["frequency"] >= 60 and s["type"] == "required"][:5]
        should_learn = [s["skill"] for s in common_skills if 40 <= s["frequency"] < 60][:5]
        nice_to_have = [s["skill"] for s in common_skills if s["frequency"] < 40 and s["type"] == "preferred"][:5]

        return {
            "common_skills": common_skills[:15],
            "recommendations": {
                "must_learn": must_learn,
                "should_learn": should_learn,
                "nice_to_have": nice_to_have
            },
            "total_jobs_analyzed": total_jds
        }


jd_comparison_service = JDComparisonService()

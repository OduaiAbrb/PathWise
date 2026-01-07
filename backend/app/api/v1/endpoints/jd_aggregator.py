from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict
from collections import Counter
import re
from app.core.security import get_current_user_id

router = APIRouter()


class JDAnalysisRequest(BaseModel):
    job_descriptions: List[str]


class SkillFrequency(BaseModel):
    skill: str
    frequency: int
    percentage: float
    category: str


class JDAnalysisResponse(BaseModel):
    total_jds: int
    common_skills: List[SkillFrequency]
    rare_high_value_skills: List[SkillFrequency]
    universal_roadmap_suggestion: str
    industry_insights: Dict[str, List[str]]
    red_flags: List[str]
    salary_insights: List[Dict[str, str]]


def extract_skills_from_jd(jd_text: str) -> List[str]:
    """Extract technical skills from job description."""
    
    # Common technical skills database
    skill_patterns = {
        # Programming Languages
        "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Go", "Rust", "Ruby", "PHP",
        "Swift", "Kotlin", "Scala", "R", "MATLAB", "SQL",
        
        # Frontend
        "React", "Vue", "Angular", "Next.js", "Nuxt", "Svelte", "HTML", "CSS", "Tailwind",
        "Bootstrap", "Material-UI", "Redux", "MobX", "jQuery",
        
        # Backend
        "Node.js", "Express", "FastAPI", "Django", "Flask", "Spring Boot", "ASP.NET",
        "Ruby on Rails", "Laravel", "NestJS",
        
        # Databases
        "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "DynamoDB",
        "Cassandra", "Oracle", "SQL Server", "SQLite",
        
        # Cloud & DevOps
        "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Jenkins", "GitLab CI", "GitHub Actions",
        "Terraform", "Ansible", "CircleCI", "Travis CI",
        
        # Data & ML
        "TensorFlow", "PyTorch", "Scikit-learn", "Pandas", "NumPy", "Spark", "Hadoop",
        "Kafka", "Airflow", "MLflow",
        
        # Tools & Others
        "Git", "Linux", "REST API", "GraphQL", "gRPC", "WebSocket", "OAuth", "JWT",
        "Microservices", "CI/CD", "Agile", "Scrum", "TDD", "Unit Testing",
    }
    
    found_skills = []
    jd_lower = jd_text.lower()
    
    for skill in skill_patterns:
        # Case-insensitive search with word boundaries
        pattern = r'\b' + re.escape(skill.lower()) + r'\b'
        if re.search(pattern, jd_lower):
            found_skills.append(skill)
    
    return found_skills


def categorize_skill(skill: str) -> str:
    """Categorize a skill into a domain."""
    
    languages = {"Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Go", "Rust", "Ruby", "PHP", "Swift", "Kotlin", "Scala", "R", "SQL"}
    frontend = {"React", "Vue", "Angular", "Next.js", "Nuxt", "Svelte", "HTML", "CSS", "Tailwind", "Bootstrap", "Redux"}
    backend = {"Node.js", "Express", "FastAPI", "Django", "Flask", "Spring Boot", "ASP.NET", "Ruby on Rails", "Laravel"}
    databases = {"PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "DynamoDB", "Cassandra", "Oracle"}
    cloud_devops = {"AWS", "Azure", "GCP", "Docker", "Kubernetes", "Jenkins", "Terraform", "Ansible", "CI/CD"}
    data_ml = {"TensorFlow", "PyTorch", "Scikit-learn", "Pandas", "NumPy", "Spark", "Hadoop", "Kafka"}
    
    if skill in languages:
        return "Programming Languages"
    elif skill in frontend:
        return "Frontend"
    elif skill in backend:
        return "Backend"
    elif skill in databases:
        return "Databases"
    elif skill in cloud_devops:
        return "Cloud & DevOps"
    elif skill in data_ml:
        return "Data & ML"
    else:
        return "Tools & Practices"


def detect_red_flags(jd_text: str) -> List[str]:
    """Detect red flags in job descriptions."""
    
    red_flags = []
    jd_lower = jd_text.lower()
    
    # Unrealistic expectations
    if re.search(r'\b(10\+|15\+|20\+)\s+years?\s+experience', jd_lower):
        red_flags.append("⚠️ Unrealistic years of experience requirement")
    
    # Too many roles combined
    role_keywords = ["frontend", "backend", "devops", "data scientist", "ml engineer", "designer", "product manager"]
    role_count = sum(1 for role in role_keywords if role in jd_lower)
    if role_count >= 3:
        red_flags.append("🚩 This role combines 3+ different jobs. Be cautious.")
    
    # Buzzword stuffing
    buzzwords = ["rockstar", "ninja", "guru", "wizard", "unicorn", "10x"]
    if any(word in jd_lower for word in buzzwords):
        red_flags.append("⚠️ Excessive buzzword usage detected")
    
    # Unpaid or low compensation signals
    if re.search(r'\b(unpaid|volunteer|equity only|no salary)\b', jd_lower):
        red_flags.append("🚩 Compensation concerns detected")
    
    # Excessive skill requirements
    skill_count = len(extract_skills_from_jd(jd_text))
    if skill_count > 20:
        red_flags.append(f"⚠️ {skill_count} skills required - may be unrealistic")
    
    return red_flags


@router.post("/analyze", response_model=JDAnalysisResponse)
async def analyze_job_descriptions(
    request: JDAnalysisRequest,
    user_id: str = Depends(get_current_user_id)
):
    """
    Analyze multiple job descriptions to find common skills and patterns.
    """
    
    if len(request.job_descriptions) < 2:
        raise HTTPException(status_code=400, detail="Please provide at least 2 job descriptions")
    
    if len(request.job_descriptions) > 20:
        raise HTTPException(status_code=400, detail="Maximum 20 job descriptions allowed")
    
    # Extract skills from all JDs
    all_skills = []
    all_red_flags = []
    
    for jd in request.job_descriptions:
        skills = extract_skills_from_jd(jd)
        all_skills.extend(skills)
        all_red_flags.extend(detect_red_flags(jd))
    
    # Count skill frequencies
    skill_counter = Counter(all_skills)
    total_jds = len(request.job_descriptions)
    
    # Calculate percentages
    skill_frequencies = []
    for skill, count in skill_counter.items():
        percentage = (count / total_jds) * 100
        skill_frequencies.append(SkillFrequency(
            skill=skill,
            frequency=count,
            percentage=round(percentage, 1),
            category=categorize_skill(skill)
        ))
    
    # Sort by frequency
    skill_frequencies.sort(key=lambda x: x.frequency, reverse=True)
    
    # Common skills (appear in 60%+ of JDs)
    common_skills = [s for s in skill_frequencies if s.percentage >= 60]
    
    # Rare but high-value skills (appear in 20-40% of JDs)
    rare_high_value = [s for s in skill_frequencies if 20 <= s.percentage < 60]
    
    # Generate universal roadmap suggestion
    top_skills = [s.skill for s in common_skills[:8]]
    roadmap_suggestion = f"Focus on mastering: {', '.join(top_skills[:5])}. " \
                        f"These skills appear in {common_skills[0].percentage:.0f}%+ of the roles you're targeting."
    
    # Industry insights
    industry_insights = {
        "Must-Have Skills": [s.skill for s in common_skills[:5]],
        "Competitive Edge Skills": [s.skill for s in rare_high_value[:5]],
        "Skill Categories": list(set(s.category for s in skill_frequencies[:10]))
    }
    
    # Salary insights (heuristic data)
    salary_insights = []
    high_value_skills = {"Kubernetes", "AWS", "React", "Python", "TypeScript", "Go", "Rust"}
    for skill in top_skills[:5]:
        if skill in high_value_skills:
            salary_insights.append({
                "skill": skill,
                "impact": f"+15-25% salary increase in most markets"
            })
    
    return JDAnalysisResponse(
        total_jds=total_jds,
        common_skills=common_skills,
        rare_high_value_skills=rare_high_value[:10],
        universal_roadmap_suggestion=roadmap_suggestion,
        industry_insights=industry_insights,
        red_flags=list(set(all_red_flags))[:10],
        salary_insights=salary_insights
    )

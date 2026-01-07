"""Career discovery API endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import List, Optional
import os

from app.db.database import get_db
from app.core.security import get_current_user_id

router = APIRouter()

class CareerDiscoverRequest(BaseModel):
    interests: List[str]
    work_style: str
    experience_level: str

class CareerPath(BaseModel):
    title: str
    description: str
    avgSalary: str
    demandLevel: str
    skills: List[str]
    timeToJob: str

class CareerDiscoverResponse(BaseModel):
    paths: List[CareerPath]

# Career path database based on interests
CAREER_PATHS = {
    "problem_solving": [
        {
            "title": "Software Engineer",
            "description": "Design and build software systems that solve complex problems. High demand across all industries.",
            "avgSalary": "$100,000 - $160,000",
            "demandLevel": "Very High",
            "skills": ["Python", "JavaScript", "System Design", "Data Structures", "Algorithms"],
            "timeToJob": "4-8 months",
        },
        {
            "title": "Solutions Architect",
            "description": "Design technical solutions for business problems. Bridge between business and engineering.",
            "avgSalary": "$130,000 - $200,000",
            "demandLevel": "High",
            "skills": ["Cloud Architecture", "System Design", "Communication", "AWS/Azure/GCP"],
            "timeToJob": "12-18 months",
        },
    ],
    "building": [
        {
            "title": "Full Stack Developer",
            "description": "Build complete web applications from frontend to backend. Versatile and in-demand.",
            "avgSalary": "$95,000 - $150,000",
            "demandLevel": "Very High",
            "skills": ["JavaScript", "React", "Node.js", "PostgreSQL", "REST APIs"],
            "timeToJob": "4-6 months",
        },
        {
            "title": "Mobile Developer",
            "description": "Create apps for iOS and Android that millions of people use daily.",
            "avgSalary": "$90,000 - $145,000",
            "demandLevel": "High",
            "skills": ["React Native", "Swift", "Kotlin", "Mobile UI/UX"],
            "timeToJob": "4-6 months",
        },
    ],
    "data": [
        {
            "title": "Data Engineer",
            "description": "Design and build data pipelines that power analytics and machine learning.",
            "avgSalary": "$110,000 - $160,000",
            "demandLevel": "Very High",
            "skills": ["Python", "SQL", "Apache Spark", "AWS/GCP", "ETL Pipelines"],
            "timeToJob": "5-8 months",
        },
        {
            "title": "Data Scientist",
            "description": "Extract insights from data using statistics and machine learning.",
            "avgSalary": "$105,000 - $155,000",
            "demandLevel": "High",
            "skills": ["Python", "Machine Learning", "Statistics", "SQL", "Visualization"],
            "timeToJob": "6-10 months",
        },
    ],
    "design": [
        {
            "title": "Frontend Developer",
            "description": "Create beautiful, responsive user interfaces that delight users.",
            "avgSalary": "$85,000 - $140,000",
            "demandLevel": "High",
            "skills": ["React", "TypeScript", "CSS/Tailwind", "Figma", "Accessibility"],
            "timeToJob": "3-5 months",
        },
        {
            "title": "UX Engineer",
            "description": "Bridge design and development. Build design systems and prototypes.",
            "avgSalary": "$95,000 - $150,000",
            "demandLevel": "High",
            "skills": ["React", "Design Systems", "Figma", "Animation", "User Research"],
            "timeToJob": "4-6 months",
        },
    ],
    "security": [
        {
            "title": "Security Engineer",
            "description": "Protect systems and data from threats. Critical role in every organization.",
            "avgSalary": "$120,000 - $180,000",
            "demandLevel": "Very High",
            "skills": ["Network Security", "Penetration Testing", "SIEM", "Cloud Security", "Python"],
            "timeToJob": "6-9 months",
        },
        {
            "title": "DevSecOps Engineer",
            "description": "Integrate security into the development lifecycle. Automate security testing.",
            "avgSalary": "$115,000 - $170,000",
            "demandLevel": "Very High",
            "skills": ["CI/CD", "Container Security", "SAST/DAST", "Kubernetes", "Terraform"],
            "timeToJob": "5-8 months",
        },
    ],
    "cloud": [
        {
            "title": "DevOps Engineer",
            "description": "Automate infrastructure and ensure reliable, scalable deployments.",
            "avgSalary": "$100,000 - $155,000",
            "demandLevel": "High",
            "skills": ["Docker", "Kubernetes", "Terraform", "CI/CD", "AWS"],
            "timeToJob": "4-7 months",
        },
        {
            "title": "Cloud Architect",
            "description": "Design and implement cloud infrastructure for enterprise applications.",
            "avgSalary": "$140,000 - $200,000",
            "demandLevel": "Very High",
            "skills": ["AWS/Azure/GCP", "Networking", "Security", "Cost Optimization"],
            "timeToJob": "8-12 months",
        },
    ],
    "analytics": [
        {
            "title": "Business Intelligence Developer",
            "description": "Build dashboards and reports that drive business decisions.",
            "avgSalary": "$85,000 - $130,000",
            "demandLevel": "High",
            "skills": ["SQL", "Tableau/PowerBI", "Data Modeling", "Python", "ETL"],
            "timeToJob": "3-5 months",
        },
        {
            "title": "Analytics Engineer",
            "description": "Transform raw data into clean, reliable datasets for analysis.",
            "avgSalary": "$100,000 - $150,000",
            "demandLevel": "Very High",
            "skills": ["SQL", "dbt", "Python", "Data Modeling", "Git"],
            "timeToJob": "4-6 months",
        },
    ],
    "mobile": [
        {
            "title": "iOS Developer",
            "description": "Build native iOS applications with Swift and SwiftUI.",
            "avgSalary": "$95,000 - $150,000",
            "demandLevel": "High",
            "skills": ["Swift", "SwiftUI", "UIKit", "Core Data", "App Store"],
            "timeToJob": "4-6 months",
        },
        {
            "title": "Android Developer",
            "description": "Create Android apps with Kotlin and Jetpack Compose.",
            "avgSalary": "$90,000 - $145,000",
            "demandLevel": "High",
            "skills": ["Kotlin", "Jetpack Compose", "Android SDK", "Room", "Play Store"],
            "timeToJob": "4-6 months",
        },
    ],
    "gaming": [
        {
            "title": "Game Developer",
            "description": "Create interactive games and experiences using game engines.",
            "avgSalary": "$75,000 - $130,000",
            "demandLevel": "Moderate",
            "skills": ["Unity", "C#", "Game Design", "3D Math", "Physics"],
            "timeToJob": "6-10 months",
        },
    ],
    "enterprise": [
        {
            "title": "Backend Developer",
            "description": "Build robust APIs and server-side logic that powers applications.",
            "avgSalary": "$90,000 - $145,000",
            "demandLevel": "High",
            "skills": ["Python/Java", "REST APIs", "Databases", "Docker", "Testing"],
            "timeToJob": "4-6 months",
        },
        {
            "title": "Platform Engineer",
            "description": "Build internal developer platforms that improve team productivity.",
            "avgSalary": "$120,000 - $175,000",
            "demandLevel": "Very High",
            "skills": ["Kubernetes", "Terraform", "Go/Python", "CI/CD", "Observability"],
            "timeToJob": "6-9 months",
        },
    ],
    "health": [
        {
            "title": "Healthcare Software Engineer",
            "description": "Build software that improves patient care and healthcare operations.",
            "avgSalary": "$100,000 - $160,000",
            "demandLevel": "High",
            "skills": ["Python/Java", "HIPAA", "HL7/FHIR", "Databases", "Security"],
            "timeToJob": "5-8 months",
        },
    ],
}

def get_career_paths_for_interests(interests: List[str], experience_level: str) -> List[CareerPath]:
    """Get career paths based on user interests."""
    paths_dict = {}
    
    for interest in interests:
        if interest in CAREER_PATHS:
            for path in CAREER_PATHS[interest]:
                if path["title"] not in paths_dict:
                    paths_dict[path["title"]] = path
    
    # If no matches, provide default paths
    if not paths_dict:
        paths_dict = {
            "Full Stack Developer": CAREER_PATHS["building"][0],
            "Backend Developer": CAREER_PATHS["enterprise"][0],
        }
    
    # Adjust time estimates based on experience
    paths = list(paths_dict.values())
    if experience_level == "none":
        for path in paths:
            # Add 2-3 months for complete beginners
            parts = path["timeToJob"].split("-")
            if len(parts) == 2:
                low = int(parts[0])
                high = int(parts[1].replace(" months", ""))
                path["timeToJob"] = f"{low + 2}-{high + 3} months"
    elif experience_level == "bootcamp" or experience_level == "switching":
        for path in paths:
            # Reduce by 1-2 months for those with some background
            parts = path["timeToJob"].split("-")
            if len(parts) == 2:
                low = max(2, int(parts[0]) - 1)
                high = int(parts[1].replace(" months", "")) - 1
                path["timeToJob"] = f"{low}-{high} months"
    
    return [CareerPath(**p) for p in paths[:3]]


@router.post("/discover", response_model=CareerDiscoverResponse)
async def discover_career_paths(
    request: CareerDiscoverRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Discover career paths based on user interests and preferences."""
    paths = get_career_paths_for_interests(
        request.interests,
        request.experience_level
    )
    
    return CareerDiscoverResponse(paths=paths)


@router.get("/paths")
async def get_all_career_paths():
    """Get all available career paths."""
    all_paths = []
    seen = set()
    
    for category, paths in CAREER_PATHS.items():
        for path in paths:
            if path["title"] not in seen:
                seen.add(path["title"])
                all_paths.append({
                    "category": category,
                    **path
                })
    
    return {"data": all_paths}

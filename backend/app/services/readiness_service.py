"""
Job Readiness Score Service
Calculates a transparent readiness score based on:
- Skills covered (40%)
- Projects completed (30%)
- Interview readiness (30%)
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Dict, List, Optional
from uuid import UUID
from datetime import datetime, timedelta

from app.db.models import Roadmap, RoadmapProgress, User


class ReadinessService:
    """Service for calculating job readiness scores"""

    # Weights for score calculation
    SKILL_WEIGHT = 0.40
    PROJECT_WEIGHT = 0.30
    INTERVIEW_WEIGHT = 0.30

    @staticmethod
    async def calculate_readiness_score(
        db: AsyncSession,
        user_id: UUID,
        roadmap_id: Optional[UUID] = None
    ) -> Dict:
        """
        Calculate comprehensive job readiness score
        
        Returns:
            {
                "overall": 67,
                "skillsCovered": 72,
                "projectsCompleted": 50,
                "interviewReadiness": 45,
                "missingSkills": ["System Design", "Docker"],
                "targetRole": "Senior Backend Engineer",
                "breakdown": {...}
            }
        """
        # Get the active roadmap
        if roadmap_id:
            result = await db.execute(
                select(Roadmap).where(
                    Roadmap.id == roadmap_id,
                    Roadmap.user_id == user_id
                )
            )
        else:
            # Get most recent active roadmap
            result = await db.execute(
                select(Roadmap)
                .where(Roadmap.user_id == user_id, Roadmap.status == "active")
                .order_by(Roadmap.generated_at.desc())
                .limit(1)
            )
        
        roadmap = result.scalar_one_or_none()
        
        if not roadmap:
            return {
                "overall": 0,
                "skillsCovered": 0,
                "projectsCompleted": 0,
                "interviewReadiness": 0,
                "missingSkills": [],
                "targetRole": "No active roadmap",
                "breakdown": {}
            }

        # Get progress data
        progress_result = await db.execute(
            select(RoadmapProgress).where(RoadmapProgress.roadmap_id == roadmap.id)
        )
        progress_items = progress_result.scalars().all()

        # Calculate skills covered
        skills_score = await ReadinessService._calculate_skills_score(
            roadmap, progress_items
        )

        # Calculate projects completed
        projects_score = await ReadinessService._calculate_projects_score(
            roadmap, progress_items
        )

        # Calculate interview readiness
        interview_score = await ReadinessService._calculate_interview_score(
            roadmap, progress_items
        )

        # Calculate overall score
        overall = int(
            skills_score["percentage"] * ReadinessService.SKILL_WEIGHT +
            projects_score["percentage"] * ReadinessService.PROJECT_WEIGHT +
            interview_score["percentage"] * ReadinessService.INTERVIEW_WEIGHT
        )

        # Get missing critical skills
        missing_skills = await ReadinessService._get_missing_skills(
            roadmap, progress_items
        )

        return {
            "overall": overall,
            "skillsCovered": skills_score["percentage"],
            "projectsCompleted": projects_score["percentage"],
            "interviewReadiness": interview_score["percentage"],
            "missingSkills": missing_skills[:5],  # Top 5 missing skills
            "targetRole": roadmap.job_title,
            "breakdown": {
                "skills": skills_score,
                "projects": projects_score,
                "interview": interview_score
            }
        }

    @staticmethod
    async def _calculate_skills_score(
        roadmap: Roadmap,
        progress_items: List[RoadmapProgress]
    ) -> Dict:
        """Calculate skills coverage score"""
        phases = roadmap.phases or []
        total_skills = 0
        completed_skills = 0
        in_progress_skills = 0

        # Count skills from phases
        for phase in phases:
            skills = phase.get("skills", [])
            total_skills += len(skills)

        # Count completed from progress
        for progress in progress_items:
            if progress.status == "completed":
                completed_skills += 1
            elif progress.status == "in_progress":
                in_progress_skills += 1

        if total_skills == 0:
            return {"percentage": 0, "completed": 0, "total": 0, "inProgress": 0}

        # In-progress skills count as 50%
        effective_completed = completed_skills + (in_progress_skills * 0.5)
        percentage = int((effective_completed / total_skills) * 100)

        return {
            "percentage": min(percentage, 100),
            "completed": completed_skills,
            "total": total_skills,
            "inProgress": in_progress_skills
        }

    @staticmethod
    async def _calculate_projects_score(
        roadmap: Roadmap,
        progress_items: List[RoadmapProgress]
    ) -> Dict:
        """Calculate projects completion score"""
        projects = roadmap.projects or []
        total_projects = len(projects)
        
        if total_projects == 0:
            return {"percentage": 0, "completed": 0, "total": 0}

        # Count completed projects (projects with all required skills completed)
        completed_projects = 0
        for project in projects:
            project_skills = project.get("skills", [])
            if not project_skills:
                continue
            
            # Check if all project skills are completed
            all_completed = True
            for skill in project_skills:
                skill_completed = any(
                    p.skill_name == skill and p.status == "completed"
                    for p in progress_items
                )
                if not skill_completed:
                    all_completed = False
                    break
            
            if all_completed:
                completed_projects += 1

        percentage = int((completed_projects / total_projects) * 100)

        return {
            "percentage": percentage,
            "completed": completed_projects,
            "total": total_projects
        }

    @staticmethod
    async def _calculate_interview_score(
        roadmap: Roadmap,
        progress_items: List[RoadmapProgress]
    ) -> Dict:
        """
        Calculate interview readiness score based on:
        - Critical skills completed (50%)
        - Time spent learning (25%)
        - Consistency/streak (25%)
        """
        phases = roadmap.phases or []
        
        # Get critical skills
        critical_skills = []
        for phase in phases:
            for skill in phase.get("skills", []):
                if skill.get("importance") == "critical":
                    critical_skills.append(skill.get("name"))

        # Calculate critical skills completion
        critical_completed = 0
        for skill_name in critical_skills:
            if any(p.skill_name == skill_name and p.status == "completed" for p in progress_items):
                critical_completed += 1

        critical_percentage = (
            (critical_completed / len(critical_skills) * 100) 
            if critical_skills else 50
        )

        # Calculate time investment score
        total_time = sum(p.time_spent_minutes or 0 for p in progress_items)
        # Assume 100 hours (6000 min) is full preparation
        time_percentage = min((total_time / 6000) * 100, 100)

        # Calculate consistency score (based on recent activity)
        recent_activity = sum(
            1 for p in progress_items 
            if p.completed_at and 
            p.completed_at > datetime.utcnow() - timedelta(days=7)
        )
        consistency_percentage = min(recent_activity * 15, 100)

        # Weighted average
        interview_score = int(
            critical_percentage * 0.5 +
            time_percentage * 0.25 +
            consistency_percentage * 0.25
        )

        return {
            "percentage": interview_score,
            "criticalSkillsCompleted": critical_completed,
            "totalCriticalSkills": len(critical_skills),
            "totalTimeMinutes": total_time,
            "recentActivityCount": recent_activity
        }

    @staticmethod
    async def _get_missing_skills(
        roadmap: Roadmap,
        progress_items: List[RoadmapProgress]
    ) -> List[str]:
        """Get list of missing critical and important skills"""
        phases = roadmap.phases or []
        completed_skills = {p.skill_name for p in progress_items if p.status == "completed"}
        
        missing = []
        for phase in phases:
            for skill in phase.get("skills", []):
                skill_name = skill.get("name")
                importance = skill.get("importance", "optional")
                
                if skill_name not in completed_skills:
                    if importance in ["critical", "important"]:
                        missing.append(skill_name)

        return missing

    @staticmethod
    async def get_next_best_action(
        db: AsyncSession,
        user_id: UUID,
        roadmap_id: Optional[UUID] = None
    ) -> Optional[Dict]:
        """
        Get the single most important next action for the user
        
        Priority:
        1. Critical skills not started
        2. Important skills not started
        3. In-progress skills
        4. Optional skills
        """
        # Get roadmap
        if roadmap_id:
            result = await db.execute(
                select(Roadmap).where(
                    Roadmap.id == roadmap_id,
                    Roadmap.user_id == user_id
                )
            )
        else:
            result = await db.execute(
                select(Roadmap)
                .where(Roadmap.user_id == user_id, Roadmap.status == "active")
                .order_by(Roadmap.generated_at.desc())
                .limit(1)
            )
        
        roadmap = result.scalar_one_or_none()
        if not roadmap:
            return None

        # Get progress
        progress_result = await db.execute(
            select(RoadmapProgress).where(RoadmapProgress.roadmap_id == roadmap.id)
        )
        progress_items = {p.skill_name: p for p in progress_result.scalars().all()}

        phases = roadmap.phases or []
        
        # Find next action by priority
        for importance in ["critical", "important", "optional"]:
            for phase in phases:
                for skill in phase.get("skills", []):
                    skill_name = skill.get("name")
                    skill_importance = skill.get("importance", "optional")
                    
                    if skill_importance != importance:
                        continue
                    
                    progress = progress_items.get(skill_name)
                    
                    # Not started or in progress
                    if not progress or progress.status in ["not_started", "in_progress"]:
                        resources = skill.get("resources", [])
                        first_resource = resources[0] if resources else {}
                        
                        return {
                            "id": skill.get("id", skill_name),
                            "title": f"Complete {skill_name}",
                            "description": skill.get("description", f"Learn {skill_name} fundamentals"),
                            "estimatedMinutes": skill.get("estimated_hours", 2) * 60 // 2,  # Half the total
                            "resourceUrl": first_resource.get("url", ""),
                            "resourceTitle": first_resource.get("title", "Learning Resource"),
                            "skillName": skill_name,
                            "phase": phase.get("name", "Learning Phase"),
                            "importance": importance,
                            "status": progress.status if progress else "not_started"
                        }

        return None


# Singleton instance
readiness_service = ReadinessService()

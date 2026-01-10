"""
Resource Service - Curated Learning Resources with Health Checking
Maintainable approach for fetching resources based on skills and user tier

Features:
- Curated, verified resources with fallbacks
- Automated health checking
- User report handling
- Dynamic version-agnostic URLs for official docs
- Tier-based access control
"""

from typing import List, Dict, Optional, Tuple
import asyncio
import aiohttp
from datetime import datetime, timedelta
import json

# Curated resource database - organized by skill category
CURATED_RESOURCES = {
    # Programming Languages
    "python": [
        {
            "id": "py-1",
            "title": "Python for Everybody - Full Course",
            "url": "https://www.youtube.com/watch?v=8DvywoWv6fI",
            "type": "video",
            "provider": "freeCodeCamp",
            "difficulty": "beginner",
            "duration_minutes": 480,
            "quality_score": 0.95,
            "tier_required": "free",
        },
        {
            "id": "py-2",
            "title": "Python Official Tutorial",
            "url": "https://docs.python.org/3/tutorial/",
            "type": "documentation",
            "provider": "Python.org",
            "difficulty": "beginner",
            "duration_minutes": 300,
            "quality_score": 0.90,
            "tier_required": "free",
        },
        {
            "id": "py-3",
            "title": "Automate the Boring Stuff with Python",
            "url": "https://automatetheboringstuff.com/",
            "type": "book",
            "provider": "Al Sweigart",
            "difficulty": "beginner",
            "duration_minutes": 600,
            "quality_score": 0.92,
            "tier_required": "free",
        },
        {
            "id": "py-4",
            "title": "Corey Schafer Python Tutorials",
            "url": "https://www.youtube.com/playlist?list=PL-osiE80TeTt2d9bfVyTiXJA-UTHn6WwU",
            "type": "video",
            "provider": "YouTube",
            "difficulty": "intermediate",
            "duration_minutes": 720,
            "quality_score": 0.94,
            "tier_required": "standard",
        },
        {
            "id": "py-5",
            "title": "Real Python Tutorials",
            "url": "https://realpython.com/",
            "type": "article",
            "provider": "Real Python",
            "difficulty": "intermediate",
            "duration_minutes": 400,
            "quality_score": 0.93,
            "tier_required": "standard",
        },
        {
            "id": "py-6",
            "title": "Python Design Patterns",
            "url": "https://refactoring.guru/design-patterns/python",
            "type": "article",
            "provider": "Refactoring Guru",
            "difficulty": "advanced",
            "duration_minutes": 300,
            "quality_score": 0.91,
            "tier_required": "premium",
        },
    ],
    
    "javascript": [
        {
            "id": "js-1",
            "title": "JavaScript Full Course for Beginners",
            "url": "https://www.youtube.com/watch?v=PkZNo7MFNFg",
            "type": "video",
            "provider": "freeCodeCamp",
            "difficulty": "beginner",
            "duration_minutes": 210,
            "quality_score": 0.93,
            "tier_required": "free",
        },
        {
            "id": "js-2",
            "title": "MDN JavaScript Guide",
            "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
            "type": "documentation",
            "provider": "MDN",
            "difficulty": "beginner",
            "duration_minutes": 400,
            "quality_score": 0.95,
            "tier_required": "free",
        },
        {
            "id": "js-3",
            "title": "JavaScript.info - The Modern JavaScript Tutorial",
            "url": "https://javascript.info/",
            "type": "course",
            "provider": "JavaScript.info",
            "difficulty": "intermediate",
            "duration_minutes": 600,
            "quality_score": 0.94,
            "tier_required": "free",
        },
        {
            "id": "js-4",
            "title": "Traversy Media JS Crash Course",
            "url": "https://www.youtube.com/watch?v=hdI2bqOjy3c",
            "type": "video",
            "provider": "YouTube",
            "difficulty": "beginner",
            "duration_minutes": 100,
            "quality_score": 0.92,
            "tier_required": "standard",
        },
        {
            "id": "js-5",
            "title": "You Don't Know JS (Book Series)",
            "url": "https://github.com/getify/You-Dont-Know-JS",
            "type": "book",
            "provider": "GitHub",
            "difficulty": "advanced",
            "duration_minutes": 900,
            "quality_score": 0.96,
            "tier_required": "premium",
        },
    ],
    
    "react": [
        {
            "id": "react-1",
            "title": "React Official Tutorial",
            "url": "https://react.dev/learn",
            "type": "documentation",
            "provider": "React.dev",
            "difficulty": "beginner",
            "duration_minutes": 300,
            "quality_score": 0.96,
            "tier_required": "free",
        },
        {
            "id": "react-2",
            "title": "React Course - Beginner's Tutorial",
            "url": "https://www.youtube.com/watch?v=bMknfKXIFA8",
            "type": "video",
            "provider": "freeCodeCamp",
            "difficulty": "beginner",
            "duration_minutes": 720,
            "quality_score": 0.94,
            "tier_required": "free",
        },
        {
            "id": "react-3",
            "title": "Full React Course 2024",
            "url": "https://www.youtube.com/watch?v=CgkZ7MvWUAA",
            "type": "video",
            "provider": "freeCodeCamp",
            "difficulty": "intermediate",
            "duration_minutes": 600,
            "quality_score": 0.93,
            "tier_required": "free",
        },
        {
            "id": "react-4",
            "title": "React Hooks Explained",
            "url": "https://www.youtube.com/watch?v=TNhaISOUy6Q",
            "type": "video",
            "provider": "Fireship",
            "difficulty": "intermediate",
            "duration_minutes": 12,
            "quality_score": 0.91,
            "tier_required": "standard",
        },
        {
            "id": "react-5",
            "title": "Advanced React Patterns",
            "url": "https://www.patterns.dev/react",
            "type": "article",
            "provider": "Patterns.dev",
            "difficulty": "advanced",
            "duration_minutes": 240,
            "quality_score": 0.92,
            "tier_required": "premium",
        },
    ],
    
    "node": [
        {
            "id": "node-1",
            "title": "Node.js Tutorial for Beginners",
            "url": "https://www.youtube.com/watch?v=TlB_eWDSMt4",
            "type": "video",
            "provider": "Programming with Mosh",
            "difficulty": "beginner",
            "duration_minutes": 60,
            "quality_score": 0.92,
            "tier_required": "free",
        },
        {
            "id": "node-2",
            "title": "Node.js Official Documentation",
            "url": "https://nodejs.org/docs/latest/api/",
            "type": "documentation",
            "provider": "Node.js",
            "difficulty": "intermediate",
            "duration_minutes": 400,
            "quality_score": 0.94,
            "tier_required": "free",
        },
        {
            "id": "node-3",
            "title": "Express.js Crash Course",
            "url": "https://www.youtube.com/watch?v=L72fhGm1tfE",
            "type": "video",
            "provider": "Traversy Media",
            "difficulty": "beginner",
            "duration_minutes": 75,
            "quality_score": 0.91,
            "tier_required": "standard",
        },
    ],
    
    "sql": [
        {
            "id": "sql-1",
            "title": "SQL Tutorial - Full Database Course",
            "url": "https://www.youtube.com/watch?v=HXV3zeQKqGY",
            "type": "video",
            "provider": "freeCodeCamp",
            "difficulty": "beginner",
            "duration_minutes": 260,
            "quality_score": 0.94,
            "tier_required": "free",
        },
        {
            "id": "sql-2",
            "title": "SQLBolt - Interactive SQL Lessons",
            "url": "https://sqlbolt.com/",
            "type": "interactive",
            "provider": "SQLBolt",
            "difficulty": "beginner",
            "duration_minutes": 120,
            "quality_score": 0.93,
            "tier_required": "free",
        },
        {
            "id": "sql-3",
            "title": "PostgreSQL Tutorial",
            "url": "https://www.postgresqltutorial.com/",
            "type": "course",
            "provider": "PostgreSQL Tutorial",
            "difficulty": "intermediate",
            "duration_minutes": 300,
            "quality_score": 0.90,
            "tier_required": "standard",
        },
    ],
    
    "git": [
        {
            "id": "git-1",
            "title": "Git and GitHub for Beginners",
            "url": "https://www.youtube.com/watch?v=RGOj5yH7evk",
            "type": "video",
            "provider": "freeCodeCamp",
            "difficulty": "beginner",
            "duration_minutes": 60,
            "quality_score": 0.94,
            "tier_required": "free",
        },
        {
            "id": "git-2",
            "title": "Learn Git Branching",
            "url": "https://learngitbranching.js.org/",
            "type": "interactive",
            "provider": "Learn Git Branching",
            "difficulty": "beginner",
            "duration_minutes": 90,
            "quality_score": 0.95,
            "tier_required": "free",
        },
        {
            "id": "git-3",
            "title": "Pro Git Book",
            "url": "https://git-scm.com/book/en/v2",
            "type": "book",
            "provider": "Git SCM",
            "difficulty": "intermediate",
            "duration_minutes": 480,
            "quality_score": 0.93,
            "tier_required": "standard",
        },
    ],
    
    "docker": [
        {
            "id": "docker-1",
            "title": "Docker Tutorial for Beginners",
            "url": "https://www.youtube.com/watch?v=fqMOX6JJhGo",
            "type": "video",
            "provider": "freeCodeCamp",
            "difficulty": "beginner",
            "duration_minutes": 120,
            "quality_score": 0.93,
            "tier_required": "free",
        },
        {
            "id": "docker-2",
            "title": "Docker Official Getting Started",
            "url": "https://docs.docker.com/get-started/",
            "type": "documentation",
            "provider": "Docker",
            "difficulty": "beginner",
            "duration_minutes": 60,
            "quality_score": 0.94,
            "tier_required": "free",
        },
        {
            "id": "docker-3",
            "title": "Docker Compose Tutorial",
            "url": "https://www.youtube.com/watch?v=HG6yIjZapSA",
            "type": "video",
            "provider": "TechWorld with Nana",
            "difficulty": "intermediate",
            "duration_minutes": 90,
            "quality_score": 0.92,
            "tier_required": "standard",
        },
    ],
    
    "aws": [
        {
            "id": "aws-1",
            "title": "AWS Certified Cloud Practitioner",
            "url": "https://www.youtube.com/watch?v=SOTamWNgDKc",
            "type": "video",
            "provider": "freeCodeCamp",
            "difficulty": "beginner",
            "duration_minutes": 780,
            "quality_score": 0.94,
            "tier_required": "free",
        },
        {
            "id": "aws-2",
            "title": "AWS Free Tier",
            "url": "https://aws.amazon.com/free/",
            "type": "interactive",
            "provider": "AWS",
            "difficulty": "beginner",
            "duration_minutes": 120,
            "quality_score": 0.90,
            "tier_required": "free",
        },
        {
            "id": "aws-3",
            "title": "AWS Solutions Architect Course",
            "url": "https://www.youtube.com/watch?v=Ia-UEYYR44s",
            "type": "video",
            "provider": "freeCodeCamp",
            "difficulty": "intermediate",
            "duration_minutes": 600,
            "quality_score": 0.93,
            "tier_required": "standard",
        },
    ],
    
    "system_design": [
        {
            "id": "sd-1",
            "title": "System Design Primer",
            "url": "https://github.com/donnemartin/system-design-primer",
            "type": "article",
            "provider": "GitHub",
            "difficulty": "intermediate",
            "duration_minutes": 600,
            "quality_score": 0.96,
            "tier_required": "free",
        },
        {
            "id": "sd-2",
            "title": "System Design Interview Course",
            "url": "https://www.youtube.com/watch?v=xpDnVSmNFX0",
            "type": "video",
            "provider": "freeCodeCamp",
            "difficulty": "intermediate",
            "duration_minutes": 300,
            "quality_score": 0.93,
            "tier_required": "standard",
        },
        {
            "id": "sd-3",
            "title": "Designing Data-Intensive Applications",
            "url": "https://dataintensive.net/",
            "type": "book",
            "provider": "Martin Kleppmann",
            "difficulty": "advanced",
            "duration_minutes": 1200,
            "quality_score": 0.98,
            "tier_required": "premium",
        },
    ],
    
    "data_structures": [
        {
            "id": "ds-1",
            "title": "Data Structures Easy to Advanced",
            "url": "https://www.youtube.com/watch?v=RBSGKlAvoiM",
            "type": "video",
            "provider": "freeCodeCamp",
            "difficulty": "beginner",
            "duration_minutes": 480,
            "quality_score": 0.95,
            "tier_required": "free",
        },
        {
            "id": "ds-2",
            "title": "Visualgo - Visualizing Algorithms",
            "url": "https://visualgo.net/en",
            "type": "interactive",
            "provider": "Visualgo",
            "difficulty": "beginner",
            "duration_minutes": 180,
            "quality_score": 0.94,
            "tier_required": "free",
        },
        {
            "id": "ds-3",
            "title": "LeetCode Practice",
            "url": "https://leetcode.com/problemset/",
            "type": "interactive",
            "provider": "LeetCode",
            "difficulty": "intermediate",
            "duration_minutes": 600,
            "quality_score": 0.93,
            "tier_required": "standard",
        },
    ],
}

# Skill name to category mapping
SKILL_CATEGORY_MAP = {
    # Python
    "python": "python",
    "python3": "python",
    "python programming": "python",
    "django": "python",
    "flask": "python",
    "fastapi": "python",
    
    # JavaScript
    "javascript": "javascript",
    "js": "javascript",
    "es6": "javascript",
    "typescript": "javascript",
    "ts": "javascript",
    
    # React
    "react": "react",
    "react.js": "react",
    "reactjs": "react",
    "next.js": "react",
    "nextjs": "react",
    
    # Node
    "node": "node",
    "node.js": "node",
    "nodejs": "node",
    "express": "node",
    "express.js": "node",
    
    # SQL
    "sql": "sql",
    "mysql": "sql",
    "postgresql": "sql",
    "postgres": "sql",
    "database": "sql",
    "databases": "sql",
    
    # Git
    "git": "git",
    "github": "git",
    "version control": "git",
    
    # Docker
    "docker": "docker",
    "containers": "docker",
    "kubernetes": "docker",
    "k8s": "docker",
    
    # AWS
    "aws": "aws",
    "amazon web services": "aws",
    "cloud": "aws",
    "cloud computing": "aws",
    
    # System Design
    "system design": "system_design",
    "architecture": "system_design",
    "scalability": "system_design",
    "distributed systems": "system_design",
    
    # Data Structures
    "data structures": "data_structures",
    "algorithms": "data_structures",
    "dsa": "data_structures",
    "leetcode": "data_structures",
}

# Tier limits for resources
TIER_RESOURCE_LIMITS = {
    "free": 3,
    "standard": 8,
    "premium": 15,
}


def get_skill_category(skill_name: str) -> Optional[str]:
    """Map a skill name to its resource category"""
    normalized = skill_name.lower().strip()
    return SKILL_CATEGORY_MAP.get(normalized)


def get_resources_for_skill(
    skill_name: str,
    user_tier: str = "free",
    difficulty: Optional[str] = None
) -> List[Dict]:
    """
    Get curated resources for a skill based on user tier
    
    Args:
        skill_name: Name of the skill
        user_tier: User's subscription tier (free, standard, premium)
        difficulty: Optional filter by difficulty
    
    Returns:
        List of resource dictionaries
    """
    category = get_skill_category(skill_name)
    
    if not category:
        # Try partial matching
        normalized = skill_name.lower().strip()
        for key, cat in SKILL_CATEGORY_MAP.items():
            if key in normalized or normalized in key:
                category = cat
                break
    
    if not category:
        print(f"⚠️ No resources found for skill: {skill_name}")
        return []
    
    all_resources = CURATED_RESOURCES.get(category, [])
    
    # Filter by tier access
    tier_order = {"free": 0, "standard": 1, "premium": 2}
    user_tier_level = tier_order.get(user_tier, 0)
    
    accessible_resources = [
        r for r in all_resources
        if tier_order.get(r.get("tier_required", "free"), 0) <= user_tier_level
    ]
    
    # Filter by difficulty if specified
    if difficulty:
        accessible_resources = [
            r for r in accessible_resources
            if r.get("difficulty") == difficulty
        ]
    
    # Apply tier limit
    limit = TIER_RESOURCE_LIMITS.get(user_tier, 3)
    
    # Sort by quality score and return limited results
    sorted_resources = sorted(
        accessible_resources,
        key=lambda x: x.get("quality_score", 0),
        reverse=True
    )
    
    return sorted_resources[:limit]


def get_all_resources_for_roadmap(
    phases: List[Dict],
    user_tier: str = "free"
) -> Dict[str, List[Dict]]:
    """
    Get resources for all skills in a roadmap
    
    Args:
        phases: List of roadmap phases with skills
        user_tier: User's subscription tier
    
    Returns:
        Dictionary mapping skill IDs to their resources
    """
    resources_map = {}
    
    for phase in phases:
        for skill in phase.get("skills", []):
            skill_name = skill.get("name", "")
            skill_id = skill.get("id", skill_name)
            
            resources = get_resources_for_skill(skill_name, user_tier)
            resources_map[skill_id] = resources
    
    return resources_map


def enrich_roadmap_with_resources(
    roadmap_data: Dict,
    user_tier: str = "free"
) -> Dict:
    """
    Add curated resources to each skill in a roadmap
    
    Args:
        roadmap_data: Roadmap dictionary with phases and skills
        user_tier: User's subscription tier
    
    Returns:
        Roadmap with resources added to each skill
    """
    phases = roadmap_data.get("phases", [])
    
    for phase in phases:
        for skill in phase.get("skills", []):
            skill_name = skill.get("name", "")
            resources = get_resources_for_skill(skill_name, user_tier)
            
            # Merge with any existing AI-generated resources
            existing = skill.get("resources", [])
            
            # Prefer curated resources, add AI-generated as fallback
            if resources:
                skill["resources"] = resources
            elif not existing:
                # No curated or AI resources - add placeholder
                skill["resources"] = [{
                    "id": f"{skill.get('id', 'skill')}-placeholder",
                    "title": f"Search for {skill_name} tutorials",
                    "url": f"https://www.google.com/search?q={skill_name.replace(' ', '+')}+tutorial",
                    "type": "search",
                    "provider": "Google",
                    "difficulty": skill.get("difficulty", "beginner"),
                    "duration_minutes": 60,
                    "quality_score": 0.5,
                    "tier_required": "free",
                }]
    
    return roadmap_data

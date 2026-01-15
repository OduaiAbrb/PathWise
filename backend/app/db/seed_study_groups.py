"""
Seed Study Groups - Populate database with starter study groups
Run this script to create initial study groups for users to join
"""

import asyncio
import uuid
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import async_session_maker
from app.db.models_extended import StudyGroup
from app.db.models import User


SEED_GROUPS = [
    {
        "id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
        "name": "Backend Engineers Hub",
        "description": "Weekly discussions on system design, APIs, and databases. Perfect for aspiring backend developers.",
        "topic": "Backend Development",
        "max_members": 30,
        "member_count": 24,
        "is_public": True,
        "is_private": False,
        "is_active": True,
        "meeting_schedule": "Every Tuesday, 7 PM EST",
    },
    {
        "id": "b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e",
        "name": "Python Mastery",
        "description": "From basics to advanced Python concepts. Code reviews, pair programming, and best practices.",
        "topic": "Python",
        "max_members": 25,
        "member_count": 18,
        "is_public": True,
        "is_private": False,
        "is_active": True,
        "meeting_schedule": "Every Friday, 6 PM EST",
    },
    {
        "id": "c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f",
        "name": "Interview Prep Squad",
        "description": "Mock interviews, coding challenges, and behavioral prep. Get job-ready together.",
        "topic": "Interview Prep",
        "max_members": 15,
        "member_count": 12,
        "is_public": True,
        "is_private": False,
        "is_active": True,
        "meeting_schedule": "Every Saturday, 10 AM EST",
    },
    {
        "id": "d4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a",
        "name": "Cloud & DevOps",
        "description": "AWS, Docker, Kubernetes, and CI/CD pipelines. Hands-on labs and certifications.",
        "topic": "DevOps",
        "max_members": 40,
        "member_count": 31,
        "is_public": True,
        "is_private": False,
        "is_active": True,
        "meeting_schedule": "Every Wednesday, 8 PM EST",
    },
    {
        "id": "e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b",
        "name": "React & Frontend",
        "description": "Modern React patterns, TypeScript, and UI/UX best practices. Build portfolio projects together.",
        "topic": "Frontend",
        "max_members": 30,
        "member_count": 22,
        "is_public": True,
        "is_private": False,
        "is_active": True,
        "meeting_schedule": "Every Thursday, 7 PM EST",
    },
    {
        "id": "f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c",
        "name": "Data Structures & Algorithms",
        "description": "Master DSA for coding interviews. Daily problem solving and weekly contests.",
        "topic": "DSA",
        "max_members": 50,
        "member_count": 45,
        "is_public": True,
        "is_private": False,
        "is_active": True,
        "meeting_schedule": "Daily, 9 AM EST",
    },
    {
        "id": "a7b8c9d0-e1f2-0a1b-4c5d-6e7f8a9b0c1d",
        "name": "Full Stack Builders",
        "description": "End-to-end project development. Learn by building real applications from scratch.",
        "topic": "Full Stack",
        "max_members": 20,
        "member_count": 16,
        "is_public": True,
        "is_private": False,
        "is_active": True,
        "meeting_schedule": "Every Sunday, 2 PM EST",
    },
    {
        "id": "b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d2e",
        "name": "System Design Study Group",
        "description": "Deep dive into system design. Design real systems like Twitter, Uber, and Netflix.",
        "topic": "System Design",
        "max_members": 25,
        "member_count": 20,
        "is_public": True,
        "is_private": False,
        "is_active": True,
        "meeting_schedule": "Every Monday, 8 PM EST",
    },
]


async def seed_study_groups():
    """Seed the database with study groups"""
    async with async_session_maker() as db:
        try:
            # Get a system user to be the creator (first admin or any user)
            result = await db.execute(select(User).limit(1))
            creator = result.scalar_one_or_none()
            
            if not creator:
                print("No users found in database. Please create a user first.")
                return
            
            creator_id = creator.id
            groups_created = 0
            
            for group_data in SEED_GROUPS:
                # Check if group already exists
                existing = await db.execute(
                    select(StudyGroup).where(StudyGroup.id == uuid.UUID(group_data["id"]))
                )
                if existing.scalar_one_or_none():
                    print(f"Group '{group_data['name']}' already exists, skipping...")
                    continue
                
                # Create the group
                group = StudyGroup(
                    id=uuid.UUID(group_data["id"]),
                    name=group_data["name"],
                    description=group_data["description"],
                    topic=group_data["topic"],
                    creator_id=creator_id,
                    max_members=group_data["max_members"],
                    member_count=group_data["member_count"],
                    is_public=group_data["is_public"],
                    is_private=group_data["is_private"],
                    is_active=group_data["is_active"],
                    meeting_schedule=group_data["meeting_schedule"],
                    created_at=datetime.utcnow(),
                )
                db.add(group)
                groups_created += 1
                print(f"Created group: {group_data['name']}")
            
            await db.commit()
            print(f"\n✅ Successfully seeded {groups_created} study groups!")
            
        except Exception as e:
            await db.rollback()
            print(f"❌ Error seeding study groups: {e}")
            raise


if __name__ == "__main__":
    asyncio.run(seed_study_groups())

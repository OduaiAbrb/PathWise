"""Social learning network service."""
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from datetime import datetime
import uuid

from app.db.models_extended import StudyGroup, StudyGroupMember, GroupMessage


async def create_study_group(
    db: AsyncSession,
    creator_id: str,
    name: str,
    description: str,
    topic: str,
    max_members: int = 10,
    is_private: bool = False
) -> StudyGroup:
    """Create a new study group."""
    creator_uuid = uuid.UUID(creator_id)
    
    group = StudyGroup(
        name=name,
        description=description,
        topic=topic,
        creator_id=creator_uuid,
        max_members=max_members,
        is_private=is_private,
        member_count=1,
    )
    
    db.add(group)
    await db.flush()
    
    # Add creator as first member
    member = StudyGroupMember(
        group_id=group.id,
        user_id=creator_uuid,
        role="admin",
    )
    
    db.add(member)
    await db.commit()
    await db.refresh(group)
    
    return group


async def join_study_group(
    db: AsyncSession,
    group_id: str,
    user_id: str
) -> StudyGroupMember:
    """Join a study group."""
    group_uuid = uuid.UUID(group_id)
    user_uuid = uuid.UUID(user_id)
    
    # Check if group exists and has space
    result = await db.execute(select(StudyGroup).where(StudyGroup.id == group_uuid))
    group = result.scalar_one_or_none()
    
    if not group:
        raise ValueError("Group not found")
    
    if group.member_count >= group.max_members:
        raise ValueError("Group is full")
    
    # Check if already a member
    result = await db.execute(
        select(StudyGroupMember).where(
            and_(
                StudyGroupMember.group_id == group_uuid,
                StudyGroupMember.user_id == user_uuid
            )
        )
    )
    existing = result.scalar_one_or_none()
    
    if existing:
        raise ValueError("Already a member")
    
    # Add member
    member = StudyGroupMember(
        group_id=group_uuid,
        user_id=user_uuid,
        role="member",
    )
    
    db.add(member)
    
    # Update member count
    group.member_count += 1
    
    await db.commit()
    await db.refresh(member)
    
    return member


async def leave_study_group(
    db: AsyncSession,
    group_id: str,
    user_id: str
) -> bool:
    """Leave a study group."""
    group_uuid = uuid.UUID(group_id)
    user_uuid = uuid.UUID(user_id)
    
    # Find membership
    result = await db.execute(
        select(StudyGroupMember).where(
            and_(
                StudyGroupMember.group_id == group_uuid,
                StudyGroupMember.user_id == user_uuid
            )
        )
    )
    member = result.scalar_one_or_none()
    
    if not member:
        raise ValueError("Not a member")
    
    # Delete membership
    await db.delete(member)
    
    # Update member count
    result = await db.execute(select(StudyGroup).where(StudyGroup.id == group_uuid))
    group = result.scalar_one_or_none()
    
    if group:
        group.member_count -= 1
    
    await db.commit()
    
    return True


async def send_group_message(
    db: AsyncSession,
    group_id: str,
    user_id: str,
    content: str,
    message_type: str = "text"
) -> GroupMessage:
    """Send a message to a study group."""
    group_uuid = uuid.UUID(group_id)
    user_uuid = uuid.UUID(user_id)
    
    # Verify membership
    result = await db.execute(
        select(StudyGroupMember).where(
            and_(
                StudyGroupMember.group_id == group_uuid,
                StudyGroupMember.user_id == user_uuid
            )
        )
    )
    member = result.scalar_one_or_none()
    
    if not member:
        raise ValueError("Not a member of this group")
    
    # Create message
    message = GroupMessage(
        group_id=group_uuid,
        user_id=user_uuid,
        content=content,
        message_type=message_type,
    )
    
    db.add(message)
    await db.commit()
    await db.refresh(message)
    
    return message


async def get_group_messages(
    db: AsyncSession,
    group_id: str,
    limit: int = 50,
    before_id: Optional[str] = None
) -> List[GroupMessage]:
    """Get messages from a study group."""
    group_uuid = uuid.UUID(group_id)
    
    query = select(GroupMessage).where(GroupMessage.group_id == group_uuid)
    
    if before_id:
        before_uuid = uuid.UUID(before_id)
        # Get timestamp of before_id message
        result = await db.execute(
            select(GroupMessage).where(GroupMessage.id == before_uuid)
        )
        before_msg = result.scalar_one_or_none()
        if before_msg:
            query = query.where(GroupMessage.sent_at < before_msg.sent_at)
    
    query = query.order_by(GroupMessage.sent_at.desc()).limit(limit)
    
    result = await db.execute(query)
    messages = result.scalars().all()
    
    return list(reversed(messages))  # Return in chronological order


async def search_study_groups(
    db: AsyncSession,
    topic: Optional[str] = None,
    search_query: Optional[str] = None,
    only_public: bool = True
) -> List[StudyGroup]:
    """Search for study groups."""
    query = select(StudyGroup).where(StudyGroup.is_active == True)
    
    if only_public:
        query = query.where(StudyGroup.is_private == False)
    
    if topic:
        query = query.where(StudyGroup.topic.ilike(f"%{topic}%"))
    
    if search_query:
        query = query.where(
            StudyGroup.name.ilike(f"%{search_query}%") |
            StudyGroup.description.ilike(f"%{search_query}%")
        )
    
    query = query.order_by(StudyGroup.member_count.desc())
    
    result = await db.execute(query)
    return result.scalars().all()


async def get_user_groups(
    db: AsyncSession,
    user_id: str
) -> List[dict]:
    """Get all groups a user is a member of."""
    user_uuid = uuid.UUID(user_id)
    
    result = await db.execute(
        select(StudyGroup, StudyGroupMember)
        .join(StudyGroupMember, StudyGroup.id == StudyGroupMember.group_id)
        .where(StudyGroupMember.user_id == user_uuid)
        .order_by(StudyGroup.created_at.desc())
    )
    
    groups = []
    for group, member in result.all():
        groups.append({
            "group": group,
            "role": member.role,
            "joined_at": member.joined_at,
        })
    
    return groups


async def update_group_settings(
    db: AsyncSession,
    group_id: str,
    user_id: str,
    **updates
) -> StudyGroup:
    """Update study group settings (admin only)."""
    group_uuid = uuid.UUID(group_id)
    user_uuid = uuid.UUID(user_id)
    
    # Verify admin
    result = await db.execute(
        select(StudyGroupMember).where(
            and_(
                StudyGroupMember.group_id == group_uuid,
                StudyGroupMember.user_id == user_uuid,
                StudyGroupMember.role == "admin"
            )
        )
    )
    member = result.scalar_one_or_none()
    
    if not member:
        raise ValueError("Not authorized")
    
    # Get group
    result = await db.execute(select(StudyGroup).where(StudyGroup.id == group_uuid))
    group = result.scalar_one_or_none()
    
    if not group:
        raise ValueError("Group not found")
    
    # Update fields
    for key, value in updates.items():
        if hasattr(group, key):
            setattr(group, key, value)
    
    await db.commit()
    await db.refresh(group)
    
    return group

"""Social learning network API endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional

from app.db.database import get_db
from app.core.security import get_current_user_id
from app.services.social_service import (
    create_study_group,
    join_study_group,
    leave_study_group,
    send_group_message,
    get_group_messages,
    search_study_groups,
    get_user_groups,
    update_group_settings,
)

router = APIRouter()


class CreateGroupRequest(BaseModel):
    name: str
    description: str
    topic: str
    max_members: int = 10
    is_private: bool = False


class JoinGroupRequest(BaseModel):
    group_id: str


class SendMessageRequest(BaseModel):
    group_id: str
    content: str
    message_type: str = "text"


class UpdateGroupRequest(BaseModel):
    group_id: str
    name: Optional[str] = None
    description: Optional[str] = None
    max_members: Optional[int] = None


@router.post("/groups/create", response_model=dict)
async def create_group(
    request: CreateGroupRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Create a new study group."""
    try:
        group = await create_study_group(
            db,
            user_id,
            request.name,
            request.description,
            request.topic,
            request.max_members,
            request.is_private
        )
        
        return {
            "success": True,
            "data": {
                "id": str(group.id),
                "name": group.name,
                "description": group.description,
                "topic": group.topic,
                "member_count": group.member_count,
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/groups/join", response_model=dict)
async def join_group(
    request: JoinGroupRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Join a study group."""
    try:
        member = await join_study_group(db, request.group_id, user_id)
        
        return {
            "success": True,
            "data": {
                "group_id": str(member.group_id),
                "role": member.role,
                "joined_at": member.joined_at.isoformat(),
            }
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/groups/leave", response_model=dict)
async def leave_group(
    request: JoinGroupRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Leave a study group."""
    try:
        await leave_study_group(db, request.group_id, user_id)
        
        return {
            "success": True,
            "data": {"message": "Left group successfully"}
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/messages/send", response_model=dict)
async def send_message(
    request: SendMessageRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Send a message to a study group."""
    try:
        message = await send_group_message(
            db,
            request.group_id,
            user_id,
            request.content,
            request.message_type
        )
        
        return {
            "success": True,
            "data": {
                "id": str(message.id),
                "content": message.content,
                "sent_at": message.sent_at.isoformat(),
            }
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/messages/{group_id}", response_model=dict)
async def get_messages(
    group_id: str,
    limit: int = 50,
    before_id: Optional[str] = None,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get messages from a study group."""
    try:
        messages = await get_group_messages(db, group_id, limit, before_id)
        
        return {
            "success": True,
            "data": [
                {
                    "id": str(m.id),
                    "user_id": str(m.user_id),
                    "content": m.content,
                    "message_type": m.message_type,
                    "sent_at": m.sent_at.isoformat(),
                }
                for m in messages
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/groups", response_model=dict)
async def list_all_groups(
    scope: Optional[str] = "all",
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """List all study groups (for discovery)."""
    try:
        # Get all public groups
        groups = await search_study_groups(db, topic=None, query=None)
        
        # Get user's groups to mark which ones they're in
        user_groups = await get_user_groups(db, user_id)
        user_group_ids = {str(g["group"].id) for g in user_groups}
        
        return {
            "success": True,
            "data": [
                {
                    "id": str(g.id),
                    "name": g.name,
                    "description": g.description,
                    "topic": g.topic,
                    "member_count": g.member_count,
                    "max_members": g.max_members,
                    "is_private": g.is_private,
                    "is_member": str(g.id) in user_group_ids,
                }
                for g in groups
            ]
        }
    except Exception as e:
        print(f"❌ Error fetching groups: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/groups/search", response_model=dict)
async def search_groups(
    topic: Optional[str] = None,
    query: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Search for study groups."""
    try:
        groups = await search_study_groups(db, topic, query)
        
        return {
            "success": True,
            "data": [
                {
                    "id": str(g.id),
                    "name": g.name,
                    "description": g.description,
                    "topic": g.topic,
                    "member_count": g.member_count,
                    "max_members": g.max_members,
                    "is_private": g.is_private,
                }
                for g in groups
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/groups/my-groups", response_model=dict)
async def my_groups(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get user's study groups."""
    try:
        groups = await get_user_groups(db, user_id)
        
        return {
            "success": True,
            "data": [
                {
                    "id": str(g["group"].id),
                    "name": g["group"].name,
                    "description": g["group"].description,
                    "topic": g["group"].topic,
                    "member_count": g["group"].member_count,
                    "role": g["role"],
                    "joined_at": g["joined_at"].isoformat(),
                }
                for g in groups
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/groups/update", response_model=dict)
async def update_group(
    request: UpdateGroupRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Update study group settings."""
    try:
        updates = {}
        if request.name:
            updates["name"] = request.name
        if request.description:
            updates["description"] = request.description
        if request.max_members:
            updates["max_members"] = request.max_members
        
        group = await update_group_settings(db, request.group_id, user_id, **updates)
        
        return {
            "success": True,
            "data": {
                "id": str(group.id),
                "name": group.name,
                "description": group.description,
            }
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

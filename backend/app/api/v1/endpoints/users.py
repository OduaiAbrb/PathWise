"""Users API endpoints for fetching platform users."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
import uuid

from app.db.database import get_db
from app.core.security import get_current_user_id
from app.db.models import User

router = APIRouter()


@router.get("", response_model=dict)
async def list_users(
    limit: int = 50,
    offset: int = 0,
    exclude_self: bool = True,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """List all users on the platform (for finding partners, etc)."""
    try:
        print(f"📋 Fetching users list (limit={limit}, offset={offset}, exclude_self={exclude_self})")
        
        # Build query
        query = select(User).limit(limit).offset(offset)
        
        # Optionally exclude current user
        if exclude_self:
            query = query.where(User.id != uuid.UUID(user_id))
        
        # Execute query
        result = await db.execute(query)
        users = result.scalars().all()
        
        print(f"✅ Found {len(users)} users")
        
        return {
            "success": True,
            "data": [
                {
                    "id": str(u.id),
                    "name": u.name,
                    "email": u.email,
                    "image": u.image,
                    "tier": u.tier,
                    "created_at": u.created_at.isoformat() if u.created_at else None,
                }
                for u in users
            ]
        }
    except Exception as e:
        print(f"❌ Error fetching users: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch users: {str(e)}")


@router.get("/{user_id_param}", response_model=dict)
async def get_user_by_id(
    user_id_param: str,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific user by ID."""
    try:
        result = await db.execute(
            select(User).where(User.id == uuid.UUID(user_id_param))
        )
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "success": True,
            "data": {
                "id": str(user.id),
                "name": user.name,
                "email": user.email,
                "image": user.image,
                "tier": user.tier,
                "created_at": user.created_at.isoformat() if user.created_at else None,
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error fetching user {user_id_param}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch user: {str(e)}")

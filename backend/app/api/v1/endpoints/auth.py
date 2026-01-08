from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime

from app.db.database import get_db
from app.db.models import User
from app.schemas.auth import (
    UserCreate,
    UserLogin,
    GoogleAuth,
    UserResponse,
    AuthResponse,
)
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user_id,
)
from app.services.email_service import send_welcome_email

router = APIRouter()


@router.post("/register", response_model=dict)
async def register(
    user_data: UserCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """Register a new user with email and password."""
    # Check if user exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    new_user = User(
        email=user_data.email,
        name=user_data.name,
        password_hash=get_password_hash(user_data.password),
        tier="free",
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    # Generate token
    access_token = create_access_token(data={"sub": str(new_user.id)})
    
    # Send welcome email in background
    background_tasks.add_task(send_welcome_email, new_user.email, new_user.name or "there")
    
    return {
        "success": True,
        "data": {
            "user": {
                "id": str(new_user.id),
                "email": new_user.email,
                "name": new_user.name,
                "tier": new_user.tier,
                "image": new_user.image,
            },
            "token": access_token,
        }
    }


@router.post("/login", response_model=dict)
async def login(
    credentials: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    """Login with email and password."""
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalar_one_or_none()
    
    if not user or not user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Update last login
    user.last_login = datetime.utcnow()
    await db.commit()
    
    # Generate token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return {
        "success": True,
        "data": {
            "user": {
                "id": str(user.id),
                "email": user.email,
                "name": user.name,
                "tier": user.tier,
                "image": user.image,
            },
            "token": access_token,
        }
    }


@router.post("/google", response_model=dict)
async def google_auth(
    auth_data: GoogleAuth,
    db: AsyncSession = Depends(get_db)
):
    """Authenticate or register user via Google OAuth."""
    # Check if user exists by Google ID
    result = await db.execute(select(User).where(User.google_id == auth_data.googleId))
    user = result.scalar_one_or_none()
    
    if not user:
        # Check by email
        result = await db.execute(select(User).where(User.email == auth_data.email))
        user = result.scalar_one_or_none()
        
        if user:
            # Link Google account to existing user
            user.google_id = auth_data.googleId
            if auth_data.image and not user.image:
                user.image = auth_data.image
        else:
            # Create new user
            user = User(
                email=auth_data.email,
                name=auth_data.name,
                image=auth_data.image,
                google_id=auth_data.googleId,
                tier="free",
            )
            db.add(user)
    
    user.last_login = datetime.utcnow()
    await db.commit()
    await db.refresh(user)
    
    # Generate token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return {
        "success": True,
        "data": {
            "user": {
                "id": str(user.id),
                "email": user.email,
                "name": user.name,
                "tier": user.tier,
                "image": user.image,
            },
            "token": access_token,
        }
    }


@router.get("/me", response_model=dict)
async def get_current_user(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get current authenticated user."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {
        "success": True,
        "data": {
            "id": str(user.id),
            "email": user.email,
            "name": user.name,
            "tier": user.tier,
            "image": user.image,
            "created_at": user.created_at.isoformat(),
        }
    }


@router.get("/verify-token", response_model=dict)
async def verify_token_endpoint(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Debug endpoint to verify token is working."""
    print(f"✅ Token verification successful for user: {user_id}")
    return {
        "success": True,
        "message": "Token is valid",
        "user_id": user_id,
    }

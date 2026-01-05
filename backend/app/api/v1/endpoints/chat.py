from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
import uuid

from app.db.database import get_db
from app.db.models import QAHistory, Roadmap, User
from app.schemas.chat import ChatRequest, ChatResponse, ChatHistoryResponse
from app.core.security import get_current_user_id
from app.services.ai_service import chat_response

router = APIRouter()


@router.post("/message", response_model=dict)
async def send_message(
    request: ChatRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Send a message to the AI assistant."""
    
    # Check user tier for chat limits
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Free tier: limited daily messages
    if user.tier == "free":
        # Count today's messages
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        today_messages = await db.execute(
            select(QAHistory)
            .where(
                QAHistory.user_id == user_id,
                QAHistory.created_at >= today_start
            )
        )
        if len(today_messages.scalars().all()) >= 10:
            raise HTTPException(
                status_code=403,
                detail="Free tier limited to 10 messages per day. Upgrade to Pro for unlimited."
            )
    
    # Get roadmap context if provided
    roadmap_context = None
    if request.roadmap_id:
        roadmap_result = await db.execute(
            select(Roadmap)
            .where(Roadmap.id == request.roadmap_id, Roadmap.user_id == user_id)
        )
        roadmap = roadmap_result.scalar_one_or_none()
        if roadmap:
            roadmap_context = {
                "job_title": roadmap.job_title,
                "completion_percentage": roadmap.completion_percentage,
                "current_phase": "Active",
            }
    
    try:
        # Generate AI response
        response_text = await chat_response(
            message=request.message,
            conversation_history=[
                {"role": msg.role, "content": msg.content}
                for msg in request.conversation_history
            ],
            roadmap_context=roadmap_context
        )
        
        # Save to history
        qa_entry = QAHistory(
            user_id=user_id,
            roadmap_id=request.roadmap_id if request.roadmap_id else None,
            question=request.message,
            answer=response_text,
        )
        db.add(qa_entry)
        await db.commit()
        await db.refresh(qa_entry)
        
        return {
            "success": True,
            "data": {
                "id": str(qa_entry.id),
                "response": response_text,
                "created_at": qa_entry.created_at.isoformat(),
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate response: {str(e)}"
        )


@router.get("/history", response_model=dict)
async def get_chat_history(
    roadmap_id: str = None,
    limit: int = 50,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get chat history for the user."""
    
    query = select(QAHistory).where(QAHistory.user_id == user_id)
    
    if roadmap_id:
        query = query.where(QAHistory.roadmap_id == roadmap_id)
    
    query = query.order_by(QAHistory.created_at.desc()).limit(limit)
    
    result = await db.execute(query)
    history = result.scalars().all()
    
    return {
        "success": True,
        "data": [
            {
                "id": str(h.id),
                "question": h.question,
                "answer": h.answer,
                "roadmap_id": str(h.roadmap_id) if h.roadmap_id else None,
                "created_at": h.created_at.isoformat(),
            }
            for h in reversed(history)
        ]
    }


@router.delete("/history/{message_id}", response_model=dict)
async def delete_message(
    message_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Delete a chat message from history."""
    
    result = await db.execute(
        select(QAHistory)
        .where(QAHistory.id == message_id, QAHistory.user_id == user_id)
    )
    message = result.scalar_one_or_none()
    
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    await db.delete(message)
    await db.commit()
    
    return {"success": True, "message": "Message deleted"}

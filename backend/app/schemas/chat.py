from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ChatMessage(BaseModel):
    role: str  # user, assistant
    content: str


class ChatRequest(BaseModel):
    message: str
    roadmap_id: Optional[str] = None
    conversation_history: List[ChatMessage] = []


class ChatResponse(BaseModel):
    id: str
    response: str
    created_at: datetime


class ChatHistoryResponse(BaseModel):
    id: str
    question: str
    answer: str
    roadmap_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

"""Accountability Partners API endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

from app.db.database import get_db
from app.core.security import get_current_user_id
from app.db.models import User

router = APIRouter()


class PartnerRequest(BaseModel):
    partner_id: str


class PartnerRequestResponse(BaseModel):
    id: str
    from_user_id: str
    to_user_id: str
    status: str
    created_at: str


# In-memory storage for partner requests (in production, use database table)
partner_requests = {}


@router.post("/request", response_model=dict)
async def send_partner_request(
    request: PartnerRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Send an accountability partner request."""
    try:
        # Validate that the partner exists
        partner_result = await db.execute(
            select(User).where(User.id == request.partner_id)
        )
        partner = partner_result.scalar_one_or_none()
        
        if not partner:
            raise HTTPException(status_code=404, detail="User not found")
        
        if request.partner_id == user_id:
            raise HTTPException(status_code=400, detail="Cannot send request to yourself")
        
        # Check if request already exists
        existing_key = f"{user_id}_{request.partner_id}"
        reverse_key = f"{request.partner_id}_{user_id}"
        
        if existing_key in partner_requests or reverse_key in partner_requests:
            return {
                "success": True,
                "data": {
                    "message": "Partner request already exists",
                    "status": "pending"
                }
            }
        
        # Create new request
        request_id = str(uuid.uuid4())
        partner_requests[existing_key] = {
            "id": request_id,
            "from_user_id": user_id,
            "to_user_id": request.partner_id,
            "status": "pending",
            "created_at": datetime.utcnow().isoformat()
        }
        
        return {
            "success": True,
            "data": {
                "id": request_id,
                "message": "Partner request sent successfully",
                "status": "pending"
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error sending partner request: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/requests", response_model=dict)
async def get_partner_requests(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get all partner requests for the current user."""
    try:
        incoming = []
        outgoing = []
        
        for key, req in partner_requests.items():
            if req["to_user_id"] == user_id:
                incoming.append(req)
            elif req["from_user_id"] == user_id:
                outgoing.append(req)
        
        return {
            "success": True,
            "data": {
                "incoming": incoming,
                "outgoing": outgoing
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/respond", response_model=dict)
async def respond_to_request(
    request_id: str,
    accept: bool,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Accept or reject a partner request."""
    try:
        # Find the request
        for key, req in partner_requests.items():
            if req["id"] == request_id and req["to_user_id"] == user_id:
                req["status"] = "accepted" if accept else "rejected"
                return {
                    "success": True,
                    "data": {
                        "message": f"Request {'accepted' if accept else 'rejected'}",
                        "status": req["status"]
                    }
                }
        
        raise HTTPException(status_code=404, detail="Request not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/active", response_model=dict)
async def get_active_partners(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get list of active accountability partners."""
    try:
        partners = []
        
        for key, req in partner_requests.items():
            if req["status"] == "accepted":
                partner_id = None
                if req["from_user_id"] == user_id:
                    partner_id = req["to_user_id"]
                elif req["to_user_id"] == user_id:
                    partner_id = req["from_user_id"]
                
                if partner_id:
                    # Fetch partner info
                    partner_result = await db.execute(
                        select(User).where(User.id == partner_id)
                    )
                    partner = partner_result.scalar_one_or_none()
                    if partner:
                        partners.append({
                            "id": str(partner.id),
                            "name": partner.name or partner.email.split("@")[0],
                            "email": partner.email,
                            "partnership_since": req["created_at"]
                        })
        
        return {
            "success": True,
            "data": partners
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

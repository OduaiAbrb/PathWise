from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import httpx
import hmac
import hashlib
from typing import Optional

from app.db.database import get_db
from app.db.models import User, Payment
from app.core.config import settings
from app.core.security import get_current_user_id

router = APIRouter()


LEMONSQUEEZY_API_URL = "https://api.lemonsqueezy.com/v1"


@router.post("/create-checkout", response_model=dict)
async def create_checkout(
    variant_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Create a LemonSqueezy checkout session."""
    
    # Get user
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{LEMONSQUEEZY_API_URL}/checkouts",
                headers={
                    "Authorization": f"Bearer {settings.LEMONSQUEEZY_API_KEY}",
                    "Content-Type": "application/vnd.api+json",
                    "Accept": "application/vnd.api+json",
                },
                json={
                    "data": {
                        "type": "checkouts",
                        "attributes": {
                            "checkout_data": {
                                "email": user.email,
                                "name": user.name,
                                "custom": {
                                    "user_id": str(user.id),
                                },
                            },
                        },
                        "relationships": {
                            "store": {
                                "data": {
                                    "type": "stores",
                                    "id": settings.LEMONSQUEEZY_STORE_ID,
                                }
                            },
                            "variant": {
                                "data": {
                                    "type": "variants",
                                    "id": variant_id,
                                }
                            },
                        },
                    }
                }
            )
            
            if response.status_code != 201:
                raise HTTPException(
                    status_code=response.status_code,
                    detail="Failed to create checkout"
                )
            
            data = response.json()
            checkout_url = data["data"]["attributes"]["url"]
            
            return {
                "success": True,
                "data": {
                    "checkout_url": checkout_url,
                }
            }
            
    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Payment service error: {str(e)}"
        )


@router.post("/webhook")
async def handle_webhook(
    request: Request,
    x_signature: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db)
):
    """Handle LemonSqueezy webhook events."""
    
    body = await request.body()
    
    # Verify webhook signature
    if settings.LEMONSQUEEZY_WEBHOOK_SECRET:
        signature = hmac.new(
            settings.LEMONSQUEEZY_WEBHOOK_SECRET.encode(),
            body,
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(signature, x_signature or ""):
            raise HTTPException(status_code=401, detail="Invalid signature")
    
    payload = await request.json()
    event_name = payload.get("meta", {}).get("event_name")
    
    if event_name == "order_created":
        await handle_order_created(payload, db)
    elif event_name == "subscription_created":
        await handle_subscription_created(payload, db)
    elif event_name == "subscription_cancelled":
        await handle_subscription_cancelled(payload, db)
    
    return {"success": True}


async def handle_order_created(payload: dict, db: AsyncSession):
    """Handle successful order/payment."""
    
    order_data = payload.get("data", {}).get("attributes", {})
    custom_data = payload.get("meta", {}).get("custom_data", {})
    
    user_id = custom_data.get("user_id")
    if not user_id:
        return
    
    # Get user
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        return
    
    # Determine tier from variant
    variant_id = payload.get("data", {}).get("relationships", {}).get("variant", {}).get("data", {}).get("id")
    tier = "pro"  # Default, could map variant_id to tier
    
    # Update user tier
    user.tier = tier
    
    # Record payment
    payment = Payment(
        user_id=user.id,
        lemon_squeezy_order_id=str(order_data.get("order_number")),
        amount=order_data.get("total", 0),
        currency=order_data.get("currency", "usd").lower(),
        tier=tier,
        status="paid",
    )
    db.add(payment)
    await db.commit()


async def handle_subscription_created(payload: dict, db: AsyncSession):
    """Handle new subscription."""
    # Similar to order_created
    pass


async def handle_subscription_cancelled(payload: dict, db: AsyncSession):
    """Handle subscription cancellation."""
    
    custom_data = payload.get("meta", {}).get("custom_data", {})
    user_id = custom_data.get("user_id")
    
    if not user_id:
        return
    
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if user:
        user.tier = "free"
        await db.commit()


@router.get("/status", response_model=dict)
async def get_subscription_status(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get current user's subscription status."""
    
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get latest payment
    payment_result = await db.execute(
        select(Payment)
        .where(Payment.user_id == user_id)
        .order_by(Payment.created_at.desc())
        .limit(1)
    )
    latest_payment = payment_result.scalar_one_or_none()
    
    return {
        "success": True,
        "data": {
            "tier": user.tier,
            "is_pro": user.tier in ["pro", "enterprise"],
            "latest_payment": {
                "amount": latest_payment.amount if latest_payment else None,
                "date": latest_payment.created_at.isoformat() if latest_payment else None,
            } if latest_payment else None,
        }
    }

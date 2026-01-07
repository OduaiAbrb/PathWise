"""Income tracking and ROI calculator service."""
from typing import List, Optional, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from datetime import datetime, timedelta
import uuid

from app.db.models_extended import IncomeEntry


async def add_income_entry(
    db: AsyncSession,
    user_id: str,
    amount: float,
    source: str,
    entry_type: str,
    date: datetime,
    description: Optional[str] = None
) -> IncomeEntry:
    """Add an income entry."""
    user_uuid = uuid.UUID(user_id)
    
    entry = IncomeEntry(
        user_id=user_uuid,
        amount=amount,
        source=source,
        entry_type=entry_type,
        date=date,
        description=description,
    )
    
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    
    return entry


async def get_income_entries(
    db: AsyncSession,
    user_id: str,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    entry_type: Optional[str] = None
) -> List[IncomeEntry]:
    """Get income entries with filters."""
    user_uuid = uuid.UUID(user_id)
    
    query = select(IncomeEntry).where(IncomeEntry.user_id == user_uuid)
    
    if start_date:
        query = query.where(IncomeEntry.date >= start_date)
    
    if end_date:
        query = query.where(IncomeEntry.date <= end_date)
    
    if entry_type:
        query = query.where(IncomeEntry.entry_type == entry_type)
    
    query = query.order_by(IncomeEntry.date.desc())
    
    result = await db.execute(query)
    return result.scalars().all()


async def calculate_income_stats(
    db: AsyncSession,
    user_id: str,
    months: int = 12
) -> Dict:
    """Calculate income statistics."""
    user_uuid = uuid.UUID(user_id)
    start_date = datetime.utcnow() - timedelta(days=months * 30)
    
    # Get all entries
    result = await db.execute(
        select(IncomeEntry).where(
            and_(
                IncomeEntry.user_id == user_uuid,
                IncomeEntry.date >= start_date
            )
        )
    )
    entries = result.scalars().all()
    
    if not entries:
        return {
            "total_income": 0,
            "total_expenses": 0,
            "net_income": 0,
            "average_monthly": 0,
            "income_sources": {},
            "monthly_breakdown": [],
        }
    
    # Calculate totals
    total_income = sum(e.amount for e in entries if e.entry_type == "income")
    total_expenses = sum(e.amount for e in entries if e.entry_type == "expense")
    net_income = total_income - total_expenses
    
    # Income by source
    income_sources = {}
    for entry in entries:
        if entry.entry_type == "income":
            income_sources[entry.source] = income_sources.get(entry.source, 0) + entry.amount
    
    # Monthly breakdown
    monthly_data = {}
    for entry in entries:
        month_key = entry.date.strftime("%Y-%m")
        if month_key not in monthly_data:
            monthly_data[month_key] = {"income": 0, "expenses": 0}
        
        if entry.entry_type == "income":
            monthly_data[month_key]["income"] += entry.amount
        else:
            monthly_data[month_key]["expenses"] += entry.amount
    
    monthly_breakdown = [
        {
            "month": month,
            "income": data["income"],
            "expenses": data["expenses"],
            "net": data["income"] - data["expenses"],
        }
        for month, data in sorted(monthly_data.items())
    ]
    
    return {
        "total_income": total_income,
        "total_expenses": total_expenses,
        "net_income": net_income,
        "average_monthly": net_income / months if months > 0 else 0,
        "income_sources": income_sources,
        "monthly_breakdown": monthly_breakdown,
    }


def calculate_learning_roi(
    initial_salary: float,
    current_salary: float,
    learning_investment: float,
    months_elapsed: int
) -> Dict:
    """Calculate ROI on learning investment."""
    
    salary_increase = current_salary - initial_salary
    annual_increase = salary_increase * 12
    
    # Simple ROI calculation
    if learning_investment > 0:
        roi_percentage = ((annual_increase - learning_investment) / learning_investment) * 100
    else:
        roi_percentage = 0
    
    # Payback period in months
    if salary_increase > 0:
        payback_months = learning_investment / salary_increase
    else:
        payback_months = float('inf')
    
    # Lifetime value (5 years)
    lifetime_value = salary_increase * 12 * 5
    
    return {
        "initial_salary": initial_salary,
        "current_salary": current_salary,
        "salary_increase": salary_increase,
        "annual_increase": annual_increase,
        "learning_investment": learning_investment,
        "roi_percentage": round(roi_percentage, 2),
        "payback_months": round(payback_months, 1) if payback_months != float('inf') else None,
        "lifetime_value": lifetime_value,
        "months_elapsed": months_elapsed,
        "monthly_increase": salary_increase,
    }


def project_future_income(
    current_salary: float,
    annual_growth_rate: float,
    years: int = 5
) -> List[Dict]:
    """Project future income based on growth rate."""
    
    projections = []
    salary = current_salary
    
    for year in range(1, years + 1):
        salary = salary * (1 + annual_growth_rate / 100)
        projections.append({
            "year": year,
            "projected_salary": round(salary, 2),
            "cumulative_earnings": round(salary * 12, 2),
        })
    
    return projections


def calculate_skill_value(
    skill_name: str,
    market_data: Optional[Dict] = None
) -> Dict:
    """Estimate the market value of a skill."""
    
    # This would integrate with real market data APIs
    # For now, using placeholder data
    
    default_values = {
        "python": {"avg_salary": 95000, "demand": "high", "growth": 15},
        "javascript": {"avg_salary": 85000, "demand": "high", "growth": 12},
        "react": {"avg_salary": 90000, "demand": "high", "growth": 18},
        "machine learning": {"avg_salary": 120000, "demand": "very high", "growth": 25},
        "aws": {"avg_salary": 110000, "demand": "high", "growth": 20},
        "docker": {"avg_salary": 100000, "demand": "high", "growth": 15},
    }
    
    skill_lower = skill_name.lower()
    data = default_values.get(skill_lower, {
        "avg_salary": 75000,
        "demand": "medium",
        "growth": 10
    })
    
    return {
        "skill": skill_name,
        "average_salary": data["avg_salary"],
        "demand_level": data["demand"],
        "growth_rate": data["growth"],
        "estimated_value": f"${data['avg_salary']:,}/year",
    }


def generate_income_report(
    income_stats: Dict,
    roi_data: Dict,
    projections: List[Dict]
) -> Dict:
    """Generate a comprehensive income report."""
    
    return {
        "summary": {
            "current_monthly_income": income_stats.get("average_monthly", 0),
            "total_net_income": income_stats.get("net_income", 0),
            "learning_roi": roi_data.get("roi_percentage", 0),
        },
        "income_breakdown": income_stats.get("income_sources", {}),
        "monthly_trends": income_stats.get("monthly_breakdown", []),
        "roi_analysis": roi_data,
        "future_projections": projections,
        "insights": generate_income_insights(income_stats, roi_data),
    }


def generate_income_insights(income_stats: Dict, roi_data: Dict) -> List[str]:
    """Generate insights from income data."""
    
    insights = []
    
    # ROI insights
    roi = roi_data.get("roi_percentage", 0)
    if roi > 100:
        insights.append(f"🚀 Exceptional ROI of {roi:.1f}%! Your learning investment is paying off big time.")
    elif roi > 50:
        insights.append(f"💰 Great ROI of {roi:.1f}%! You're seeing strong returns on your learning.")
    elif roi > 0:
        insights.append(f"📈 Positive ROI of {roi:.1f}%. Keep learning to increase your earning potential.")
    else:
        insights.append("💡 Focus on high-value skills to improve your ROI.")
    
    # Salary increase insights
    increase = roi_data.get("salary_increase", 0)
    if increase > 0:
        insights.append(f"💵 You've increased your income by ${increase:,.2f}/month!")
    
    # Payback period
    payback = roi_data.get("payback_months")
    if payback and payback < 12:
        insights.append(f"⚡ Fast payback! You'll recover your investment in just {payback:.1f} months.")
    
    # Income diversity
    sources = income_stats.get("income_sources", {})
    if len(sources) > 1:
        insights.append(f"🎯 Good income diversification with {len(sources)} sources.")
    else:
        insights.append("💡 Consider diversifying your income sources for financial stability.")
    
    return insights

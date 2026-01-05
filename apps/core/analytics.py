from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, timedelta
from typing import Dict, List, Any

from apps.accounts.models import User
from apps.bookings.models import Booking
from apps.listings.models import Listing
from apps.accounts.services.authenticate import AccountService
from config.database import get_db

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/dashboard")
async def get_dashboard_analytics(
    period: str = Query("month", regex="^(week|month|year)$"),
    current_user: User = Depends(AccountService.current_user),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Get comprehensive analytics for admin dashboard"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    # Calculate date range based on period
    now = datetime.now()
    if period == "week":
        start_date = now - timedelta(days=7)
    elif period == "month":
        start_date = now - timedelta(days=30)
    else:  # year
        start_date = now - timedelta(days=365)
    
    # Total counts
    total_users = db.query(func.count(User.id)).scalar()
    total_listings = db.query(func.count(Listing.id)).scalar()
    total_bookings = db.query(func.count(Booking.id)).scalar()
    
    # Active users (users who have made bookings)
    active_users = db.query(func.count(func.distinct(Booking.user_id))).scalar()
    
    # Bookings in period
    period_bookings = db.query(func.count(Booking.id))\
        .filter(Booking.created_at >= start_date)\
        .scalar()
    
    # Revenue statistics
    total_revenue = db.query(func.sum(Booking.amount))\
        .filter(Booking.status == 'accepted')\
        .scalar() or 0.0
    
    period_revenue = db.query(func.sum(Booking.amount))\
        .filter(Booking.status == 'accepted', Booking.created_at >= start_date)\
        .scalar() or 0.0
    
    # Pending approvals
    pending_listers = db.query(func.count(User.id))\
        .filter(
            User.role.in_(['hostel', 'coaching', 'library', 'tiffin']),
            User.is_approved_lister == False
        )\
        .scalar()
    
    pending_bookings = db.query(func.count(Booking.id))\
        .filter(Booking.status == 'pending')\
        .scalar()
    
    # Bookings by status
    bookings_by_status = db.query(
        Booking.status,
        func.count(Booking.id).label('count')
    ).group_by(Booking.status).all()
    
    status_breakdown = {status: count for status, count in bookings_by_status}
    
    # Monthly bookings trend (last 12 months for month/year view, last 7 days for week)
    if period == "week":
        # Daily bookings for the last 7 days
        bookings_trend = []
        for i in range(7):
            date = now - timedelta(days=6-i)
            day_start = date.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=1)
            
            count = db.query(func.count(Booking.id))\
                .filter(Booking.created_at >= day_start, Booking.created_at < day_end)\
                .scalar()
            
            bookings_trend.append({
                "label": date.strftime("%a"),
                "value": count
            })
    elif period == "month":
        # Weekly bookings for the last 4 weeks
        bookings_trend = []
        for i in range(4):
            week_start = now - timedelta(days=(3-i)*7 + now.weekday())
            week_end = week_start + timedelta(days=7)
            
            count = db.query(func.count(Booking.id))\
                .filter(Booking.created_at >= week_start, Booking.created_at < week_end)\
                .scalar()
            
            bookings_trend.append({
                "label": f"Week {i+1}",
                "value": count
            })
    else:  # year
        # Monthly bookings for the last 12 months
        bookings_trend = []
        for i in range(12):
            month_date = now - timedelta(days=30*(11-i))
            month = month_date.month
            year = month_date.year
            
            count = db.query(func.count(Booking.id))\
                .filter(
                    extract('month', Booking.created_at) == month,
                    extract('year', Booking.created_at) == year
                )\
                .scalar()
            
            bookings_trend.append({
                "label": month_date.strftime("%b %y"),
                "value": count
            })
    
    # User growth trend (similar logic)
    if period == "week":
        user_growth = []
        for i in range(7):
            date = now - timedelta(days=6-i)
            day_start = date.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=1)
            
            count = db.query(func.count(User.id))\
                .filter(User.date_joined >= day_start, User.date_joined < day_end)\
                .scalar()
            
            user_growth.append({
                "label": date.strftime("%a"),
                "value": count
            })
    elif period == "month":
        user_growth = []
        for i in range(4):
            week_start = now - timedelta(days=(3-i)*7 + now.weekday())
            week_end = week_start + timedelta(days=7)
            
            count = db.query(func.count(User.id))\
                .filter(User.date_joined >= week_start, User.date_joined < week_end)\
                .scalar()
            
            user_growth.append({
                "label": f"Week {i+1}",
                "value": count
            })
    else:  # year
        user_growth = []
        for i in range(12):
            month_date = now - timedelta(days=30*(11-i))
            month = month_date.month
            year = month_date.year
            
            count = db.query(func.count(User.id))\
                .filter(
                    extract('month', User.date_joined) == month,
                    extract('year', User.date_joined) == year
                )\
                .scalar()
            
            user_growth.append({
                "label": month_date.strftime("%b %y"),
                "value": count
            })
    
    # Revenue trend
    if period == "week":
        revenue_trend = []
        for i in range(7):
            date = now - timedelta(days=6-i)
            day_start = date.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=1)
            
            revenue = db.query(func.sum(Booking.amount))\
                .filter(
                    Booking.status == 'accepted',
                    Booking.created_at >= day_start,
                    Booking.created_at < day_end
                )\
                .scalar() or 0.0
            
            revenue_trend.append({
                "label": date.strftime("%a"),
                "value": float(revenue)
            })
    elif period == "month":
        revenue_trend = []
        for i in range(4):
            week_start = now - timedelta(days=(3-i)*7 + now.weekday())
            week_end = week_start + timedelta(days=7)
            
            revenue = db.query(func.sum(Booking.amount))\
                .filter(
                    Booking.status == 'accepted',
                    Booking.created_at >= week_start,
                    Booking.created_at < week_end
                )\
                .scalar() or 0.0
            
            revenue_trend.append({
                "label": f"Week {i+1}",
                "value": float(revenue)
            })
    else:  # year
        revenue_trend = []
        for i in range(12):
            month_date = now - timedelta(days=30*(11-i))
            month = month_date.month
            year = month_date.year
            
            revenue = db.query(func.sum(Booking.amount))\
                .filter(
                    Booking.status == 'accepted',
                    extract('month', Booking.created_at) == month,
                    extract('year', Booking.created_at) == year
                )\
                .scalar() or 0.0
            
            revenue_trend.append({
                "label": month_date.strftime("%b %y"),
                "value": float(revenue)
            })
    
    # Listings by type
    listings_by_type = db.query(
        Listing.type,
        func.count(Listing.id).label('count')
    ).group_by(Listing.type).all()
    
    type_breakdown = {ltype: count for ltype, count in listings_by_type}
    
    return {
        "overview": {
            "total_users": total_users,
            "total_listings": total_listings,
            "total_bookings": total_bookings,
            "active_users": active_users,
            "total_revenue": float(total_revenue),
            "period_revenue": float(period_revenue),
            "pending_listers": pending_listers,
            "pending_bookings": pending_bookings,
        },
        "bookings_by_status": status_breakdown,
        "listings_by_type": type_breakdown,
        "trends": {
            "bookings": bookings_trend,
            "users": user_growth,
            "revenue": revenue_trend,
        },
        "period": period,
    }


@router.get("/owner")
async def get_owner_analytics(
    period: str = Query("month", regex="^(week|month|year)$"),
    current_user: User = Depends(AccountService.current_user),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Get comprehensive analytics for listing owners (hostel, coaching, library, tiffin)"""
    if current_user.role not in ['hostel', 'coaching', 'library', 'tiffin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Listing owner access required"
        )
    
    # Calculate date range based on period
    now = datetime.now()
    if period == "week":
        start_date = now - timedelta(days=7)
    elif period == "month":
        start_date = now - timedelta(days=30)
    else:  # year
        start_date = now - timedelta(days=365)
    
    # Get owner's listings
    owner_listings = db.query(Listing).filter(Listing.owner_id == current_user.id).all()
    listing_ids = [listing.id for listing in owner_listings]
    
    # Total counts for this owner
    total_listings = len(owner_listings)
    active_listings = len([l for l in owner_listings if l.id])  # Assuming active by default
    
    # Bookings for owner's listings
    total_bookings = db.query(func.count(Booking.id))\
        .filter(Booking.listing_id.in_(listing_ids) if listing_ids else False)\
        .scalar() or 0
    
    # Period bookings
    period_bookings = db.query(func.count(Booking.id))\
        .filter(
            Booking.listing_id.in_(listing_ids) if listing_ids else False,
            Booking.created_at >= start_date
        )\
        .scalar() or 0
    
    # Revenue statistics
    total_revenue = db.query(func.sum(Booking.amount))\
        .filter(
            Booking.status == 'accepted',
            Booking.listing_id.in_(listing_ids) if listing_ids else False
        )\
        .scalar() or 0.0
    
    period_revenue = db.query(func.sum(Booking.amount))\
        .filter(
            Booking.status == 'accepted',
            Booking.created_at >= start_date,
            Booking.listing_id.in_(listing_ids) if listing_ids else False
        )\
        .scalar() or 0.0
    
    # Pending bookings
    pending_bookings = db.query(func.count(Booking.id))\
        .filter(
            Booking.status == 'pending',
            Booking.listing_id.in_(listing_ids) if listing_ids else False
        )\
        .scalar() or 0
    
    # Unique customers
    unique_customers = db.query(func.count(func.distinct(Booking.user_id)))\
        .filter(
            Booking.listing_id.in_(listing_ids) if listing_ids else False
        )\
        .scalar() or 0
    
    # Bookings by status
    bookings_by_status = db.query(
        Booking.status,
        func.count(Booking.id).label('count')
    ).filter(
        Booking.listing_id.in_(listing_ids) if listing_ids else False
    ).group_by(Booking.status).all()
    
    status_breakdown = {status: count for status, count in bookings_by_status}
    
    # Bookings trend
    if period == "week":
        bookings_trend = []
        for i in range(7):
            date = now - timedelta(days=6-i)
            day_start = date.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=1)
            
            count = db.query(func.count(Booking.id))\
                .filter(
                    Booking.created_at >= day_start,
                    Booking.created_at < day_end,
                    Booking.listing_id.in_(listing_ids) if listing_ids else False
                )\
                .scalar() or 0
            
            bookings_trend.append({
                "label": date.strftime("%a"),
                "value": count
            })
    elif period == "month":
        bookings_trend = []
        for i in range(4):
            week_start = now - timedelta(days=(3-i)*7 + now.weekday())
            week_end = week_start + timedelta(days=7)
            
            count = db.query(func.count(Booking.id))\
                .filter(
                    Booking.created_at >= week_start,
                    Booking.created_at < week_end,
                    Booking.listing_id.in_(listing_ids) if listing_ids else False
                )\
                .scalar() or 0
            
            bookings_trend.append({
                "label": f"Week {i+1}",
                "value": count
            })
    else:  # year
        bookings_trend = []
        for i in range(12):
            month_date = now - timedelta(days=30*(11-i))
            month = month_date.month
            year = month_date.year
            
            count = db.query(func.count(Booking.id))\
                .filter(
                    extract('month', Booking.created_at) == month,
                    extract('year', Booking.created_at) == year,
                    Booking.listing_id.in_(listing_ids) if listing_ids else False
                )\
                .scalar() or 0
            
            bookings_trend.append({
                "label": month_date.strftime("%b %y"),
                "value": count
            })
    
    # Revenue trend
    if period == "week":
        revenue_trend = []
        for i in range(7):
            date = now - timedelta(days=6-i)
            day_start = date.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=1)
            
            revenue = db.query(func.sum(Booking.amount))\
                .filter(
                    Booking.status == 'accepted',
                    Booking.created_at >= day_start,
                    Booking.created_at < day_end,
                    Booking.listing_id.in_(listing_ids) if listing_ids else False
                )\
                .scalar() or 0.0
            
            revenue_trend.append({
                "label": date.strftime("%a"),
                "value": float(revenue)
            })
    elif period == "month":
        revenue_trend = []
        for i in range(4):
            week_start = now - timedelta(days=(3-i)*7 + now.weekday())
            week_end = week_start + timedelta(days=7)
            
            revenue = db.query(func.sum(Booking.amount))\
                .filter(
                    Booking.status == 'accepted',
                    Booking.created_at >= week_start,
                    Booking.created_at < week_end,
                    Booking.listing_id.in_(listing_ids) if listing_ids else False
                )\
                .scalar() or 0.0
            
            revenue_trend.append({
                "label": f"Week {i+1}",
                "value": float(revenue)
            })
    else:  # year
        revenue_trend = []
        for i in range(12):
            month_date = now - timedelta(days=30*(11-i))
            month = month_date.month
            year = month_date.year
            
            revenue = db.query(func.sum(Booking.amount))\
                .filter(
                    Booking.status == 'accepted',
                    extract('month', Booking.created_at) == month,
                    extract('year', Booking.created_at) == year,
                    Booking.listing_id.in_(listing_ids) if listing_ids else False
                )\
                .scalar() or 0.0
            
            revenue_trend.append({
                "label": month_date.strftime("%b %y"),
                "value": float(revenue)
            })
    
    # Average booking value
    avg_booking_value = (total_revenue / total_bookings) if total_bookings > 0 else 0.0
    
    return {
        "overview": {
            "total_listings": total_listings,
            "active_listings": active_listings,
            "total_bookings": total_bookings,
            "period_bookings": period_bookings,
            "unique_customers": unique_customers,
            "total_revenue": float(total_revenue),
            "period_revenue": float(period_revenue),
            "pending_bookings": pending_bookings,
            "avg_booking_value": float(avg_booking_value),
        },
        "bookings_by_status": status_breakdown,
        "trends": {
            "bookings": bookings_trend,
            "revenue": revenue_trend,
        },
        "period": period,
    }

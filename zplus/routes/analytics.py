from fastapi import APIRouter, HTTPException, Query
from zplus.services.analytics import get_full_analysis, get_user_location
from datetime import date, timedelta
from typing import Optional

router = APIRouter()

@router.get("/farm-analytics")
async def get_farm_analytics(
    lat: Optional[float] = Query(None),
    lon: Optional[float] = Query(None),
    region: str = "My Farm",
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    if lat is None or lon is None:
        # Fallback to auto location if coords are not provided
        lat_auto, lon_auto, city = get_user_location()
        if lat_auto and lon_auto:
            lat, lon = lat_auto, lon_auto
            if city: region = city
        else:
            # Default to Delhi if location fails and no coords given
            lat, lon = 28.6139, 77.2090
    
    # Default dates if not provided
    if not end_date:
        end_date = date.today().isoformat()
    if not start_date:
        start_date = (date.today() - timedelta(days=365)).isoformat()
    
    try:
        analysis = get_full_analysis(lat, lon, region, start_date, end_date)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to run farm analysis: {str(e)}")

@router.get("/user-location")
async def get_location():
    lat, lon, city = get_user_location()
    if lat and lon:
        return {"latitude": lat, "longitude": lon, "city": city}
    raise HTTPException(status_code=503, detail="Could not detect location automatically.")

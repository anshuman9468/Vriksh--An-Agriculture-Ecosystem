from fastapi import APIRouter, HTTPException
import logging

from models.schemas import PreHarvestRequest, PreHarvestResponse
from services.preharvest_model import get_preharvest_model


logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/predict-yield", response_model=PreHarvestResponse)
async def predict_yield(payload: PreHarvestRequest) -> PreHarvestResponse:
    """
    Run pre-harvest yield prediction using the trained Vriksh 1 model.
    """
    model = get_preharvest_model()
    if model is None:
        logger.error("Pre-harvest model is not available")
        raise HTTPException(
            status_code=503,
            detail="Pre-harvest prediction model is currently unavailable.",
        )

    try:
        features = [
            payload.crop,
            payload.area,
            payload.soil_quality,
            payload.rainfall,
        ]
        prediction = model.predict([features])[0]
    except Exception as exc:  # pragma: no cover - defensive
        logger.exception("Failed to run pre-harvest prediction")
        raise HTTPException(
            status_code=500,
            detail="Failed to compute yield prediction.",
        ) from exc

    predicted_yield = float(prediction)
    expected_revenue = predicted_yield * payload.expected_price_per_unit

    return PreHarvestResponse(
        predicted_yield=predicted_yield,
        expected_revenue=expected_revenue,
    )


from fastapi import APIRouter, HTTPException
import logging

from models.schemas import RiskResponse
from services.file_reader import read_risk_output


logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/risk/{harvest_id}", response_model=RiskResponse)
async def get_risk(harvest_id: int) -> RiskResponse:
    try:
        records = read_risk_output()
    except FileNotFoundError:
        logger.error("risk_output.json not found")
        raise HTTPException(
            status_code=503,
            detail="Risk data is not available yet.",
        )
    except Exception as exc:  # pragma: no cover - defensive
        logger.exception("Failed to read risk output")
        raise HTTPException(
            status_code=500,
            detail="Failed to load risk data.",
        ) from exc

    for record in records:
        if int(record.get("harvest_id")) == harvest_id:
            return RiskResponse(**record)

    raise HTTPException(
        status_code=404,
        detail=f"Risk score not found for harvest_id={harvest_id}.",
    )

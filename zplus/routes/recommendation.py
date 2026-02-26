from fastapi import APIRouter, HTTPException
import logging
from typing import List

from models.schemas import BestMarketResponse, Alert
from services.file_reader import read_best_market
from services.notifier import derive_alerts_from_risk


logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/best-market/{harvest_id}", response_model=BestMarketResponse)
async def get_best_market(harvest_id: int) -> BestMarketResponse:
    try:
        records = read_best_market()
    except FileNotFoundError:
        logger.error("best_market.json not found")
        raise HTTPException(
            status_code=503,
            detail="Best market recommendations are not available yet.",
        )
    except Exception as exc:  # pragma: no cover - defensive
        logger.exception("Failed to read best market data")
        raise HTTPException(
            status_code=500,
            detail="Failed to load best market data.",
        ) from exc

    for record in records:
        if int(record.get("harvest_id")) == harvest_id:
            return BestMarketResponse(**record)

    raise HTTPException(
        status_code=404,
        detail=f"Best market recommendation not found for harvest_id={harvest_id}.",
    )


@router.get("/alerts", response_model=List[Alert])
async def get_alerts() -> List[Alert]:
    try:
        alerts = derive_alerts_from_risk()
    except FileNotFoundError:
        logger.warning("risk_output.json not found while deriving alerts")
        return []
    except Exception as exc:  # pragma: no cover - defensive
        logger.exception("Failed to derive alerts from risk data")
        raise HTTPException(
            status_code=500,
            detail="Failed to derive alerts.",
        ) from exc

    return alerts


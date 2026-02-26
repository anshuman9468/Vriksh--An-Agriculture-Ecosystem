from fastapi import APIRouter, HTTPException
import logging
from typing import List

from models.schemas import MarketPrice
from services.file_reader import read_market_prices


logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/market-prices", response_model=List[MarketPrice])
async def get_market_prices() -> List[MarketPrice]:
    try:
        records = read_market_prices()
    except FileNotFoundError:
        logger.error("market_prices.csv not found")
        raise HTTPException(
            status_code=503,
            detail="Market prices data is not available yet.",
        )
    except Exception as exc:  # pragma: no cover - defensive
        logger.exception("Failed to read market prices")
        raise HTTPException(
            status_code=500,
            detail="Failed to load market prices.",
        ) from exc

    return [MarketPrice(**record) for record in records]

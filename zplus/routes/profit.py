from fastapi import APIRouter, HTTPException
import logging
from typing import List

from models.schemas import ProfitRecord
from services.file_reader import read_profit_output


logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/profit", response_model=List[ProfitRecord])
async def get_profit() -> List[ProfitRecord]:
    try:
        records = read_profit_output()
    except FileNotFoundError:
        logger.error("profit_output.json not found")
        raise HTTPException(
            status_code=503,
            detail="Profit data is not available yet.",
        )
    except Exception as exc:  # pragma: no cover - defensive
        logger.exception("Failed to read profit output")
        raise HTTPException(
            status_code=500,
            detail="Failed to load profit data.",
        ) from exc

    return [ProfitRecord(**record) for record in records]


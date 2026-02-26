import logging
from pathlib import Path
from typing import Any, Optional

import joblib


logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "models" / "preharvest_model.pkl"

_MODEL: Optional[Any] = None


def get_preharvest_model() -> Optional[Any]:
    """
    Lazily load and cache the pre-harvest prediction model.

    The actual model artifact should be exported from Vriksh 1 and placed at:
    `models/preharvest_model.pkl`.
    """
    global _MODEL
    if _MODEL is not None:
        return _MODEL

    if not MODEL_PATH.exists():
        logger.error("Pre-harvest model file not found at %s", MODEL_PATH)
        return None

    try:
        _MODEL = joblib.load(MODEL_PATH)
        logger.info("Pre-harvest model loaded from %s", MODEL_PATH)
    except Exception as exc:  # pragma: no cover - defensive
        logger.exception("Failed to load pre-harvest model")
        _MODEL = None
        return None

    return _MODEL


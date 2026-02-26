import csv
import json
import logging
from pathlib import Path
from typing import Any, Dict, List


logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"


def _ensure_data_dir() -> Path:
    if not DATA_DIR.exists():
        logger.warning("Data directory %s does not exist", DATA_DIR)
    return DATA_DIR


import requests

def read_market_prices() -> List[Dict[str, Any]]:
    """Fetch market prices from the live API."""
    try:
        response = requests.get("http://localhost:5005/data", timeout=5)
        response.raise_for_status()
        data = response.json()
        records = data.get("records", [])
        
        rows: List[Dict[str, Any]] = []
        for row in records:
            try:
                price_val = float(row.get("modal_price", 0))
            except (TypeError, ValueError):
                price_val = 0.0
                
            rows.append({
                "crop": row.get("commodity", ""),
                "market": row.get("market", ""),
                "price": price_val
            })
        return rows
    except Exception as e:
        logger.error(f"Failed to fetch market prices from API: {e}")
        # Return empty list as fallback instead of crashing
        return []



def _read_json_list(filename: str) -> List[Dict[str, Any]]:
    data_dir = _ensure_data_dir()
    path = data_dir / filename
    if not path.exists():
        raise FileNotFoundError(path)

    with path.open(encoding="utf-8") as f:
        data = json.load(f)

    if isinstance(data, dict):
        return [data]
    if isinstance(data, list):
        return data

    raise ValueError(f"Unexpected JSON structure in {filename}")


def read_profit_output() -> List[Dict[str, Any]]:
    records = _read_json_list("profit_output.json")
    for record in records:
        if "harvest_id" in record:
            record["harvest_id"] = int(record["harvest_id"])
        if "net_profit" in record:
            record["net_profit"] = float(record["net_profit"])
    return records


def read_best_market() -> List[Dict[str, Any]]:
    records = _read_json_list("best_market.json")
    for record in records:
        if "harvest_id" in record:
            record["harvest_id"] = int(record["harvest_id"])
        if "max_profit" in record:
            record["max_profit"] = float(record["max_profit"])
    return records


def read_risk_output() -> List[Dict[str, Any]]:
    records = _read_json_list("risk_output.json")
    for record in records:
        if "harvest_id" in record:
            record["harvest_id"] = int(record["harvest_id"])
        if "risk_score" in record:
            record["risk_score"] = int(record["risk_score"])
    return records

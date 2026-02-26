from typing import List, Optional

from pydantic import BaseModel, Field, ConfigDict


class PreHarvestRequest(BaseModel):
    crop: str = Field(..., description="Name of the crop, e.g., 'Mustard'.")
    area: float = Field(..., gt=0, description="Cultivated area in hectares.")
    soil_quality: int = Field(
        ..., ge=1, le=10, description="Soil quality score on a 1–10 scale."
    )
    rainfall: float = Field(
        ..., ge=0, description="Seasonal rainfall in millimeters for the crop cycle."
    )
    expected_price_per_unit: float = Field(
        1.0,
        ge=0,
        description="Expected selling price per yield unit used to estimate revenue.",
    )


class PreHarvestResponse(BaseModel):
    predicted_yield: float = Field(..., description="Predicted yield (units).")
    expected_revenue: float = Field(..., description="Expected revenue in currency.")


class MarketPrice(BaseModel):
    crop: str
    market: str
    price: float


class ProfitRecord(BaseModel):
    harvest_id: int
    market: str
    net_profit: float


class BestMarketResponse(BaseModel):
    harvest_id: int
    best_market: str
    max_profit: float


class RiskResponse(BaseModel):
    harvest_id: int
    risk_score: int = Field(..., ge=0, le=100)
    risk_level: str


class Alert(BaseModel):
    type: str
    harvest_id: int
    message: str
    related_markets: Optional[List[str]] = None

    model_config = ConfigDict(extra="ignore")


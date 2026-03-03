from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

from datetime import datetime, timedelta

class TransportStatus(BaseModel):
    transport_id: str
    status: str
    current_lat: float
    current_lng: float
    destination: str
    eta: str
    confidence_score: float
    delay_minutes: int
    tracking_mode: str
    last_update: str

@app.get("/transport-status/{transport_id}")
async def get_transport_status(transport_id: str):
    # Mock transport data with proper ISO ETA
    future_eta = datetime.now() + timedelta(minutes=45)
    return {
        "transport_id": transport_id,
        "status": "IN TRANSIT",
        "current_lat": 28.7041 + (random.random() - 0.5) * 0.01,
        "current_lng": 77.1025 + (random.random() - 0.5) * 0.01,
        "destination": "Delhi Azadpur Mandi",
        "eta": future_eta.isoformat(),
        "confidence_score": 0.92,
        "delay_minutes": 5,
        "tracking_mode": "REAL-TIME",
        "last_update": datetime.now().isoformat()
    }

@app.get("/health")
async def health():
    return {"status": "ok"}

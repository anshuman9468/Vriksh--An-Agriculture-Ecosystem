from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import json

app = FastAPI(title="Vriksh 2.0 MVP Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"


def read_jsonlines_file(filename: str):
    """Read a JSON Lines file (one JSON object per line) as a list of dicts."""
    file_path = DATA_DIR / filename
    if not file_path.exists():
        return []
    records = []
    with open(file_path, "r") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                records.append(json.loads(line))
            except json.JSONDecodeError:
                continue # Skip partial/corrupt lines
    return records


import requests

HUB_BASE_URL = "http://localhost:5005"

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/profit")
def get_profit():
    try:
        r = requests.get(f"{HUB_BASE_URL}/profit", timeout=2)
        return r.json()
    except:
        return []

@app.get("/best-market/{harvest_id}")
def get_best_market(harvest_id: int):
    try:
        r = requests.get(f"{HUB_BASE_URL}/best-market/{harvest_id}", timeout=2)
        data = r.json()
        if data: return data
    except: pass
    raise HTTPException(status_code=404, detail="Harvest not found.")

@app.get("/risk/{harvest_id}")
def get_risk(harvest_id: int):
    try:
        r = requests.get(f"{HUB_BASE_URL}/risk/{harvest_id}", timeout=2)
        data = r.json()
        if data: return data
    except: pass
    raise HTTPException(status_code=404, detail="Risk data not found.")

@app.get("/risk-breakdown/{harvest_id}")
def get_risk_breakdown(harvest_id: int):
    # For now, just return the risk if available
    try:
        r = requests.get(f"{HUB_BASE_URL}/risk/{harvest_id}", timeout=2)
        return [r.json()]
    except:
        return []

import subprocess
import os

@app.post("/start-pre-production")
def start_pre_production():
    """Start the Pre-Production services and open the project locally."""
    BASE_PROJECT_DIR = "/home/anshumandutta/Pathway_Vriksh"
    PRE_PROD_DIR = os.path.join(BASE_PROJECT_DIR, "VRIKSH-AI-Powered-Smart-Agriculture-Platform")
    PRE_PROD_BACKEND_DIR = os.path.join(PRE_PROD_DIR, "backend")
    PRE_PROD_VENV_PYTHON = os.path.join(PRE_PROD_BACKEND_DIR, ".venv/bin/python")

    # Start Backend if not already running on port 5001
    try:
        subprocess.run(f"lsof -i :5001", shell=True, check=True, stdout=subprocess.DEVNULL)
        print("Pre-Prod Backend already running.")
    except subprocess.CalledProcessError:
        print("Starting Pre-Prod Backend...")
        subprocess.Popen([PRE_PROD_VENV_PYTHON, "app.py"], cwd=PRE_PROD_BACKEND_DIR)

    # Start Frontend if not already running on port 3000
    try:
        subprocess.run(f"lsof -i :3000", shell=True, check=True, stdout=subprocess.DEVNULL)
        print("Pre-Prod Frontend already running.")
    except subprocess.CalledProcessError:
        print("Starting Pre-Prod Frontend...")
        subprocess.Popen(["npm", "run", "dev"], cwd=PRE_PROD_DIR)

    # In a local environment, we can also open the folder and browser
    try:
        # Open folder in default file explorer or editor
        subprocess.Popen(["xdg-open", PRE_PROD_DIR])
        # Open browser to the site (optional, as the button also redirects)
        # subprocess.Popen(["xdg-open", "http://localhost:3000"])
    except:
        pass

    return {"status": "started"}

@app.get("/market/market-prices")
def get_market_prices():
    try:
        r = requests.get(f"{HUB_BASE_URL}/market-prices", timeout=2)
        return r.json()
    except:
        return []


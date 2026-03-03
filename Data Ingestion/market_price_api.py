import requests
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("API_KEY")

def fetch_data():
    url = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"

    params = {
        "api-key": API_KEY,
        "format": "json",
        "limit": 1000
    }

    if not API_KEY:
        print("WARNING: API_KEY not found in environment variables.", flush=True)

    response = requests.get(url, params=params, timeout=10)
    response.raise_for_status()

    data = response.json()

    return data["records"]
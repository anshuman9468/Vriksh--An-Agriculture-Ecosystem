from flask import Flask, jsonify, request
import requests
from market_price_api import fetch_data
import threading
import time

app = Flask(__name__)

# Pathway's Incoming Connector (we will configure this in stream_engine)
PATHWAY_INCOMING_URL = "http://localhost:8666/market-data"

# In-memory storage (Data Hub Mode)
current_market_data = [] # For the live table
results_profit = []
results_best_market = {}
results_risk = {}

def gov_api_poller():
    global current_market_data
    while True:
        try:
            print("DATA HUB: Calling Gov API...", flush=True)
            records = fetch_data()
            if records:
                current_market_data = records
                print(f"DATA HUB: Fetched {len(records)} records. Pushing to Pathway...", flush=True)
                # Send to Pathway
                try:
                    requests.post(PATHWAY_INCOMING_URL, json={"records": records}, timeout=2)
                except Exception as e:
                    print(f"DATA HUB Warning: Pathway not ready or unreachable at {PATHWAY_INCOMING_URL}")
        except Exception as e:
            print(f"DATA HUB ERROR: {e}")
            # Mock data push so Pathway has something to do
            mock_records = [
                {"commodity": "Wheat", "market": "Delhi Azadpur", "modal_price": "2300"},
                {"commodity": "Wheat", "market": "Nagod APMC", "modal_price": "2150"},
                {"commodity": "Mustard", "market": "Sabalgarh APMC", "modal_price": "5200"},
            ]
            current_market_data = mock_records
            try:
                requests.post(PATHWAY_INCOMING_URL, json={"records": mock_records}, timeout=2)
            except: pass
            
        time.sleep(10) # Live updates every 10s

# --- Pathway Result Sinks ---

@app.route("/results/push-profit", methods=["POST"])
def push_profit():
    # Each row from Pathway is a dict
    results_profit.append(request.json)
    if len(results_profit) > 50: results_profit.pop(0)
    return jsonify({"status": "ok"})

@app.route("/results/push-best-market", methods=["POST"])
def push_best_market():
    data = request.json
    hid = str(data.get("harvest_id"))
    results_best_market[hid] = data
    return jsonify({"status": "ok"})

@app.route("/results/push-risk", methods=["POST"])
def push_risk():
    data = request.json
    hid = str(data.get("harvest_id"))
    results_risk[hid] = data
    return jsonify({"status": "ok"})

# --- Generic API endpoints for Frontend/Backend ---

@app.route("/market-prices")
def get_market_data():
    # Return formatted for the Frontend
    rows = []
    for r in current_market_data:
        try:
            # More robust parsing for strings-in-strings
            raw_price = r.get("modal_price", "0")
            price_str = str(raw_price).strip().strip('"')
            price = float(price_str) if price_str else 0.0
            
            rows.append({
                "crop": str(r.get("commodity", "")).strip().strip('"'),
                "market": str(r.get("market", "")).strip().strip('"'),
                "price": price
            })
        except Exception as e:
            print(f"DATA HUB Error parsing record: {r} - {e}", flush=True)
            continue
    return jsonify(rows)

@app.route("/profit")
def get_results_profit():
    return jsonify(results_profit)

@app.route("/best-market/<harvest_id>")
def get_best_market(harvest_id):
    return jsonify(results_best_market.get(str(harvest_id), {}))

@app.route("/risk/<harvest_id>")
def get_results_risk(harvest_id):
    return jsonify(results_risk.get(str(harvest_id), {}))

if __name__ == "__main__":
    threading.Thread(target=gov_api_poller, daemon=True).start()
    app.run(port=5005, host="0.0.0.0")


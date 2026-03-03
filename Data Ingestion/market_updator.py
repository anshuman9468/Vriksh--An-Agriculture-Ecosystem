from flask import Flask, jsonify, request
import requests
import threading
import time
import os
import csv

app = Flask(__name__)

# Pathway's Incoming Connector
PATHWAY_INCOMING_URL = "http://localhost:8666/market-data"
CSV_PATH = "../data/market_prices.csv"

# In-memory storage (Data Hub Mode)
current_market_data = [] 
results_profit = []
results_best_market = {}
results_risk = {}

def load_from_csv():
    global current_market_data
    if not os.path.exists(CSV_PATH):
        return
    try:
        with open(CSV_PATH, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Map CSV headers back to API style if needed
                current_market_data.append({
                    "commodity": row.get("crop", row.get("commodity")),
                    "market": row.get("market"),
                    "modal_price": row.get("price", row.get("modal_price", "0"))
                })
        print(f"DATA HUB: Loaded {len(current_market_data)} records from {CSV_PATH}", flush=True)
        
        # Push historic data to Pathway on startup so it can process right away
        if current_market_data:
            try:
                # We send in batches of 100 to avoid huge requests
                for i in range(0, len(current_market_data), 100):
                    batch = current_market_data[i:i+100]
                    requests.post(PATHWAY_INCOMING_URL, json={"records": batch}, timeout=1)
                print(f"DATA HUB: Bootstrapped Pathway with {len(current_market_data)} records", flush=True)
            except: 
                print("DATA HUB: Failed to push bootstrap data to Pathway (Stream might not be ready)", flush=True)
    except Exception as e:
        print(f"DATA HUB: CSV load failed: {e}", flush=True)

def save_to_csv():
    global current_market_data
    try:
        os.makedirs(os.path.dirname(CSV_PATH), exist_ok=True)
        with open(CSV_PATH, 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=["crop", "market", "price"])
            writer.writeheader()
            seen = set()
            for r in current_market_data:
                key = (str(r.get("commodity")).lower(), str(r.get("market")).lower())
                if key not in seen:
                    writer.writerow({
                        "crop": r.get("commodity"),
                        "market": r.get("market"),
                        "price": r.get("modal_price")
                    })
                    seen.add(key)
    except Exception as e:
        print(f"DATA HUB: CSV save failed: {e}", flush=True)

def gov_api_poller():
    global current_market_data
    while True:
        try:
            fetch_and_merge(None)
        except Exception as e:
            print(f"DATA HUB POLLER ERROR: {e}", flush=True)
        time.sleep(30) # Poll all crops every 30s

def fetch_and_merge(specific_crop=None):
    global current_market_data
    try:
        print(f"DATA HUB: Fetching from Gov API (Crop: {specific_crop or 'All'})...", flush=True)
        from market_price_api import API_KEY
        url = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
        params = {
            "api-key": API_KEY,
            "format": "json",
            "limit": 1000 if not specific_crop else 100
        }
        if specific_crop:
            params["filters[commodity]"] = specific_crop
        
        response = requests.get(url, params=params, timeout=15)
        records = response.json().get("records", [])
        
        if records:
            # Merge into cache
            existing_keys = set((r['commodity'].lower(), r['market'].lower()) for r in current_market_data)
            new_count = 0
            for r in records:
                if (r['commodity'].lower(), r['market'].lower()) not in existing_keys:
                    current_market_data.append(r)
                    new_count += 1
            
            if len(current_market_data) > 3000:
                current_market_data = current_market_data[-3000:]
            
            print(f"DATA HUB: Merged {new_count} new records. Total cache: {len(current_market_data)}", flush=True)
            if new_count > 0:
                save_to_csv()
            
            # Send to Pathway
            try:
                requests.post(PATHWAY_INCOMING_URL, json={"records": records}, timeout=2)
            except: pass
    except Exception as e:
        print(f"DATA HUB FETCH ERROR: {e}", flush=True)

# --- CORS and Metadata ---
@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "*"
    return response

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
    print(f"DATA HUB: Received Best Market for ID {hid}: {data.get('best_market')}", flush=True)
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
    crop_filter = request.args.get("crop")
    if crop_filter:
        # Check if we already have some recent data for this crop
        has_data = any(crop_filter.lower() in str(r.get("commodity", "")).lower() for r in current_market_data)
        if not has_data:
            # On-demand fetch (Synchronous for the first time or if empty)
            fetch_and_merge(crop_filter)
            
    # Return formatted for the Frontend
    rows = []
    for r in current_market_data:
        try:
            # Handle both Gov API (commodity/modal_price) and CSV (crop/price)
            cmdty = str(r.get("commodity", r.get("crop", ""))).strip().strip('"')
            raw_price = r.get("modal_price", r.get("price", "0"))
            
            price_str = str(raw_price).strip().strip('"')
            price = float(price_str) if price_str else 0.0
            
            rows.append({
                "crop": cmdty,
                "market": str(r.get("market", "")).strip().strip('"'),
                "price": price
            })
        except Exception as e:
            continue
    
    # Filter by crop if provided, to keep it snappy for the frontend
    if crop_filter:
        rows = [r for r in rows if crop_filter.lower() in r["crop"].lower()]
        
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
    load_from_csv() # Bootstrap with historic data
    threading.Thread(target=gov_api_poller, daemon=True).start()
    app.run(port=5005, host="0.0.0.0", debug=False)


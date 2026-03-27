# 🌱 VRIKSH 2.0  
## Real-Time Agricultural Intelligence System (Powered by Pathway)

Vriksh 2.0 is a **real-time post-harvest intelligence platform** built using the **Pathway streaming framework**.

It continuously ingests live mandi price data, computes:

- 💰 Net Profit per market  
- 📍 Best Market Recommendation  
- ⚠ Risk Score & Classification  

And automatically updates results whenever new data arrives.

> ⚡ If your system does not update automatically when new data arrives, it is not a Pathway project.

---

# 🚀 Key Features

## 🌾 1. Real-Time Streaming Engine
- Uses `pw.io.csv.read(mode="streaming")`
- Detects new data automatically
- No restart required
- No cron jobs
- No batch processing

## 💰 2. Profit Intelligence
- Computes:
- Net Profit = (Price × Quantity) - Transport Cost - Commission
- - Recomputes instantly when market price updates

## 📍 3. Best Market Engine
- Uses Pathway reducers
- Automatically selects highest-profit mandi
- Updates dynamically

## ⚠ 4. Risk Engine
- Risk Score (0–100 scale)
- Classification:
- LOW
- MEDIUM
- HIGH
- Reacts automatically to profit changes

## 🌐 5. Live HTTP API (Served by Pathway)
Endpoints:
/profit
/best-market
/risk

All endpoints update live.

---

# 🏗 Project Structure
Pathway_Vriksh/
│
├── data/
│ ├── market_prices.csv
│ └── harvest.csv
│
├── pathway_engine/
│ ├── stream_engine.py
│ └── test_stream.py
│
├── zplus/ # Optional FastAPI Backend Layer
│ ├── routes/
│ ├── services/
│ └── main.py
│
└── README.md

# 📊 Data Format #
harvest.csv
harvest_id,crop,quantity,transport_cost,commission
1,Mustard,1000,2000,500
2,Wheat,800,1500,400
market_prices.csv
crop,market,price
Mustard,Delhi Azadpur,2100
Mustard,Nagod APMC,1950
Wheat,Sabalgarh APMC,2200

# 🌐 Live Endpoints #

Open in browser:

http://localhost:9000/profit
http://localhost:9000/best-market
http://localhost:9000/risk


Made with Love !!

import pathway as pw

class RawSchema(pw.Schema):
    records: list[dict]

# --- INPUTS (API Mode) ---

# Webserver for Pathway to listen on
webserver = pw.io.http.PathwayWebserver(host="0.0.0.0", port=8666)

# Market stream (Push from Market Updator)
class MarketRecord(pw.Schema):
    records: list[dict]

market_stream_raw, _ = pw.io.http.rest_connector(
    webserver=webserver,
    route="/market-data",
    schema=MarketRecord,
    delete_completed_queries=True # Fixed UserWarning
)

# Flatten and parse
market_stream = market_stream_raw.flatten(
    pw.this.records
).select(
    crop=pw.apply_with_type(lambda x: str(x).strip().strip('"'), str, pw.this.records["commodity"]),
    market=pw.apply_with_type(lambda x: str(x).strip().strip('"'), str, pw.this.records["market"]),
    price=pw.apply_with_type(lambda x: float(str(x).strip().strip('"')) if x is not None and str(x).strip().strip('"') else 0.0, float, pw.this.records["modal_price"])
)








# --- STATIC DATA (Keep as CSV for Harvest) ---
harvest_stream = pw.io.csv.read(
    "/home/anshumandutta/Pathway_Vriksh/data/harvest.csv",
    mode="streaming", # Keep open
    schema=pw.schema_from_dict({
        "harvest_id": int,
        "crop": str,
        "quantity": float,
        "transport_cost": float,
        "commission": float,
    })
)

# --- LOGIC (Same as before) ---

# Calculate net profit
joined = harvest_stream.join(
    market_stream,
    harvest_stream.crop == market_stream.crop
)

# Derive enriched table with profit
enriched_stream = joined.select(
    pw.this.harvest_id,
    pw.this.market,
    pw.this.crop,
    pw.this.quantity,
    pw.this.transport_cost,
    pw.this.commission,
    pw.this.price,
    net_profit=(pw.this.price * (pw.this.quantity / 100.0)) - pw.this.transport_cost - pw.this.commission
)

profit_table = enriched_stream.select(
    pw.this.harvest_id,
    pw.this.market,
    pw.this.net_profit
)


# Find best market
# In Pathway's groupby.reduce, the key is not automatically included in the output table
# unless specified or if we use the .select() after it.
# Actually, the key IS the ID of the reduced table if we don't specify anything else.
# But for joining, it's safer to be explicit.
best_market_base = profit_table.groupby(
    pw.this.harvest_id
).reduce(
    harvest_id=pw.this.harvest_id,
    max_profit=pw.reducers.max(pw.this.net_profit)
)



# Join back to get market name
best_market = best_market_base.join(
    profit_table,
    best_market_base.harvest_id == profit_table.harvest_id,
    best_market_base.max_profit == profit_table.net_profit
).select(

    harvest_id=pw.this.harvest_id,
    best_market=pw.this.market,
    max_profit=pw.this.max_profit
)

# Simplified Risk Logic
risk_base = enriched_stream.select(
    harvest_id=pw.this.harvest_id,
    market=pw.this.market,
    margin_risk=pw.if_else(pw.this.net_profit > 5000, 20, 60),
    transport_risk=pw.if_else(pw.this.transport_cost > 1000, 40, 10)
)


risk_table = risk_base.select(
    pw.this.harvest_id,
    pw.this.market,
    pw.this.margin_risk,
    pw.this.transport_risk,
    volatility_risk=pw.apply(lambda _: 25, pw.this.harvest_id), # Mock volatility
    total_risk=pw.this.margin_risk * 0.5 + pw.this.transport_risk * 0.5
)

# --- OUTPUTS (Push to Data Hub) ---
HUB_URL = "http://localhost:5005/results"

pw.io.http.write(profit_table, f"{HUB_URL}/push-profit")
pw.io.http.write(best_market, f"{HUB_URL}/push-best-market")
pw.io.http.write(risk_table, f"{HUB_URL}/push-risk")

# Run Pathway (Infinite)
pw.run()

import pathway as pw

# Market stream (live)
market_stream = pw.io.csv.read(
    "data/market_prices.csv",
    mode="streaming",
    schema=pw.schema_from_dict({
        "crop": str,
        "market": str,
        "price": float,
    })
)

# Harvest stream (static)
harvest_stream = pw.io.csv.read(
    "data/harvest.csv",
    mode="static",
    schema=pw.schema_from_dict({
        "harvest_id": int,
        "crop": str,
        "quantity": float,
        "transport_cost": float,
        "commission": float,
    })
)

# Proper Pathway join
joined = harvest_stream.join(
    market_stream,
    harvest_stream.crop == market_stream.crop
)

# Compute profit
profit_table = joined.select(
    harvest_id=pw.this.harvest_id,
    market=pw.this.market,
    net_profit=(pw.this.price / 100) * pw.this.quantity
               - pw.this.transport_cost
               - pw.this.commission,
)

# Find the best market for each harvest
best_market = profit_table.groupby(
    pw.this.harvest_id
).reduce(
    harvest_id=pw.this.harvest_id,
    best_market=pw.reducers.argmax(
        pw.this.net_profit,
        pw.this.market
    ),
    max_profit=pw.reducers.max(pw.this.net_profit),
)

# --- RISK ENGINE ---

# 1. Base data for risk
risk_base = joined.select(
    harvest_id=pw.this.harvest_id,
    market=pw.this.market,
    quantity=pw.this.quantity,
    price=pw.this.price,
    transport_cost=pw.this.transport_cost,
    commission=pw.this.commission,
    crop=pw.this.crop
)

# 2. Compute Profit Margin & Transport Proportional Cost
risk_base = risk_base.select(
    pw.this.harvest_id,
    pw.this.market,
    pw.this.crop,
    revenue=(pw.this.price / 100) * pw.this.quantity,
    total_cost=pw.this.transport_cost + pw.this.commission,
)

# 3. Define Risk Components
# Lower margin -> higher risk
# Transport cost relative to revenue -> transport risk
risk_base = risk_base.select(
    pw.this.harvest_id,
    pw.this.market,
    pw.this.crop,
    margin_risk=pw.if_else(
        pw.this.revenue > 0,
        100 - ((pw.this.revenue - pw.this.total_cost) / pw.this.revenue) * 100,
        100.0
    ),
    transport_risk=pw.if_else(
        pw.this.revenue > 0,
        (pw.this.total_cost / pw.this.revenue) * 100,
        100.0
    )
)

# 4. Price Volatility Risk
avg_price = market_stream.groupby(
    pw.this.crop
).reduce(
    crop=pw.this.crop,
    avg_price=pw.reducers.avg(pw.this.price)
)

volatility_join = market_stream.join(
    avg_price,
    market_stream.crop == avg_price.crop
)

volatility_table = volatility_join.select(
    crop=pw.this.crop,
    market=pw.this.market,
    volatility_risk=pw.if_else(
        pw.this.price > pw.this.avg_price,
        (pw.this.price - pw.this.avg_price) / pw.this.avg_price,
        (pw.this.avg_price - pw.this.price) / pw.this.avg_price
    ) * 100
)

# 5. Join Base Risk with Volatility
final_risk_join = risk_base.join(
    volatility_table,
    risk_base.market == volatility_table.market,
    risk_base.crop == volatility_table.crop
)

# 6. Compute Total Risk Score (Weighted)
risk_table = final_risk_join.select(
    harvest_id=pw.this.harvest_id,
    market=pw.this.market,
    margin_risk=pw.this.margin_risk,
    transport_risk=pw.this.transport_risk,
    volatility_risk=pw.this.volatility_risk,
    total_risk=(
        pw.this.margin_risk * 0.4 +
        pw.this.transport_risk * 0.3 +
        pw.this.volatility_risk * 0.3
    )
)

# 7. Risk Classification
risk_table = risk_table.select(
    pw.this.harvest_id,
    pw.this.market,
    pw.this.margin_risk,
    pw.this.transport_risk,
    pw.this.volatility_risk,
    total_risk=pw.this.total_risk,
    risk_level=pw.if_else(
        pw.this.total_risk > 70,
        "HIGH",
        pw.if_else(
            pw.this.total_risk > 40,
            "MEDIUM",
            "LOW"
        )
    )
)

# Output results to JSON Lines and run
pw.io.jsonlines.write(profit_table, "zplus/data/profit_output.json")
pw.io.jsonlines.write(best_market, "zplus/data/best_market.json")
pw.io.jsonlines.write(risk_table, "zplus/data/risk_output.json")

# Run without the dashboard to see direct output
pw.run(monitoring_level=pw.MonitoringLevel.NONE)
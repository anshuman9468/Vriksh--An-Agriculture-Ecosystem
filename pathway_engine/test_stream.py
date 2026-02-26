import time
import random

MARKETS = [
    "Delhi Azadpur",
    "Nagod APMC",
    "Sabalgarh APMC",
]

CROPS = ["Mustard", "Wheat"]

def append_market_data():
    with open("data/market_prices.csv", "a") as f:
        crop = random.choice(CROPS)
        market = random.choice(MARKETS)
        price = random.randint(1800, 2500)

        f.write(f"\n{crop},{market},{price}")
        print(f"📡 New market data appended: {crop} - {market} - ₹{price}")

if __name__ == "__main__":
    while True:
        time.sleep(5)
        append_market_data()

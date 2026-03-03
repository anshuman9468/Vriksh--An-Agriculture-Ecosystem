import requests
import pandas as pd
from datetime import date, timedelta
import logging

logger = logging.getLogger(__name__)

def get_user_location():
    try:
        res = requests.get("https://ipapi.co/json/", timeout=10)
        if res.status_code == 200:
            data = res.json()
            return data["latitude"], data["longitude"], data.get("city", "Unknown")
        else:
            return None, None, None
    except Exception:
        return None, None, None

def fetch_weather(lat, lon, start_date, end_date):
    try:
        url = (
            f"https://archive-api.open-meteo.com/v1/archive?"
            f"latitude={lat}&longitude={lon}"
            f"&start_date={start_date}&end_date={end_date}"
            "&daily=temperature_2m_max,temperature_2m_min,precipitation_sum"
            "&timezone=auto"
        )
        resp = requests.get(url, timeout=20)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        logger.error(f"Weather API error: {e}")
        return None

def fetch_forecast(lat, lon, days=14):
    try:
        url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={lat}&longitude={lon}"
            f"&daily=temperature_2m_max,temperature_2m_min,precipitation_sum"
            f"&forecast_days={days}&timezone=auto"
        )
        resp = requests.get(url, timeout=20)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        logger.error(f"Forecast API error: {e}")
        return None

def fetch_flood(lat, lon, start_date, end_date):
    try:
        url = (
            f"https://flood-api.open-meteo.com/v1/flood?"
            f"latitude={lat}&longitude={lon}"
            f"&start_date={start_date}&end_date={end_date}"
            "&daily=river_discharge&timezone=auto"
        )
        resp = requests.get(url, timeout=20)
        if resp.status_code == 404:
            return {"error": "No flood model available for this region"}
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        return {"error": f"Flood API failed: {e}"}

def analyze_extremes(df):
    events = {}
    if df is not None and not df.empty and "tmax" in df.columns and "rain" in df.columns:
        events["heatwave_days"] = int((df["tmax"] > 40).sum())
        events["drought_days"] = int((df["rain"] < 1).sum())
        events["flood_days"] = int((df["rain"] > 100).sum())
    else:
        events["heatwave_days"] = 0
        events["drought_days"] = 0
        events["flood_days"] = 0
    return events

def generate_report(region, start_date, end_date, weather_df, forecast_df, extremes, flood_data=None):
    report = []
    report.append("🌾 **Farmer Support Report**")
    report.append(f"**Region:** {region}")
    report.append(f"**Period:** {start_date} → {end_date}\n")

    if weather_df is not None and not weather_df.empty:
        report.append("📊 **Weather Summary (History):**")
        report.append(f"- Avg Temp: {weather_df['tmax'].mean():.1f} °C")
        report.append(f"- Total Rainfall: {weather_df['rain'].sum():.1f} mm\n")

    if forecast_df is not None and not forecast_df.empty:
        report.append("🔮 **Forecast (Next 14 days):**")
        report.append(f"- Expected Avg Temp: {forecast_df['tmax'].mean():.1f} °C")
        report.append(f"- Expected Rainfall: {forecast_df['rain'].sum():.1f} mm\n")

    report.append("⚠️ **Extreme Events Detected:**")
    report.append(f"- Heatwave days: {extremes.get('heatwave_days', 0)}")
    report.append(f"- Drought-like days: {extremes.get('drought_days', 0)}")
    report.append(f"- Heavy rain days: {extremes.get('flood_days', 0)}\n")

    # 🌊 Flood Risk Report
    if flood_data and "daily" in flood_data:
        try:
            discharge_vals = flood_data["daily"]["river_discharge"]
            avg_discharge = sum(discharge_vals) / len(discharge_vals)
            max_discharge = max(discharge_vals)
            report.append("🌊 **Flood Risk Report:**")
            report.append(f"- Avg River Discharge: {avg_discharge:.1f} m³/s")
            report.append(f"- Max River Discharge: {max_discharge:.1f} m³/s")
            if max_discharge > 5000:
                report.append("⚠️ High flood risk detected → Take protective measures for crops & livestock.")
            elif max_discharge > 2000:
                report.append("⚠️ Moderate flood risk → Ensure drainage systems are clear.")
            else:
                report.append("✅ No significant flood risk detected.")
            report.append("")
        except Exception:
            report.append("🌊 Flood Risk Report: Data unavailable.\n")

    if weather_df is not None and not weather_df.empty:
        if weather_df['rain'].mean() > 5 and weather_df['tmax'].mean() > 25:
            rec_crop = "Rice"
        else:
            rec_crop = "Wheat"
        report.append(f"✅ **Crop Recommendation:** Grow **{rec_crop}** this season.")

    # ✅ Safe comparisons with default=0
    if extremes.get("drought_days", 0) > 10:
        report.append("💡 Advice: Long dry spell detected → Plan irrigation.")
    if extremes.get("heatwave_days", 0) > 3:
        report.append("💡 Advice: Heat stress risk → Use heat-tolerant seeds.")
    if extremes.get("flood_days", 0) > 2:
        report.append("💡 Advice: Risk of waterlogging → Ensure drainage.")

    return "\n".join(report)

def get_full_analysis(lat, lon, region_name, start_date_str, end_date_str):
    weather_data = fetch_weather(lat, lon, start_date_str, end_date_str)
    weather_df = None
    if weather_data:
        weather_df = pd.DataFrame({
            "date": weather_data["daily"]["time"],
            "tmax": weather_data["daily"]["temperature_2m_max"],
            "tmin": weather_data["daily"]["temperature_2m_min"],
            "rain": weather_data["daily"]["precipitation_sum"],
        })
    
    forecast_data = fetch_forecast(lat, lon)
    forecast_df = None
    if forecast_data:
        forecast_df = pd.DataFrame({
            "date": forecast_data["daily"]["time"],
            "tmax": forecast_data["daily"]["temperature_2m_max"],
            "tmin": forecast_data["daily"]["temperature_2m_min"],
            "rain": forecast_data["daily"]["precipitation_sum"],
        })
    
    flood_data = fetch_flood(lat, lon, start_date_str, end_date_str)
    extremes = analyze_extremes(weather_df)
    
    report = generate_report(region_name, start_date_str, end_date_str, weather_df, forecast_df, extremes, flood_data)
    
    return {
        "weather": weather_data,
        "forecast": forecast_data,
        "flood": flood_data,
        "extremes": extremes,
        "report": report
    }

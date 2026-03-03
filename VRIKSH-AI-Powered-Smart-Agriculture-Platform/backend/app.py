from __future__ import annotations

import io
import os
import base64
from typing import Dict, Tuple, Optional
from datetime import date, timedelta

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from PIL import Image
import numpy as np
import pandas as pd
import requests
import plotly.express as px


# =====================
# ANALYSIS HELPERS (From User)
# =====================
def get_user_location():
    """Get user's current location via IP geolocation."""
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
        return {"error": f"Weather API error: {e}"}

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
        return {"error": f"Forecast API error: {e}"}

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

    if flood_data and "daily" in flood_data:
        try:
            discharge_vals = flood_data["daily"]["river_discharge"]
            avg_discharge = sum(discharge_vals) / len(discharge_vals)
            max_discharge = max(discharge_vals)
            report.append("🌊 **Flood Risk Report:**")
            report.append(f"- Avg River Discharge: {avg_discharge:.1f} m³/s")
            report.append(f"- Max River Discharge: {max_discharge:.1f} m³/s")
            if max_discharge > 5000:
                report.append("⚠️ High flood risk detected → Protect crops & livestock.")
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

    if extremes.get("drought_days", 0) > 10:
        report.append("💡 Advice: Long dry spell detected → Plan irrigation.")
    if extremes.get("heatwave_days", 0) > 3:
        report.append("💡 Advice: Heat stress risk → Use heat-tolerant seeds.")
    if extremes.get("flood_days", 0) > 2:
        report.append("💡 Advice: High flood risk → Check local alerts.")

    return "\n".join(report)

def generate_charts(weather_df=None, forecast_df=None, flood_data=None):
    """
    Generate all visualizations as JSON.
    Returns a dictionary of Plotly JSON graphs.
    """

    charts = {}

    # =========================
    # HISTORICAL WEATHER CHARTS
    # =========================
    if weather_df is not None and not weather_df.empty:

        # Temperature Trend
        fig_temp = px.line(
            weather_df,
            x="date",
            y=["tmax", "tmin"],
            title="Daily Max & Min Temperature"
        )
        charts["temp_trend"] = fig_temp.to_json()

        # Rainfall Trend
        fig_rain = px.bar(
            weather_df,
            x="date",
            y="rain",
            title="Daily Rainfall"
        )
        charts["rain_trend"] = fig_rain.to_json()

        # Temperature Distribution
        try:
            temp_bins = pd.cut(
                weather_df["tmax"],
                bins=[-5, 20, 30, 40, 50],
                labels=["Cool (<20°C)", "Moderate (20-30°C)", "Hot (30-40°C)", "Extreme (>40°C)"]
            )

            temp_counts = temp_bins.value_counts().reset_index()
            temp_counts.columns = ["Category", "Days"]

            fig_pie_temp = px.pie(
                temp_counts,
                values="Days",
                names="Category",
                title="Temperature Distribution"
            )
            charts["temp_distribution"] = fig_pie_temp.to_json()
        except:
            charts["temp_distribution"] = None

        # Crop Suitability
        avg_temp = weather_df["tmax"].mean()
        avg_rain = weather_df["rain"].mean()

        if avg_rain > 5 and avg_temp > 25:
            crops = {"Rice": 50, "Maize": 30, "Sugarcane": 20}
        else:
            crops = {"Wheat": 60, "Barley": 25, "Pulses": 15}

        crop_df = pd.DataFrame({
            "Crop": list(crops.keys()),
            "Suitability": list(crops.values())
        })

        fig_crop = px.pie(
            crop_df,
            values="Suitability",
            names="Crop",
            title="Crop Suitability Indicator"
        )
        charts["crop_suitability"] = fig_crop.to_json()

    # =========================
    # FORECAST CHARTS
    # =========================
    if forecast_df is not None and not forecast_df.empty:

        # Future Temperature
        fig_forecast_temp = px.line(
            forecast_df,
            x="date",
            y=["tmax", "tmin"],
            title="Forecast Temperatures"
        )
        charts["forecast_temp"] = fig_forecast_temp.to_json()

        # Future Rainfall
        fig_forecast_rain = px.bar(
            forecast_df,
            x="date",
            y="rain",
            title="Forecast Rainfall"
        )
        charts["forecast_rain"] = fig_forecast_rain.to_json()

    # =========================
    # FLOOD CHART
    # =========================
    if flood_data and "daily" in flood_data:
        try:
            flood_df = pd.DataFrame({
                "date": flood_data["daily"]["time"],
                "river_discharge": flood_data["daily"]["river_discharge"]
            })

            flood_df["date"] = pd.to_datetime(flood_df["date"])

            fig_flood = px.bar(
                flood_df,
                x="date",
                y="river_discharge",
                title="Flood Forecast (River Discharge)"
            )

            charts["flood_forecast"] = fig_flood.to_json()

        except Exception:
            charts["flood_forecast"] = None

    return charts

def run_farm_analysis_logic(lat, lon, region="My Farm", start_date_val=None, end_date_val=None):
    if not start_date_val:
        start_date_val = (date.today() - timedelta(days=365)).isoformat()
    if not end_date_val:
        end_date_val = date.today().isoformat()

    weather_data = fetch_weather(lat, lon, start_date_val, end_date_val)
    forecast_data = fetch_forecast(lat, lon, days=14)
    flood_data = fetch_flood(lat, lon, start_date_val, end_date_val)

    weather_df = None
    forecast_df = None

    if weather_data and "daily" in weather_data:
        weather_df = pd.DataFrame({
            "date": weather_data["daily"]["time"],
            "tmax": weather_data["daily"]["temperature_2m_max"],
            "tmin": weather_data["daily"]["temperature_2m_min"],
            "rain": weather_data["daily"]["precipitation_sum"],
        })
        weather_df["date"] = pd.to_datetime(weather_df["date"])

    if forecast_data and "daily" in forecast_data:
        forecast_df = pd.DataFrame({
            "date": forecast_data["daily"]["time"],
            "tmax": forecast_data["daily"]["temperature_2m_max"],
            "tmin": forecast_data["daily"]["temperature_2m_min"],
            "rain": forecast_data["daily"]["precipitation_sum"],
        })
        forecast_df["date"] = pd.to_datetime(forecast_df["date"])

    extremes = analyze_extremes(weather_df)
    report = generate_report(region, start_date_val, end_date_val, weather_df, forecast_df, extremes, flood_data)
    charts = generate_charts(weather_df, forecast_df, flood_data)

    # We also keep our original daily_insights for compatibility with existing UI
    daily_insights = []
    if forecast_df is not None and not forecast_df.empty:
        for i in range(len(forecast_df)):
            row = forecast_df.iloc[i]
            tmax = row["tmax"]
            rain = row["rain"]
            action = "Optimal for Field Work"
            color = "green"
            if rain > 5:
                action = "Avoid Spraying (Rain)"
                color = "blue"
            elif tmax > 40:
                action = "Extreme Heat Stress"
                color = "red"
            
            # Safe conversion to float with NaN handling
            try:
                tmax_clean = float(tmax) if not pd.isna(tmax) else 0.0
                tmin_clean = float(row["tmin"]) if not pd.isna(row["tmin"]) else 0.0
                rain_clean = float(rain) if not pd.isna(rain) else 0.0
            except (ValueError, TypeError):
                tmax_clean, tmin_clean, rain_clean = 0.0, 0.0, 0.0

            daily_insights.append({
                "id": i,
                "date": row["date"].strftime("%Y-%m-%d") if hasattr(row["date"], "strftime") else str(row["date"]),
                "tmax": tmax_clean,
                "tmin": tmin_clean,
                "rain": rain_clean,
                "action": action,
                "color": color
            })

    # Enhanced data structures for Recharts
    avg_temp = float(weather_df["tmax"].mean()) if weather_df is not None else 0
    avg_rain = float(weather_df["rain"].mean()) if weather_df is not None else 0
    
    crops = {"Rice": 50, "Maize": 30, "Sugarcane": 20} if (avg_rain > 5 and avg_temp > 25) else {"Wheat": 60, "Barley": 25, "Pulses": 15}
    crop_suitability = [{"name": k, "value": v} for k, v in crops.items()]
    
    temp_dist = []
    if weather_df is not None:
        bins = [-5, 20, 30, 40, 50]
        labels = ["Cool (<20°C)", "Moderate (20-30°C)", "Hot (30-40°C)", "Extreme (>40°C)"]
        counts = pd.cut(weather_df["tmax"], bins=bins, labels=labels).value_counts()
        temp_dist = [{"name": label, "value": int(counts.get(label, 0))} for label in labels]

    return {
        "weather_data": weather_df.to_dict(orient="records") if weather_df is not None else [],
        "forecast_data": forecast_df.to_dict(orient="records") if forecast_df is not None else [],
        "extremes": extremes,
        "flood_data": flood_data,
        "report": report,
        "charts": charts,
        "insights": daily_insights,
        "crop_suitability": crop_suitability,
        "temp_distribution": temp_dist,
        "summary": "Full strategic intelligence report compiled based on satellite telemetry.",
        "region": region,
        "coordinates": {"lat": lat, "lon": lon}
    }


def create_app() -> Flask:
    frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "build"))
    app = Flask(
        __name__,
        static_folder=frontend_dist,
        static_url_path=""
    )
    CORS(app, resources={r"/*": {"origins": "*"}})
    print(">>> FLASK: Starting Pre-Prod Backend on port 5001", flush=True)

    @app.get("/health")
    def health() -> Tuple[str, int]:
        return "ok", 200

    @app.post("/classify")
    def classify():
        try:
            image: Image.Image | None = None
            if request.content_type and "application/json" in request.content_type:
                data = request.get_json(silent=True) or {}
                b64 = data.get("image_base64")
                if not b64:
                    return jsonify({"error": "Missing image_base64 in JSON"}), 400
                image_bytes = base64.b64decode(b64)
                image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            else:
                file = request.files.get("image")
                if not file:
                    raw = request.get_data()
                    if not raw:
                        return jsonify({"error": "No image provided"}), 400
                    image = Image.open(io.BytesIO(raw)).convert("RGB")
                else:
                    image = Image.open(file.stream).convert("RGB")

            result = classify_leaf_health(image)

            auto = os.environ.get("PUMP_AUTO", "0") == "1"
            nodemcu_base = os.environ.get("NODEMCU_URL", "").rstrip("/")
            pump_action = None
            pump_error = None
            if auto and nodemcu_base:
                try:
                    desired = "on" if result.get("class") in ("unhealthy", "moderate") else "off"
                    pump_action = desired
                    send_pump_command(nodemcu_base, desired)
                except Exception as e:
                    pump_error = str(e)

            response = {**result}
            if pump_action is not None:
                response["pump_action"] = pump_action
            if pump_error is not None:
                response["pump_error"] = pump_error

            arduino_enabled = os.environ.get("ARDUINO_ENABLE", "0") == "1"
            if arduino_enabled:
                try:
                    cmd = map_class_to_arduino_command(result.get("class", ""))
                    if cmd:
                        send_arduino_command(cmd)
                        response["arduino_command"] = cmd
                except Exception as e:
                    response["arduino_error"] = str(e)

            return jsonify(response), 200
        except Exception as exc:
            return jsonify({"error": str(exc)}), 500

    @app.get("/farm-analytics")
    def get_farm_analytics():
        lat = request.args.get("lat", type=float)
        lon = request.args.get("lon", type=float)
        region = request.args.get("region", default="My Farm")
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")
        
        if lat is None or lon is None:
            lat_auto, lon_auto, city = get_user_location()
            if lat_auto and lon_auto:
                lat, lon = lat_auto, lon_auto
                if city: region = city
            else:
                lat, lon = 28.6139, 77.2090
                
        try:
            results = run_farm_analysis_logic(lat, lon, region, start_date, end_date)
            return jsonify(results)
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.get("/")
    def serve_index():
        index_path = os.path.join(app.static_folder or "", "index.html")
        if os.path.exists(index_path):
            return send_from_directory(app.static_folder, "index.html")
        return "Vriksh Leaf Classifier Backend is running", 200

    @app.get("/<path:path>")
    def serve_static(path: str):
        file_path = os.path.join(app.static_folder or "", path)
        if app.static_folder and os.path.exists(file_path):
            return send_from_directory(app.static_folder, path)
        index_path = os.path.join(app.static_folder or "", "index.html")
        if os.path.exists(index_path):
            return send_from_directory(app.static_folder, "index.html")
        return "Not Found", 404

    return app

def send_pump_command(base_url: str, state: str) -> None:
    if state not in ("on", "off"):
        raise ValueError("state must be 'on' or 'off'")
    res = requests.get(f"{base_url}/pump", params={"state": state}, timeout=3)
    if res.status_code >= 400:
        raise RuntimeError(f"pump http {res.status_code}: {res.text[:120]}")

def map_class_to_arduino_command(label: str) -> Optional[str]:
    mapping = {"healthy": "healthy", "moderate": "moderate", "unhealthy": "unhealthy"}
    return mapping.get(label)

def resolve_arduino_port() -> Optional[str]:
    explicit = os.environ.get("ARDUINO_PORT")
    if explicit: return explicit
    try:
        import serial.tools.list_ports as list_ports
        candidates = list(list_ports.comports())
        for p in candidates:
            text = f"{p.device} {p.description} {p.hwid}".lower()
            if any(key in text for key in ["arduino", "wchusbserial", "ch340", "cp210", "usb-serial"]):
                return p.device
        return candidates[0].device if candidates else None
    except: return None

def send_arduino_command(command: str) -> None:
    try:
        import serial
        import time
        port = resolve_arduino_port()
        if not port: return
        with serial.Serial(port=port, baudrate=115200, timeout=1.5) as ser:
            time.sleep(0.3)
            ser.write((command + "\n").encode("utf-8"))
    except: pass

def classify_leaf_health(image: Image.Image) -> Dict[str, object]:
    image = image.convert("RGB")
    w, h = image.size
    scale = min(512 / max(w, h), 1.0)
    if scale < 1.0:
        image = image.resize((int(w * scale), int(h * scale)))
    
    img_np = np.asarray(image, dtype=np.uint8)
    hsv_np = np.asarray(image.convert("HSV"), dtype=np.uint8)
    
    r = img_np[:,:,0].astype(np.int32)
    g = img_np[:,:,1].astype(np.int32)
    b = img_np[:,:,2].astype(np.int32)
    
    # H: 0-179, S: 0-255, V: 0-255
    h_ch = hsv_np[:,:,0]
    s_ch = hsv_np[:,:,1]
    v_ch = hsv_np[:,:,2]
    
    # Excess Green Index (ExG)
    exg = 2*g - r - b
    
    # Segment leaf from background
    # 1. Must have some saturation and value
    # 2. ExG check: For dry/brown leaves, ExG might be low or negative.
    #    We use a broader mask but keep it tight enough to exclude shadows.
    leaf_mask = (s_ch > 30) & (v_ch > 40) & (v_ch < 250)
    
    total = int(np.count_nonzero(leaf_mask)) or 1
    
    # Color classification (HSV standard ranges)
    # Green: Hue ~35-90
    green_mask = (h_ch >= 35) & (h_ch <= 95) & (s_ch > 40) & leaf_mask
    
    # Yellow: Hue ~20-34
    yellow_mask = (h_ch >= 18) & (h_ch <= 34) & (s_ch > 40) & leaf_mask
    
    # Brown/Necrosis: Very dark or Hue ~10-18
    brown_mask = (((h_ch >= 0) & (h_ch <= 17)) | (v_ch < 80)) & leaf_mask & ~green_mask
    
    g_r = np.count_nonzero(green_mask) / total
    y_r = np.count_nonzero(yellow_mask) / total
    b_r = np.count_nonzero(brown_mask) / total
    
    stress = y_r + b_r
    
    # Logic
    if g_r > 0.75 and stress < 0.15:
        label = "healthy"
        conf = 0.85 + (g_r * 0.1)
    elif g_r > 0.40:
        label = "moderate"
        conf = 0.70
    else:
        label = "unhealthy"
        conf = 0.90
        
    return {
        "class": label, 
        "confidence": round(conf, 2), 
        "metrics": {
            "green_ratio": round(g_r, 4), 
            "yellow_ratio": round(y_r, 4), 
            "brown_ratio": round(b_r, 4), 
            "stress_ratio": round(stress, 4),
            "pixels": int(total)
        }
    }

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5001)

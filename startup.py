import subprocess
import time
import os
import sys
import signal
import threading

# --- CONFIGURATION ---
BASE_DIR = os.path.abspath("/home/anshumandutta/Pathway_Vriksh")

# SaaS Vriksh 2.0 (Post Production)
VENV_PYTHON = os.path.join(BASE_DIR, "venv/bin/python")
FRONTEND_DIR = os.path.join(BASE_DIR, "SaaS Website for VRIKSH 2.0")
BACKEND_DIR = os.path.join(BASE_DIR, "zplus")

# VRIKSH Platform (Pre Production)
PRE_PROD_DIR = os.path.join(BASE_DIR, "VRIKSH-AI-Powered-Smart-Agriculture-Platform")
PRE_PROD_BACKEND_DIR = os.path.join(PRE_PROD_DIR, "backend")
PRE_PROD_VENV_PYTHON = os.path.join(PRE_PROD_BACKEND_DIR, ".venv/bin/python")

# --- PROCESS MANAGEMENT ---
processes = {} # { name: { "command": [], "cwd": "", "proc": Process, "restarts": 0 } }

def clean_ports():
    print("🧹 Cleaning up old service ports (5005, 8666, 8000, 5173, 5001, 3000)...")
    ports = [5005, 8666, 8000, 5173, 5001, 3000]
    for port in ports:
        # Try fuser first
        subprocess.run(f"fuser -k {port}/tcp > /dev/null 2>&1", shell=True)
        # Also try lsof + kill for thoroughness
        subprocess.run(f"lsof -t -i:{port} | xargs -r kill -9 > /dev/null 2>&1", shell=True)
    time.sleep(2)

def start_service(name, command, cwd=BASE_DIR):
    if name in processes and processes[name]["proc"] and processes[name]["proc"].poll() is None:
        return # Already running
        
    print(f"🚀 Starting {name}...")
    try:
        proc = subprocess.Popen(
            command,
            cwd=cwd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            preexec_fn=os.setsid
        )
        if name not in processes:
            processes[name] = {"restarts": 0}
            
        processes[name].update({
            "command": command,
            "cwd": cwd,
            "proc": proc
        })
        
        # Start log streaming
        t = threading.Thread(target=stream_logs, args=(name, proc), daemon=True)
        t.start()
        return proc
    except Exception as e:
        print(f"❌ Failed to start {name}: {e}")
        return None

def stream_logs(name, proc):
    try:
        for line in iter(proc.stdout.readline, ""):
            if line:
                print(f"[{name}] {line.strip()}")
            else:
                break
    except:
        pass
    finally:
        if proc.stdout: proc.stdout.close()

def cleanup(sig=None, frame=None):
    print("\n\n🛑 Shutting down all services...")
    for name, info in processes.items():
        proc = info.get("proc")
        if proc and proc.poll() is None:
            print(f"Stopping {name}...")
            try:
                os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
            except Exception:
                pass
    print("✅ All services stopped. Goodbye!")
    sys.exit(0)

def main():
    signal.signal(signal.SIGINT, cleanup)
    signal.signal(signal.SIGTERM, cleanup)

    print("==========================================")
    print("   VRIKSH HYBRID STARTUP SYSTEM (SaaS + AI Platform)   ")
    print("==========================================")

    clean_ports()

    # --- POST PRODUCTION (SaaS) ---
    start_service("Pathway Engine", [VENV_PYTHON, "pathway_engine/stream_engine.py"])
    start_service("Market Updator (Hub API)", [VENV_PYTHON, "Data Ingestion/market_updator.py"])
    start_service("Backend API", [VENV_PYTHON, "-m", "uvicorn", "main:app", "--port", "8000", "--host", "0.0.0.0"], cwd=BACKEND_DIR)
    start_service("Frontend (SaaS)", ["npm", "run", "dev"], cwd=FRONTEND_DIR)

    # --- PRE PRODUCTION (AI Platform) ---
    start_service("Pre-Prod Backend", [PRE_PROD_VENV_PYTHON, "app.py"], cwd=PRE_PROD_BACKEND_DIR)
    start_service("Pre-Prod Frontend", ["npm", "run", "dev"], cwd=PRE_PROD_DIR)

    print("\n✨ ALL SYSTEMS ONLINE!")
    print(f"------------------------------------------")
    print(f"🔗 SaaS Frontend: http://localhost:5173")
    print(f"🔗 AI Platform:   http://localhost:3000")
    print(f"------------------------------------------")
    print("Monitoring Logs and Auto-Restarting... (Ctrl+C to Stop All)\n")

    try:
        while True:
            for name, info in list(processes.items()):
                proc = info.get("proc")
                if proc and proc.poll() is not None:
                    code = proc.returncode
                    print(f"⚠️ {name} has crashed (Exit code: {code}). Restarting in 3s...")
                    time.sleep(3)
                    start_service(name, info["command"], info["cwd"])
                    processes[name]["restarts"] += 1
            time.sleep(5)
    except KeyboardInterrupt:
        cleanup()

if __name__ == "__main__":
    main()

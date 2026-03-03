import subprocess
import time
import os
import signal
import sys

# Define absolute path to the project root
PROJECT_ROOT = "/home/anshumandutta/Pathway_Vriksh"

# Configuration for services
# Name: (Cwd, Command, Env, Port)
SERVICES = {
    "Pathway Engine": (
        os.path.join(PROJECT_ROOT, "pathway_engine"),
        [os.path.join(PROJECT_ROOT, "venv/bin/python"), "stream_engine.py"],
        {},
        8666
    ),
    "Market Updator (Hub API)": (
        os.path.join(PROJECT_ROOT, "Data Ingestion"),
        [os.path.join(PROJECT_ROOT, "venv/bin/python"), "market_updator.py"],
        {},
        5005
    ),
    "Backend API": (
        PROJECT_ROOT,
        [os.path.join(PROJECT_ROOT, "venv/bin/python"), "-m", "uvicorn", "zplus.main:app", "--host", "0.0.0.0", "--port", "8000"],
        {},
        8000
    ),
    "Frontend (SaaS)": (
        os.path.join(PROJECT_ROOT, "SaaS Website for VRIKSH 2.0"),
        ["npm", "run", "dev", "--", "--port", "5173", "--host"],
        {},
        5173
    ),
    "Pre-Prod Backend": (
        os.path.join(PROJECT_ROOT, "VRIKSH-AI-Powered-Smart-Agriculture-Platform/backend"),
        [os.path.join(PROJECT_ROOT, "VRIKSH-AI-Powered-Smart-Agriculture-Platform/backend/.venv/bin/python"), "app.py"],
        {},
        5001
    ),
    "Pre-Prod Frontend": (
        os.path.join(PROJECT_ROOT, "VRIKSH-AI-Powered-Smart-Agriculture-Platform"),
        ["npm", "run", "dev", "--", "--port", "3000", "--host"],
        {},
        3000
    )
}

processes = {}

def kill_port(port):
    if not port: return
    print(f"🧹 Clearing port {port}...", end="", flush=True)
    try:
        # Try multiple methods to ensure the port is free
        subprocess.run(f"fuser -k {port}/tcp", shell=True, capture_output=True)
        subprocess.run(f"lsof -t -i:{port} | xargs -r kill -9", shell=True, capture_output=True)
        # Give OS a moment to release the socket
        time.sleep(1)
        print(" [OK]")
    except Exception as e:
        print(f" [ERR: {e}]")

def start_service(name, config):
    cwd, cmd, env_updates, port = config
    env = os.environ.copy()
    env.update(env_updates)
    
    # Add project root to PYTHONPATH for all services
    ppath = env.get("PYTHONPATH", "")
    env["PYTHONPATH"] = f"{PROJECT_ROOT}:{ppath}" if ppath else PROJECT_ROOT
    
    print(f"🚀 Starting {name}...")
    proc = subprocess.Popen(
        cmd,
        cwd=cwd,
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )
    return proc

def monitor_logs(name, proc):
    for line in iter(proc.stdout.readline, ""):
        print(f"[{name}] {line.strip()}", flush=True)

def cleanup(sig, frame):
    print("\n🛑 Stopping all services...")
    for name, proc in processes.items():
        print(f"Stopping {name}...")
        proc.terminate()
    sys.exit(0)

signal.signal(signal.SIGINT, cleanup)

if __name__ == "__main__":
    print("==========================================")
    print("   VRIKSH HYBRID STARTUP SYSTEM (SaaS + AI Platform)   ")
    print("==========================================")
    
    # Clean up common ports first
    print("🧹 Cleaning up old service ports...")
    for name, config in SERVICES.items():
        kill_port(config[3])
        
    time.sleep(1)

    # Start all services
    import threading

    for name, config in SERVICES.items():
        proc = start_service(name, config)
        processes[name] = proc
        threading.Thread(target=monitor_logs, args=(name, proc), daemon=True).start()

    print("\n✨ ALL SYSTEMS ONLINE!")
    print("------------------------------------------")
    print("🔗 SaaS Frontend: http://localhost:5173")
    print("🔗 AI Platform:   http://localhost:3000")
    print("------------------------------------------")
    print("Monitoring Logs... (Ctrl+C to Stop All)")
    
    # Stay alive and check for crashes
    while True:
        for name, proc in list(processes.items()):
            if proc.poll() is not None:
                print(f"⚠️ {name} has crashed (Exit code: {proc.returncode}). Restarting in 3s...")
                time.sleep(3)
                # Ensure port is clean before restart!
                kill_port(SERVICES[name][3])
                processes[name] = start_service(name, SERVICES[name])
                threading.Thread(target=monitor_logs, args=(name, processes[name]), daemon=True).start()
        time.sleep(1)

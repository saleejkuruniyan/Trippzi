#!/usr/bin/env python3
import os
import sys
import subprocess
import signal
import time
import atexit
from pathlib import Path
from types import FrameType
from typing import List, Optional

# =============================
# Paths
# =============================
ROOT = Path(__file__).resolve().parent
BACKEND = ROOT / "backend"
PORTAL = ROOT / "portal"
SUPERADMIN = ROOT / "superadmin"
VENV_DIR = BACKEND / ".venv"

ACTIVE_PROCESSES: List[subprocess.Popen] = []

# =============================
# Helpers
# =============================
def run_cmd(cmd, cwd=None, env=None, check=True):
    print(f"➡️  {' '.join(cmd)}")
    subprocess.run(cmd, cwd=cwd, env=env, check=check)

def kill_port(port: int):
    """Kills any process listening on the given port."""
    print(f"🧹 Clearing port {port}...")
    try:
        if os.name == "nt":
            output = subprocess.check_output(["netstat", "-ano", "-p", "TCP"], text=True)
            for line in output.splitlines():
                if f":{port}" in line and "LISTENING" in line:
                    pid = line.strip().split()[-1]
                    subprocess.run(["taskkill", "/F", "/PID", pid], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        else:
            try:
                pids = subprocess.check_output(["lsof", "-t", f"-i:{port}"], text=True).strip().split('\n')
                for pid in pids:
                    if pid:
                        os.kill(int(pid), signal.SIGKILL)
            except subprocess.CalledProcessError:
                pass
    except Exception:
        pass

def register_process(proc: subprocess.Popen):
    ACTIVE_PROCESSES.append(proc)

def create_process(cmd, cwd=None, env=None):
    kwargs = {"cwd": cwd, "env": env}
    if os.name == "nt":
        kwargs["creationflags"] = subprocess.CREATE_NEW_PROCESS_GROUP
    else:
        kwargs["preexec_fn"] = os.setsid

    proc = subprocess.Popen(cmd, **kwargs)
    register_process(proc)
    return proc

def terminate_process(proc: subprocess.Popen):
    if proc.poll() is not None:
        return
    try:
        if os.name == "nt":
            proc.terminate()
        else:
            os.killpg(proc.pid, signal.SIGINT)
        proc.wait(timeout=5)
    except Exception:
        try:
            proc.kill()
        except Exception:
            pass

def cleanup_processes():
    while ACTIVE_PROCESSES:
        terminate_process(ACTIVE_PROCESSES.pop())

def handle_exit(signum: int, _frame: Optional[FrameType]):
    print("\n🛑 Shutting down Trippzi...")
    cleanup_processes()
    sys.exit(0)

atexit.register(cleanup_processes)
signal.signal(signal.SIGINT, handle_exit)
signal.signal(signal.SIGTERM, handle_exit)

# =============================
# Setup Steps
# =============================
def setup_backend():
    print("⚙️ Setting up Backend...")
    python = VENV_DIR / ("bin/python" if os.name != "nt" else "Scripts/python")
    pip = VENV_DIR / ("bin/pip" if os.name != "nt" else "Scripts/pip")
    
    if not VENV_DIR.exists():
        python_cmd = sys.executable if os.name == "nt" else "python3.12"
        run_cmd([python_cmd, "-m", "venv", str(VENV_DIR)])
    
    run_cmd([str(python), "-m", "pip", "install", "--upgrade", "pip"])
    if (BACKEND / "requirements.txt").exists():
        run_cmd([str(python), "-m", "pip", "install", "-r", "requirements.txt"], cwd=BACKEND)
    else:
        run_cmd([str(python), "-m", "pip", "install", "django", "djangorestframework", "django-cors-headers", "langchain-openai", "langchain-community", "python-dotenv", "razorpay", "dj-database-url"], cwd=BACKEND)
    
    run_cmd([str(python), "manage.py", "migrate"], cwd=BACKEND)

def setup_frontend(path, name):
    print(f"📦 Installing dependencies for {name}...")
    npm = "npm.cmd" if os.name == "nt" else "npm"
    if (path / "package.json").exists():
        run_cmd([npm, "install"], cwd=path)

# =============================
# Main
# =============================
def main():
    print("🚀 Trippzi Startup Script\n")
    
    kill_port(8000)
    kill_port(3000)
    kill_port(3001)

    setup_backend()
    setup_frontend(PORTAL, "Portal")
    setup_frontend(SUPERADMIN, "Superadmin")

    python = VENV_DIR / ("bin/python" if os.name != "nt" else "Scripts/python")
    npm = "npm.cmd" if os.name == "nt" else "npm"
    celery = VENV_DIR / ("bin/celery" if os.name != "nt" else "Scripts/celery")

    print("🚀 Starting Django backend...")
    backend = create_process([str(python), "manage.py", "runserver", "8000"], cwd=BACKEND)
    
    print("🚀 Starting Portal (User)...")
    portal = create_process([npm, "run", "dev", "--", "-p", "3000"], cwd=PORTAL)
    
    print("🚀 Starting Superadmin...")
    admin = create_process([npm, "run", "dev", "--", "-p", "3001"], cwd=SUPERADMIN)

    print("🚀 Starting Celery Worker...")
    worker = create_process([str(celery), "-A", "core", "worker", "--loglevel=info", "--concurrency=2"], cwd=BACKEND)

    print("🚀 Starting Celery Beat...")
    beat = create_process([str(celery), "-A", "core", "beat", "--loglevel=info"], cwd=BACKEND)

    print("\n" + "=" * 60)
    print("✅ Trippzi is running")
    print("Portal (User):  http://localhost:3000")
    print("Superadmin:     http://localhost:3001")
    print("Backend API:    http://localhost:8000")
    print("Django Admin:   http://localhost:8000/admin")
    print("=" * 60)
    print("Press Ctrl+C to stop")
    print("=" * 60 + "\n")
    
    try:
        while True:
            time.sleep(1)
            if backend.poll() is not None:
                print("⚠️ Backend stopped unexpectedly")
                break
    except KeyboardInterrupt:
        pass
    finally:
        cleanup_processes()

if __name__ == "__main__":
    main()

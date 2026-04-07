import socketio
import time

# 🔥 UPDATE THESE FROM YOUR SEED OUTPUT
ROBOT_ID = "69999b2054f81e3663216f92"
SECRET_KEY = "robot-znvt4n2fbm"

SERVER_URL = "http://localhost:3000"  # Change port if needed

sio = socketio.Client()

@sio.event
def connect():
    print("✅ Connected to backend")

    # Authenticate robot
    sio.emit("robot_connect", {
        "robotId": ROBOT_ID,
        "secretKey": SECRET_KEY
    })

@sio.event
def disconnect():
    print("❌ Disconnected from backend")

@sio.on("auth_failed")
def auth_failed():
    print("🚫 Authentication failed")

def send_telemetry():
    while True:
        print("📡 Sending telemetry...")
        sio.emit("robot_telemetry", {
            "robotId": ROBOT_ID,
            "telemetry": {
                "battery": 88,
                "location": {"x": 1.2, "y": 3.4}
            }
        })
        time.sleep(2)

sio.connect(SERVER_URL)
send_telemetry()
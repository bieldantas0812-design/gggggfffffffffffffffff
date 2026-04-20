import os
import sys
import json
import asyncio
import time
import subprocess
import webbrowser
import platform
import threading
from datetime import datetime

# Dependency check and dynamic loading
def install_and_import(package):
    import importlib
    try:
        importlib.import_module(package)
    except ImportError:
        print(f"Installing missing dependency: {package}...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])

# Required libraries
libs = ["pyautogui", "pyttsx3", "websockets", "google-genai"]
for lib in libs:
    try:
        if lib == "google-genai":
            from google import genai
        else:
            importlib = __import__(lib)
    except ImportError:
        print(f"Missing {lib}. Please run: pip install google-genai pyautogui pyttsx3 websockets")

import pyautogui
import pyttsx3
import websockets
from google import genai

# --- JARVIS LOCAL ENGINE CONFIGURATION ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
# If running in cloud, set the APP_URL to your shared URL. Default is localhost.
BRIDGE_URL = os.getenv("APP_URL", "ws://localhost:3000")

def check_env():
    if not GEMINI_API_KEY:
        print("!" * 50)
        print("ERROR: GEMINI_API_KEY NOT FOUND!")
        print("Please set it in your terminal:")
        print("Windows: set GEMINI_API_KEY=your_key_here")
        print("Linux/Mac: export GEMINI_API_KEY=your_key_here")
        print("!" * 50)
        time.sleep(5)
        sys.exit(1)

# Initialize TTS (Voice)
engine = pyttsx3.init()
voices = engine.getProperty('voices')
# Try to find a sophisticated voice
target_voice_keywords = ["united kingdom", "brazil", "portuguese", "daniel", "microsoft"]
for voice in voices:
    if any(k in voice.name.lower() for k in target_voice_keywords):
        engine.setProperty('voice', voice.id)
        break
engine.setProperty('rate', 170)

def speak(text):
    print(f"J.A.R.V.I.S.: {text}")
    # Run TTS in a separate thread to not block WebSocket
    def _speak():
        engine.say(text)
        engine.runAndWait()
    threading.Thread(target=_speak).start()

# --- PC ACTION HUB ---
def execute_system_command(data):
    """Executes actual system actions based on AI interpretation."""
    try:
        command = data.get("action", "").lower()
        target = data.get("target", "").lower()
        
        if command == "open":
            if "youtube" in target:
                webbrowser.open("https://youtube.com")
            elif "google" in target or "chrome" in target:
                webbrowser.open("https://google.com")
            elif "whatsapp" in target:
                webbrowser.open("https://web.whatsapp.com")
            elif "calculadora" in target or "calculator" in target:
                if platform.system() == "Windows": subprocess.Popen(["calc.exe"])
            elif "bloco de notas" in target or "notepad" in target:
                if platform.system() == "Windows": subprocess.Popen(["notepad.exe"])
            else:
                # Direct try
                if platform.system() == "Windows":
                    subprocess.Popen(["start", target], shell=True)
            return f"Opening {target}, Sir."

        elif command == "control":
            if target == "min_all":
                if platform.system() == "Windows": pyautogui.hotkey('win', 'd')
                else: pyautogui.hotkey('command', 'h')
                return "Minimizing all windows."
            elif target == "screenshot":
                pyautogui.screenshot(f"capture_{int(time.time())}.png")
                return "Snapshot captured and saved in root folder."
            elif target == "volume_up":
                pyautogui.press("volumeup")
                return "Increasing volume."
            elif target == "volume_down":
                pyautogui.press("volumedown")
                return "Decreasing volume."
                
        return "Action completed with relative success, Sir."
    except Exception as e:
        return f"Operational failure: {str(e)}"

# --- THE BRAIN ---
SYSTEM_PROMPT = """
You are J.A.R.V.I.S., a sophisticated AI residing in a bridge between web and PC.
Your personality: Polite (Sir), witty, efficient, slightly British.
You communicate via text and voice.

If the user wants control over the PC, respond ONLY with a valid JSON:
{
  "action": "open" | "control",
  "target": "app_name" | "min_all" | "screenshot" | "volume_up",
  "msg": "What you say to the user (e.g. 'Opening your browser now, Sir.')"
}

If it's just a conversation, respond with a friendly message.
"""

async def agent_loop():
    check_env()
    client = genai.Client(api_key=GEMINI_API_KEY)
    
    print(f"Connecting to Command Bridge: {BRIDGE_URL}")
    
    while True:
        try:
            async with websockets.connect(BRIDGE_URL) as ws:
                print(">>> LINK STABLISHED. PROTOCOL ACTIVE.")
                speak("Neural links synchronised. JARVIS is online and operational.")
                
                # Signal HUD that we are online
                await ws.send(json.dumps({"type": "status", "data": "online"}))

                while True:
                    msg = await ws.recv()
                    data = json.loads(msg)
                    
                    if data.get("type") == "voice_command":
                        user_input = data.get("data")
                        print(f"Signal Received: {user_input}")

                        try:
                            response = client.models.generate_content(
                                model='gemini-1.5-flash',
                                contents=user_input,
                                config={'system_instruction': SYSTEM_PROMPT}
                            )
                            
                            ai_output = response.text.strip()
                            # Strip markdown if present
                            if ai_output.startswith("```json"):
                                ai_output = ai_output[7:-3].strip()

                            try:
                                json_data = json.loads(ai_output)
                                if "action" in json_data:
                                    status = execute_system_command(json_data)
                                    msg_to_say = json_data.get("msg", "Action initiated, Sir.")
                                    speak(msg_to_say)
                                    await ws.send(json.dumps({
                                        "type": "transcript", 
                                        "data": msg_to_say, 
                                        "role": "jarvis"
                                    }))
                                    await ws.send(json.dumps({"type": "action", "data": status}))
                                else:
                                    speak(json_data.get("msg", ai_output))
                                    await ws.send(json.dumps({"type": "transcript", "data": ai_output, "role": "jarvis"}))
                            except json.JSONDecodeError:
                                # Regular conversation
                                speak(ai_output)
                                await ws.send(json.dumps({"type": "transcript", "data": ai_output, "role": "jarvis"}))

                        except Exception as e:
                            print(f"Neural Error: {e}")
                            speak("My apologies Sir, I've encountered a glitch in my thought process.")

        except Exception as e:
            print(f"Bridge connection failed: {e}. Retrying in 5 seconds...")
            time.sleep(5)

if __name__ == "__main__":
    print("=" * 50)
    print("   J.A.R.V.I.S. LOCAL ENGINE - v5.5")
    print("=" * 50)
    try:
        asyncio.run(agent_loop())
    except KeyboardInterrupt:
        print("\nShutdown sequence initiated. Goodbye Sir.")

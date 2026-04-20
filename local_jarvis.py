import os
import sys
import time
import json
import asyncio
import threading
import subprocess
import webbrowser
import pyautogui # For mouse and keyboard control
import pyttsx3 # For text-to-speech
import speech_recognition as sr # For voice-to-text
import websockets # For communication with web HUD
import google.generativeai as genai # The real brain

# JARVIS CONFIGURATION
# You must set your GEMINI_API_KEY as an environment variable
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "YOUR_API_KEY_HERE")
BRIDGE_URL = os.getenv("APP_URL", "ws://localhost:3000") # HUD Bridge

# Initialize Gemini
genai.configure(api_key=GEMINI_API_KEY)

# Initialize TTS
engine = pyttsx3.init()
voices = engine.getProperty('voices')
# Try to find a British voice (Zira is common or look for Daniel)
for voice in voices:
    if "Great Britain" in voice.name or "United Kingdom" in voice.name:
        engine.setProperty('voice', voice.id)
        break
engine.setProperty('rate', 160) # Polite but efficient speed

def speak(text):
    print(f"JARVIS: {text}")
    engine.say(text)
    engine.runAndWait()

# SYSTEM CAPABILITIES (TOOLS)
def open_app(app_name):
    """Opens a system application or URL."""
    if "google" in app_name.lower():
        webbrowser.open("https://www.google.com")
        return "Opened Google, Sir."
    try:
        if sys.platform == "win32":
            subprocess.Popen(["start", app_name], shell=True)
        elif sys.platform == "darwin":
            subprocess.Popen(["open", "-a", app_name])
        else:
            subprocess.Popen([app_name])
        return f"Initiating {app_name}, Sir."
    except Exception as e:
        return f"Unable to launch {app_name}. Error: {str(e)}"

def pc_action(action_type, details=None):
    """Mouse and Keyboard shortcuts."""
    if action_type == "min_all":
        if sys.platform == "win32":
            pyautogui.hotkey('win', 'd')
        else:
            pyautogui.hotkey('command', 'h')
        return "Minimizing all windows to clear your view, Sir."
    elif action_type == "screenshot":
        pyautogui.screenshot("jarvis_capture.png")
        return "Snapshot captured and archived, Sir."
    return "Action protocol not found."

# BRAIN COMPONENT
SYSTEM_PROMPT = """
You are J.A.R.V.I.S., an advanced AI. Your personality is sophisticated, loyal, and efficient.
You have control over the user's local PC via tool calls.
Always confirm actions politely. Refer to the user as 'Sir'.
Available Tools:
- open_app(name): Launch an application.
- pc_action(type): System shortcuts ('min_all', 'screenshot').
- search_web(query): Look something up.

Respond with a JSON object if you want to call a tool:
{"thought": "...", "response": "Visual feedback for user", "tool": "name", "args": {...}}
Or just a string for normal conversation.
"""

model = genai.GenerativeModel('gemini-1.5-flash', system_instruction=SYSTEM_PROMPT)

async def jarvis_loop():
    recognizer = sr.Recognizer()
    mic = sr.Microphone()

    async with websockets.connect(BRIDGE_URL) as websocket:
        print("Protocol Established with HUD Bridge.")
        speak("All systems online, Sir. JARVIS is at your service.")
        
        await websocket.send(json.dumps({"type": "status", "data": "online"}))

        while True:
            try:
                with mic as source:
                    print("Listening for command...")
                    recognizer.adjust_for_ambient_noise(source, duration=0.5)
                    audio = recognizer.listen(source, timeout=10, phrase_time_limit=5)
                
                command = recognizer.recognize_google(audio)
                print(f"User: {command}")
                await websocket.send(json.dumps({"type": "transcript", "data": command, "role": "user"}))

                # Process through Gemini
                response = model.generate_content(command)
                response_text = response.text

                # Check if JSON tool call
                try:
                    data = json.loads(response_text)
                    if "tool" in data:
                        tool_name = data["tool"]
                        args = data.get("args", {})
                        
                        result = ""
                        if tool_name == "open_app":
                            result = open_app(args.get("name"))
                        elif tool_name == "pc_action":
                            result = pc_action(args.get("type"))
                        
                        speak(data.get("response", result))
                        await websocket.send(json.dumps({"type": "action", "data": result}))
                    else:
                        speak(data.get("response", response_text))
                except:
                    speak(response_text)
                    await websocket.send(json.dumps({"type": "transcript", "data": response_text, "role": "jarvis"}))

            except sr.WaitTimeoutError:
                continue
            except sr.UnknownValueError:
                continue
            except Exception as e:
                print(f"Interruption: {e}")
                time.sleep(1)

if __name__ == "__main__":
    print("--- JARVIS LOCAL ENGINE INITIALIZING ---")
    print("Pre-requisites: pip install google-generativeai pyautogui pyttsx3 SpeechRecognition websockets")
    try:
        asyncio.run(jarvis_loop())
    except KeyboardInterrupt:
        print("Powering down.")

@echo off
title JARVIS Environment Setup
echo ======================================================
echo       JARVIS LOCAL ENGINE - SETUP PROTOCOL
echo ======================================================
echo.
echo 1. Checking Python Installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found! Please install Python from python.org
    pause
    exit
)

echo 2. Installing Core Dependencies...
python -m pip install --upgrade pip
python -m pip install google-genai websockets pyautogui pyttsx3
echo.
echo 3. Environment Check Complete.
echo.
echo INSTRUCTIONS:
echo ------------------------------------------------------
echo 1. Set your GEMINI_API_KEY in this terminal:
echo    set GEMINI_API_KEY=your_key_here
echo.
echo 2. Start the engine:
echo    python local_jarvis.py
echo.
echo ------------------------------------------------------
echo Once started, go to your Browser HUD and click the Mic.
echo ======================================================
pause

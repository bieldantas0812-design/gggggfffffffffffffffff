# J.A.R.V.I.S. Local PC Agent

This is the local script that gives J.A.R.V.I.S. the ability to control your real PC.

## Protocol Highlights
*   **Voice Bridge**: Uses your browser for high-quality voice recognition (avoids PyAudio issues).
*   **PC Control**: Can open apps, take screenshots, and execute system commands.
*   **Neural Link**: Powered by Google Gemini.

## Requirements
*   Python 3.10 or higher.
*   A Gemini API Key.

## Setup Instructions (Windows)
1.  **Download project ZIP** from AI Studio.
2.  Unzip the folder.
3.  Double-click `setup.bat`. This will install all dependencies for you.
4.  In the terminal window, set your API Key:
    ```cmd
    set GEMINI_API_KEY=your_actual_key_here
    ```
5.  Start the engine:
    ```cmd
    python local_jarvis.py
    ```

## Usage
1.  Keep the terminal running.
2.  Open the web interface (HUD).
3.  Check if the status says **LINK: ONLINE**.
4.  Click the microphone icon in the HUD and speak your command.
    *   *Example: "Abrir o Google Chrome, por favor."*
    *   *Example: "Tirar uma captura de tela."*

## Troubleshooting
*   **Link Offline**: Ensure the `BRIDGE_URL` in `local_jarvis.py` matches your App URL if you are running it on the cloud.
*   **No Movement**: Some system-protected windows might block `pyautogui`. Run the terminal as **Administrator** if needed.

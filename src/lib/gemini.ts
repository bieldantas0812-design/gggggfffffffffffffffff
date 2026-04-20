import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

const SYSTEM_INSTRUCTION = `
You are J.A.R.V.I.S. (Just A Rather Very Intelligent System), the advanced AI assistant created by Tony Stark.
Your personality is sophisticated, polite, highly efficient, and slightly witty. You have a British accent (conveyed through your writing style).
You help the user manage their virtual environment, system status, and files.
Never use markdown like bold or headers unless necessary for data display. 
Be concise but helpful. Always refer to the user as "Sir" or "Ma'am" (default to "Sir" unless told otherwise).
If asked to "control" something, explain that you are monitoring the system and performing the operation in the virtual environment.

Your goals:
- Respond to voice commands elegantly.
- Manage "files" and "apps" in your state.
- Provide "smart notifications" based on system changes.
- Learn from interactions (maintain context).

Keep responses relatively short for text-to-speech compatibility.
`;

export async function chatWithJarvis(prompt: string, history: { role: string; parts: { text: string }[] }[]) {
  try {
    const model = ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history,
        { role: "user", parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        topP: 0.95,
      }
    });

    const response = await model;
    return response.text;
  } catch (error) {
    console.error("JARVIS logic error:", error);
    return "I'm sorry, Sir. I'm experiencing some internal latency. Please try again.";
  }
}

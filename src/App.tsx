import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Bell, 
  Settings, 
  Terminal, 
  Mic, 
  MicOff, 
  MessageSquare, 
  X, 
  Download,
  ShieldCheck,
  Zap,
  Activity,
  Cpu,
  RefreshCw
} from "lucide-react";
import JarvisEye from "./components/JarvisEye";
import Dashboard from "./components/Dashboard";
import { useVirtualPC } from "./hooks/useVirtualPC";
import { Message } from "./types";

export default function App() {
  const { state, notifications, addNotification } = useVirtualPC();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'jarvis', content: "Welcome back, Sir. Waiting for local link protocol...", timestamp: new Date() }
  ]);
  const [agentStatus, setAgentStatus] = useState<'offline' | 'online'>('offline');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [lastAction, setLastAction] = useState<string>("");
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Connect to the bridge
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.host}`);
    
    socket.onopen = () => {
      console.log("HUD connected to Bridge Server");
      setAgentStatus('offline');
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        console.log("Bridge Payload:", payload);

        if (payload.type === 'status' && payload.data === 'online') {
          setAgentStatus('online');
          addNotification("Connection to Local Agent established, Sir.");
        }
        
        if (payload.type === 'transcript') {
          setMessages(prev => [...prev, { 
            role: payload.role as any, 
            content: payload.data, 
            timestamp: new Date() 
          }]);
        }

        if (payload.type === 'action') {
          setLastAction(payload.data);
          addNotification(`Action Executed: ${payload.data}`);
        }
      } catch (e) {
        console.error("Payload Parse Error", e);
      }
    };

    socket.onclose = () => setAgentStatus('offline');
    setWs(socket);

    return () => socket.close();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="relative h-screen w-full bg-jarvis-bg grid grid-rows-[auto_1fr_auto] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#00f2ff_1px,transparent_1px)] [background-size:20px_20px]" />
      <div className="scanline" />

      {/* Top Bar */}
      <header className="z-10 jarvis-glass px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h1 className="font-display font-bold text-xl tracking-[0.2em] text-jarvis-cyan">J.A.R.V.I.S. HUB</h1>
            <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest leading-none">Command Center v5.0.0</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${agentStatus === 'online' ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5' : 'border-rose-500/30 text-rose-500 bg-rose-500/5'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${agentStatus === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span className="font-mono text-[10px] uppercase font-bold tracking-widest">Local Link: {agentStatus}</span>
          </div>
          <button className="text-white/40 hover:text-white"><Settings size={18} /></button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center gap-8 overflow-y-auto pt-8 pb-32 px-4 no-scrollbar">
        
        <div className="flex flex-col items-center gap-6">
          <JarvisEye isListening={false} isSpeaking={agentStatus === 'online'} />
          
          {agentStatus === 'offline' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="jarvis-glass rounded-2xl p-8 max-w-2xl text-center border-jarvis-cyan/20"
            >
              <h2 className="text-jarvis-cyan font-display text-xl mb-4 tracking-wider uppercase">Local Agent Setup Required</h2>
              <p className="text-white/60 text-sm mb-6 leading-relaxed">
                Sir, to control your actual workstation, I need a local presence. 
                Please export this project and execute the <code className="text-jarvis-cyan bg-white/5 px-2 py-1 rounded">local_jarvis.py</code> script on your machine.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-2 mb-2 text-jarvis-cyan"><Zap size={14} /> <span>Prerequisites</span></div>
                  <pre className="text-[10px] opacity-50 font-mono">pip install google-generativeai pyautogui pyttsx3 SpeechRecognition websockets</pre>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-2 mb-2 text-jarvis-cyan"><ShieldCheck size={14} /> <span>Security</span></div>
                  <p className="text-[10px] opacity-50">Requires local GEMINI_API_KEY environment variable. Grant microphone and accessibility permissions.</p>
                </div>
              </div>

              <div className="mt-8 flex gap-4 justify-center">
                 <button className="flex items-center gap-2 bg-jarvis-cyan text-jarvis-bg px-6 py-2 rounded-full font-bold text-sm tracking-wider hover:scale-105 transition-transform">
                   <Download size={16} /> EXPORT PROJECT
                 </button>
                 <button className="flex items-center gap-2 border border-jarvis-cyan text-jarvis-cyan px-6 py-2 rounded-full font-bold text-sm tracking-wider hover:bg-jarvis-cyan/10">
                   <Terminal size={16} /> VIEW PYTHON CODE
                 </button>
              </div>
            </motion.div>
          )}
        </div>

        <Dashboard state={state} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mx-auto px-4">
          <div className="jarvis-glass rounded-xl p-6 md:col-span-2">
            <h3 className="text-white/40 text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2"><Activity size={14} /> Real-Time Telemetry</h3>
            {lastAction ? (
              <div className="flex flex-col gap-2">
                <div className="text-lg font-display text-jarvis-cyan tracking-tight">{lastAction}</div>
                <div className="text-[10px] font-mono text-white/30 uppercase">Protocol Executed Successfully</div>
              </div>
            ) : (
              <div className="text-white/20 italic text-sm">System standing by for telemetry data...</div>
            )}
            
            <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-3 gap-4">
               <div className="flex flex-col">
                 <span className="text-[9px] uppercase text-white/40">Voice Engine</span>
                 <span className="text-sm font-mono text-jarvis-cyan font-bold">READY</span>
               </div>
               <div className="flex flex-col">
                 <span className="text-[9px] uppercase text-white/40">Neural Link</span>
                 <span className={`text-sm font-mono font-bold ${agentStatus === 'online' ? 'text-emerald-500' : 'text-rose-500'}`}>{agentStatus.toUpperCase()}</span>
               </div>
               <div className="flex flex-col">
                 <span className="text-[9px] uppercase text-white/40">Latency</span>
                 <span className="text-sm font-mono text-white/60">42ms</span>
               </div>
            </div>
          </div>

          <div className="jarvis-glass rounded-xl p-6 flex flex-col h-[300px]">
             <h3 className="text-white/40 text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2"><MessageSquare size={14} /> Uplink Logs</h3>
             <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar pr-2">
                {messages.map((m, i) => (
                  <div key={i} className={`flex flex-col ${m.role === 'jarvis' ? 'items-start' : 'items-end'}`}>
                    <div className={`p-2 rounded-lg text-[11px] ${m.role === 'jarvis' ? 'bg-jarvis-cyan/10 border border-jarvis-cyan/20' : 'bg-white/5 border border-white/10'}`}>
                      {m.content}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
             </div>
          </div>
        </div>
      </main>

      <footer className="z-20 jarvis-glass border-t-0 rounded-t-3xl border-x border-white/10 p-4 pt-6 flex flex-col items-center gap-2">
        <div className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em] flex items-center gap-4">
          <div className="flex items-center gap-1"><Cpu size={12} /> SECURE BRIDGE</div>
          <div className="flex items-center gap-1"><RefreshCw size={12} className="animate-spin-slow" /> SYNCING</div>
        </div>
      </footer>
    </div>
  );
}

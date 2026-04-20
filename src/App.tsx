import { useState, useEffect, useCallback, useRef } from "react";
import { Mic, MicOff, Shield, Activity, Power, Terminal, Zap, MessageSquare, AlertCircle, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import JarvisEye from "./components/JarvisEye";

// Speech Recognition Types
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

interface LogEntry {
  id: string;
  role: 'user' | 'jarvis' | 'system';
  content: string;
  timestamp: string;
}

export default function App() {
  const [isListening, setIsListening] = useState(false);
  const [agentStatus, setAgentStatus] = useState<'offline' | 'online'>('offline');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [transcript, setTranscript] = useState("");
  const ws = useRef<WebSocket | null>(null);
  const recognition = useRef<any>(null);

  const addLog = useCallback((role: 'user' | 'jarvis' | 'system', content: string) => {
    setLogs(prev => [
      { id: Math.random().toString(36), role, content, timestamp: new Date().toLocaleTimeString() },
      ...prev.slice(0, 49)
    ]);
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    if (!SpeechRecognition) {
      addLog('system', "Browser unsupported: Speech Recognition required.");
      return;
    }
    recognition.current = new SpeechRecognition();
    recognition.current.continuous = false;
    recognition.current.lang = 'pt-BR';
    recognition.current.interimResults = true;

    recognition.current.onresult = (event: any) => {
      const current = event.results[event.results.length - 1][0].transcript;
      setTranscript(current);
      if (event.results[0].isFinal) {
        sendCommand(current);
        setTranscript("");
      }
    };

    recognition.current.onend = () => setIsListening(false);
    recognition.current.onerror = (e: any) => {
      console.error("Speech Error:", e);
      setIsListening(false);
    };
  }, [addLog]);

  // WebSocket Connection
  useEffect(() => {
    const connectWS = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const socket = new WebSocket(`${protocol}//${host}`);

      socket.onopen = () => {
        setConnectionError(null);
        addLog('system', "Command Bridge Established.");
        socket.send(JSON.stringify({ type: 'status_check' }));
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'status' && message.data === 'online') {
            setAgentStatus('online');
            addLog('system', "Local JARVIS Agent connected.");
          }
          if (message.type === 'transcript') {
            addLog(message.role, message.data);
          }
          if (message.type === 'action') {
            addLog('system', `EXECUTING: ${message.data}`);
          }
        } catch (e) {
          console.error("WS Parse Error", e);
        }
      };

      socket.onclose = () => {
        setAgentStatus('offline');
        setConnectionError("Link Lost. Reconnecting...");
        setTimeout(connectWS, 3000);
      };

      ws.current = socket;
    };

    connectWS();
    return () => ws.current?.close();
  }, [addLog]);

  const sendCommand = (text: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      addLog('user', text);
      ws.current.send(JSON.stringify({ type: 'voice_command', data: text }));
    } else {
      addLog('system', "ERROR: Command Bridge Down.");
    }
  };

  const toggleVoice = () => {
    if (isListening) {
      recognition.current?.stop();
    } else {
      recognition.current?.start();
      setIsListening(true);
    }
  };

  return (
    <div className="h-screen w-full bg-[#050b10] text-[#00f2ff] font-mono overflow-hidden relative selection:bg-[#00f2ff]/20">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#00f2ff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      
      {/* HUD Header */}
      <header className="p-6 border-b border-[#00f2ff]/20 bg-black/40 backdrop-blur-md flex justify-between items-center relative z-20">
        <div className="flex items-center gap-4">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}>
            <Zap className="text-[#00f2ff]" size={20} />
          </motion.div>
          <div>
            <h1 className="text-xl font-bold tracking-[0.2em] uppercase">J.A.R.V.I.S. HUD</h1>
            <p className="text-[10px] text-[#00f2ff]/60 uppercase tracking-widest">Protocol v5.5 - Neural Bridge</p>
          </div>
        </div>

        <div className="flex gap-6 items-center">
          <div className="flex flex-col items-end">
            <span className="text-[9px] uppercase opacity-50">Local Agent</span>
            <div className={`flex items-center gap-2 ${agentStatus === 'online' ? 'text-emerald-400' : 'text-rose-500'}`}>
              <div className={`w-2 h-2 rounded-full ${agentStatus === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <span className="text-xs font-bold uppercase">{agentStatus}</span>
            </div>
          </div>
          <div className="h-10 w-px bg-[#00f2ff]/20" />
          <Activity size={24} className="opacity-50" />
        </div>
      </header>

      {/* Main UI */}
      <div className="grid grid-cols-12 h-[calc(100vh-80px)] overflow-hidden">
        {/* Left Panel: Status/Tech */}
        <aside className="col-span-3 border-r border-[#00f2ff]/10 p-6 flex flex-col gap-8 bg-black/20">
          <div className="space-y-4">
            <h3 className="text-sm font-bold flex items-center gap-2"><Cpu size={16}/> SYSTEM_METRICS</h3>
            <div className="space-y-2 opacity-80">
              {['CPU_LOAD', 'MEM_FREQ', 'NET_LINK', 'GPIO_STB'].map((stat, i) => (
                <div key={stat} className="flex justify-between text-[10px]">
                  <span>{stat}</span>
                  <span className="text-emerald-400">{Math.floor(Math.random() * 40 + 20)}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
             <h3 className="text-sm font-bold flex items-center gap-2"><Terminal size={16}/> SIGNAL_LOGS</h3>
             <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-hide">
                {logs.map(log => (
                  <div key={log.id} className="text-[9px] border-l border-[#00f2ff]/20 pl-2 py-1 bg-white/5">
                    <div className="flex justify-between items-center opacity-40 mb-1">
                      <span className="font-bold">{log.role.toUpperCase()}</span>
                      <span>{log.timestamp}</span>
                    </div>
                    <div className={log.role === 'system' ? 'text-[#00f2ff]/60' : 'text-white'}>{log.content}</div>
                  </div>
                ))}
             </div>
          </div>
        </aside>

        {/* Center Panel: The Eye */}
        <main className="col-span-6 relative flex flex-col items-center justify-center p-12 overflow-hidden bg-gradient-to-b from-transparent to-black/40">
          <AnimatePresence>
            {connectionError && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-8 px-6 py-2 bg-rose-500/20 border border-rose-500 text-rose-500 text-xs flex items-center gap-2 rounded-full uppercase"
              >
                <AlertCircle size={14} /> {connectionError}
              </motion.div>
            )}
          </AnimatePresence>

          <JarvisEye isListening={isListening} isSpeaking={isListening} />
          
          <div className="mt-12 w-full max-w-sm">
            <div className="h-6 text-center italic text-lg text-white/80 transition-all">
              {transcript || (isListening ? "Listening..." : "")}
            </div>
          </div>

          {/* Voice Button */}
          <div className="absolute bottom-12 flex flex-col items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleVoice}
              className={`w-24 h-24 rounded-full border-2 flex items-center justify-center transition-all duration-500 group relative
                ${isListening 
                  ? 'border-rose-500/50 bg-rose-500 shadow-[0_0_50px_rgba(244,63,94,0.4)]' 
                  : 'border-[#00f2ff]/50 bg-[#00f2ff]/10 hover:bg-[#00f2ff]/20 shadow-[0_0_30px_rgba(0,242,255,0.2)]'
                }`}
            >
              {isListening ? <MicOff size={32} className="text-white" /> : <Mic size={32} className="text-[#00f2ff]" />}
              {/* Outer rings */}
              <div className="absolute -inset-4 border border-[#00f2ff]/10 rounded-full animate-[spin_8s_linear_infinite]" />
              <div className="absolute -inset-8 border border-[#00f2ff]/5 rounded-full animate-[spin_12s_linear_infinite_reverse]" />
            </motion.button>
            <span className="text-[10px] uppercase tracking-[0.5em] font-bold opacity-30 mt-4">Manual_Uplink</span>
          </div>
        </main>

        {/* Right Panel: Tools/Shortcuts */}
        <aside className="col-span-3 border-l border-[#00f2ff]/10 p-6 flex flex-col gap-6 bg-black/20">
          <h3 className="text-sm font-bold flex items-center gap-2"><Zap size={16}/> QUICK_COMMANDS</h3>
          <div className="grid grid-cols-1 gap-2">
            {[
              "Abrir Chrome", "Tirar Screenshot", "Minimizar Tudo", "Ouvir Música", "Status Sistema"
            ].map(cmd => (
              <button 
                key={cmd}
                onClick={() => sendCommand(cmd)}
                className="text-[10px] text-left p-3 border border-[#00f2ff]/10 bg-white/5 hover:bg-[#00f2ff]/20 hover:border-[#00f2ff]/40 transition-all uppercase"
              >
                {cmd}
              </button>
            ))}
          </div>

          <div className="mt-auto p-4 border border-[#00f2ff]/10 bg-white/5 rounded">
            <h4 className="text-[10px] font-bold mb-2">LOCAL_SETUP_GUIDE</h4>
            <div className="text-[9px] opacity-70 leading-relaxed">
              1. Download project ZIP<br/>
              2. unzip & cd to root<br/>
              3. Run `setup.bat` (first time)<br/>
              4. Run `py local_jarvis.py`
            </div>
          </div>
        </aside>
      </div>

      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#00f2ff]" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#00f2ff]" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#00f2ff]" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#00f2ff]" />
    </div>
  );
}

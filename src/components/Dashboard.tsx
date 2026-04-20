import { motion } from "motion/react";
import { Cpu, Database, HardDrive, Network, Folder, Activity } from "lucide-react";
import { SystemState } from "../types";

interface DashboardProps {
  state: SystemState;
}

export default function Dashboard({ state }: DashboardProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 w-full max-w-6xl mx-auto">
      {/* CPU Usage */}
      <div className="jarvis-glass rounded-lg p-4 flex flex-col gap-2 relative overflow-hidden">
        <div className="flex items-center justify-between text-white/50 text-xs font-mono uppercase">
          <span className="flex items-center gap-1"><Cpu size={14} /> Processor</span>
          <span>{state.cpu}%</span>
        </div>
        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${state.cpu}%` }}
            className="h-full bg-jarvis-cyan"
          />
        </div>
        <div className="text-xl font-display font-medium text-jarvis-cyan">Core Pulse</div>
      </div>

      {/* Memory Usage */}
      <div className="jarvis-glass rounded-lg p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between text-white/50 text-xs font-mono uppercase">
          <span className="flex items-center gap-1"><Database size={14} /> Neural Links</span>
          <span>{state.memory}%</span>
        </div>
        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${state.memory}%` }}
            className="h-full bg-jarvis-cyan"
          />
        </div>
        <div className="text-xl font-display font-medium text-jarvis-cyan">Memory Bank</div>
      </div>

      {/* Storage */}
      <div className="jarvis-glass rounded-lg p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between text-white/50 text-xs font-mono uppercase">
          <span className="flex items-center gap-1"><HardDrive size={14} /> Datastream</span>
          <span>{state.storage}%</span>
        </div>
        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${state.storage}%` }}
            className="h-full bg-jarvis-cyan"
          />
        </div>
        <div className="text-xl font-display font-medium text-jarvis-cyan">Storage Hub</div>
      </div>

      {/* Network */}
      <div className="jarvis-glass rounded-lg p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between text-white/50 text-xs font-mono uppercase">
          <span className="flex items-center gap-1"><Network size={14} /> Network</span>
          <span>{state.network} Mbps</span>
        </div>
        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
          <motion.div 
             animate={{ x: [-10, 10, -10] }}
             transition={{ repeat: Infinity, duration: 2 }}
             className="h-full w-1/3 bg-jarvis-cyan/50"
          />
        </div>
        <div className="text-xl font-display font-medium text-jarvis-cyan">Connection</div>
      </div>
    </div>
  );
}

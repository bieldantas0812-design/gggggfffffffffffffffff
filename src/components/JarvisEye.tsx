import { motion } from "motion/react";

interface JarvisEyeProps {
  isListening: boolean;
  isSpeaking: boolean;
}

export default function JarvisEye({ isListening, isSpeaking }: JarvisEyeProps) {
  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      {/* Background Pulse Rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="absolute w-full h-full border border-jarvis-cyan/20 rounded-full pulse-ring"
            style={{ animationDelay: `${i * 1.3}s` }}
          />
        ))}
      </div>

      {/* Main Core */}
      <motion.div
        animate={{
          scale: isListening ? [1, 1.1, 1] : 1,
          rotate: isSpeaking ? [0, 180, 360] : 0,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative w-32 h-32 rounded-full bg-transparent border-2 border-jarvis-cyan shadow-[0_0_30px_rgba(0,242,255,0.4)] flex items-center justify-center overflow-hidden"
      >
        {/* Inner Details */}
        <div className="absolute inset-0 border border-jarvis-cyan/30 rounded-full scale-90" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1 h-1 bg-jarvis-cyan rounded-full jarvis-glow" />
        </div>
        
        {/* Rotating Arcs */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-2 border-t-2 border-jarvis-cyan/50 rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute inset-4 border-b-2 border-jarvis-cyan/30 rounded-full"
        />
      </motion.div>

      {/* Listening Indicator */}
      {isListening && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -bottom-8 text-jarvis-cyan font-display text-xs tracking-widest uppercase"
        >
          Listening...
        </motion.div>
      )}
    </div>
  );
}

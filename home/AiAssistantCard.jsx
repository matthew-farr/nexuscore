import { motion } from "framer-motion";
import { Sparkles, Zap } from "lucide-react";

function ElectricWaveSVG() {
  return (
    <svg
      viewBox="0 0 320 180"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", overflow: "visible" }}
    >
      <defs>
        <linearGradient id="ai-wave-1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#7c3aed" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ec2ca3" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="ai-wave-2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ec2ca3" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="ai-wave-3" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.5" />
        </linearGradient>
        <filter id="ai-blur-8"><feGaussianBlur stdDeviation="8" /></filter>
        <filter id="ai-blur-4"><feGaussianBlur stdDeviation="4" /></filter>
        <filter id="ai-blur-2"><feGaussianBlur stdDeviation="2" /></filter>
      </defs>

      {/* Glow orbs */}
      <g filter="url(#ai-blur-8)">
        <circle cx="240" cy="40" r="50" fill="rgba(236,44,163,0.45)">
          <animate attributeName="r" values="50;62;44;50" dur="8s" repeatCount="indefinite" />
        </circle>
        <circle cx="80" cy="140" r="35" fill="rgba(34,211,238,0.35)">
          <animate attributeName="r" values="35;45;28;35" dur="11s" repeatCount="indefinite" />
        </circle>
        <circle cx="280" cy="140" r="28" fill="rgba(124,58,237,0.40)">
          <animate attributeName="r" values="28;36;22;28" dur="9s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* Wide glow waves */}
      <g filter="url(#ai-blur-8)">
        <path d="M -20,120 C 60,60 120,150 200,80 C 260,30 300,90 340,60" stroke="url(#ai-wave-1)" strokeWidth="32" fill="none" strokeLinecap="round">
          <animateTransform attributeName="transform" type="translate" values="0,0;10,8;-6,12;0,0" dur="9s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1" />
        </path>
        <path d="M -20,80 C 80,140 160,40 240,100 C 290,140 320,80 360,100" stroke="url(#ai-wave-2)" strokeWidth="24" fill="none" strokeLinecap="round">
          <animateTransform attributeName="transform" type="translate" values="0,0;-8,6;6,-8;0,0" dur="12s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1" />
        </path>
      </g>

      {/* Sharp mid waves */}
      <g filter="url(#ai-blur-4)">
        <path d="M -20,120 C 60,60 120,150 200,80 C 260,30 300,90 340,60" stroke="url(#ai-wave-1)" strokeWidth="14" fill="none" strokeLinecap="round">
          <animateTransform attributeName="transform" type="translate" values="0,0;8,6;-5,10;0,0" dur="9s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1" />
        </path>
        <path d="M -20,80 C 80,140 160,40 240,100 C 290,140 320,80 360,100" stroke="url(#ai-wave-2)" strokeWidth="10" fill="none" strokeLinecap="round">
          <animateTransform attributeName="transform" type="translate" values="0,0;-6,5;5,-6;0,0" dur="12s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1" />
        </path>
        <path d="M 0,150 C 80,100 140,160 220,110 C 280,70 310,120 340,90" stroke="url(#ai-wave-3)" strokeWidth="8" fill="none" strokeLinecap="round">
          <animateTransform attributeName="transform" type="translate" values="0,0;6,-4;-4,8;0,0" dur="10s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1" />
        </path>
      </g>

      {/* Specular streak */}
      <g filter="url(#ai-blur-2)">
        <path d="M 10,115 C 80,62 130,145 205,78 C 262,32 302,88 338,62" stroke="rgba(255,255,255,0.60)" strokeWidth="3" fill="none" strokeLinecap="round">
          <animate attributeName="opacity" values="0.3;0.9;0.5;0.3" dur="5s" repeatCount="indefinite" />
        </path>
      </g>
    </svg>
  );
}

export default function AiAssistantCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="relative overflow-hidden rounded-2xl p-6"
      style={{
        background: "linear-gradient(135deg, #0d0a1a 0%, #0a0f2e 100%)",
        border: "1px solid rgba(236,44,163,0.25)",
        boxShadow: "0 8px 40px rgba(124,58,237,0.18), 0 2px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
        minHeight: "180px",
      }}
    >
      {/* Animated wave background */}
      <div className="absolute inset-0 opacity-70">
        <ElectricWaveSVG />
      </div>

      {/* Gradient overlay for text readability */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(90deg, rgba(10,8,26,0.92) 0%, rgba(10,8,26,0.80) 50%, rgba(10,8,26,0.30) 100%)",
        }}
      />

      {/* Top edge glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-glow-pink/60 to-transparent" />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-5 h-5 rounded-md flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #ec2ca3, #7c3aed)" }}
          >
            <Zap className="w-3 h-3 text-white" />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-cyan-400">AI Assistant</p>
        </div>

        <h3 className="text-xl font-bold text-white mb-1 leading-tight">Need answers fast?</h3>
        <p className="text-sm text-white/55 mb-5 leading-relaxed">
          Ask AI anything about<br />Checks Direct
        </p>

        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0 12px 35px rgba(236,44,163,0.5)" }}
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
          style={{
            background: "linear-gradient(135deg, #ec2ca3, #7c3aed)",
            boxShadow: "0 6px 24px rgba(236,44,163,0.35)",
            border: "none",
            cursor: "pointer",
          }}
        >
          <Sparkles className="w-4 h-4" />
          Ask AI
        </motion.button>
      </div>
    </motion.div>
  );
}
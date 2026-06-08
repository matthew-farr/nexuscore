import { motion } from "framer-motion";
import {
  Megaphone, GraduationCap, UploadCloud, ExternalLink,
  BookOpen, CalendarPlus, Shield, BarChart2, ChevronRight, Zap
} from "lucide-react";

const actions = [
  { icon: Megaphone,    label: "Create Announcement",  accent: "#ec2ca3" },
  { icon: GraduationCap, label: "Assign Training",      accent: "#8b5cf6" },
  { icon: UploadCloud,  label: "Upload Resource",       accent: "#22d3ee" },
  { icon: ExternalLink, label: "Open HubSpot",          accent: "#ff7a59" },
  { icon: BookOpen,     label: "New Knowledge Article", accent: "#10b981" },
  { icon: CalendarPlus, label: "Create Calendar Event", accent: "#0ea5e9" },
  { icon: Shield,       label: "View Policies",         accent: "#f59e0b" },
  { icon: BarChart2,    label: "Open Reports",          accent: "#7c3aed" },
];

export default function QuickActionsWidget() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: "linear-gradient(145deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.018) 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.07)",
      }}
    >
      {/* Top edge shimmer */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

      {/* Ambient corner glow */}
      <div
        className="absolute -top-6 -right-6 w-28 h-28 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 70%)",
          filter: "blur(16px)",
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #ec2ca3, #7c3aed)" }}
          >
            <Zap className="w-3 h-3 text-white" />
          </div>
          <h3 className="text-sm font-bold text-foreground tracking-tight">Quick Actions</h3>
        </div>
      </div>

      {/* Actions grid */}
      <div className="px-4 pb-4 grid grid-cols-2 gap-2">
        {actions.map((action, i) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 + i * 0.04 }}
              whileHover={{
                y: -2,
                boxShadow: `0 8px 24px rgba(0,0,0,0.14), inset 0 0 0 1px ${action.accent}40`,
                transition: { duration: 0.18 },
              }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left group relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${action.accent}12 0%, ${action.accent}06 100%)`,
                border: `1px solid ${action.accent}22`,
                cursor: "pointer",
              }}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none rounded-xl"
                style={{
                  background: `radial-gradient(circle at 30% 50%, ${action.accent}18 0%, transparent 70%)`,
                }}
              />

              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 relative z-10"
                style={{
                  background: `${action.accent}20`,
                  border: `1px solid ${action.accent}35`,
                }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: action.accent }} />
              </div>

              <span className="text-[12px] font-semibold text-foreground leading-tight relative z-10">
                {action.label}
              </span>

              <ChevronRight
                className="w-3 h-3 ml-auto flex-shrink-0 opacity-0 group-hover:opacity-60 transition-opacity duration-200 relative z-10"
                style={{ color: action.accent }}
              />
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
import { motion } from "framer-motion";
import {
  Calendar, AlertTriangle, Bell, FileCheck, Clock, TrendingUp,
  ChevronRight, Circle
} from "lucide-react";

const items = [
  {
    type: "meeting",
    icon: Calendar,
    accent: "#22d3ee",
    priority: "normal",
    label: "Team Standup",
    meta: "9:30 AM · Google Meet",
    tag: "In 25 min",
    tagColor: "#22d3ee",
  },
  {
    type: "overdue",
    icon: AlertTriangle,
    accent: "#f59e0b",
    priority: "high",
    label: "GDPR Refresher Training",
    meta: "Compliance · Due 3 days ago",
    tag: "Overdue",
    tagColor: "#f59e0b",
  },
  {
    type: "announcement",
    icon: Bell,
    accent: "#ec2ca3",
    priority: "normal",
    label: "Q2 Company Update",
    meta: "From: CEO · 2 hours ago",
    tag: "Unread",
    tagColor: "#ec2ca3",
  },
  {
    type: "policy",
    icon: FileCheck,
    accent: "#8b5cf6",
    priority: "normal",
    label: "Remote Work Policy v3",
    meta: "Requires acknowledgement",
    tag: "Action needed",
    tagColor: "#8b5cf6",
  },
  {
    type: "reminder",
    icon: Clock,
    accent: "#10b981",
    priority: "normal",
    label: "Timesheet submission",
    meta: "Operations · Due today",
    tag: "Reminder",
    tagColor: "#10b981",
  },
  {
    type: "update",
    icon: TrendingUp,
    accent: "#0ea5e9",
    priority: "normal",
    label: "Sales dashboard updated",
    meta: "New pipeline data available",
    tag: "New",
    tagColor: "#0ea5e9",
  },
];

export default function TodayAtChecks() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: "linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
        border: "1px solid rgba(255,255,255,0.09)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      {/* Top edge shimmer */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

      {/* Ambient glow */}
      <div
        className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(236,44,163,0.12) 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #ec2ca3, #7c3aed)" }}
          >
            <Circle className="w-2.5 h-2.5 text-white fill-white" />
          </div>
          <h3 className="text-sm font-bold text-foreground tracking-tight">Today at Checks Direct</h3>
        </div>
        <button className="text-[11px] font-medium text-primary hover:opacity-80 transition-opacity flex items-center gap-0.5">
          View all <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Items */}
      <div className="px-3 pb-4 space-y-1">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.3 + i * 0.06 }}
              whileHover={{ x: 2, backgroundColor: "rgba(255,255,255,0.04)", transition: { duration: 0.15 } }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left group transition-all duration-200"
            >
              {/* Priority dot + icon */}
              <div className="relative flex-shrink-0">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: `${item.accent}18`,
                    border: `1px solid ${item.accent}30`,
                  }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: item.accent }} />
                </div>
                {item.priority === "high" && (
                  <div
                    className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                    style={{
                      background: item.accent,
                      boxShadow: `0 0 6px ${item.accent}`,
                    }}
                  />
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground truncate leading-tight">{item.label}</p>
                <p className="text-[11px] text-foreground/45 truncate mt-0.5 leading-tight">{item.meta}</p>
              </div>

              {/* Tag */}
              <span
                className="flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  color: item.tagColor,
                  background: `${item.tagColor}18`,
                  border: `1px solid ${item.tagColor}30`,
                }}
              >
                {item.tag}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
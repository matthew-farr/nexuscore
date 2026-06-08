import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown, User, LogOut, Settings, Bell,
  BookOpen, Bookmark, CheckCircle, AlertCircle, Clock,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useTheme } from "../ThemeProvider";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getInitials(profile) {
  if (profile?.first_name && profile?.last_name) {
    return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
  }
  if (profile?.display_name) {
    const parts = profile.display_name.trim().split(" ");
    return parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0][0].toUpperCase();
  }
  if (profile?.email) return profile.email[0].toUpperCase();
  return "?";
}

const STATUS_CONFIG = {
  Active:   { color: "#10b981", bg: "rgba(16,185,129,0.15)", border: "rgba(16,185,129,0.30)", Icon: CheckCircle },
  Inactive: { color: "#ef4444", bg: "rgba(239,68,68,0.15)",  border: "rgba(239,68,68,0.30)",  Icon: AlertCircle },
  "On Leave": { color: "#f59e0b", bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.30)", Icon: Clock },
};

// ─── Avatar ──────────────────────────────────────────────────────────────────

function Avatar({ profile, size = "sm" }) {
  const dim = size === "lg" ? "w-14 h-14 text-lg" : "w-8 h-8 text-xs";
  const ringSize = size === "lg" ? "-inset-[3px]" : "-inset-[2px]";

  return (
    <div className="relative flex-shrink-0">
      {/* Glow ring */}
      <div
        className={`absolute ${ringSize} rounded-full pointer-events-none`}
        style={{
          background: "linear-gradient(135deg, #ec2ca3, #7c3aed, #0ea5e9)",
          borderRadius: "50%",
          padding: size === "lg" ? "3px" : "2px",
          opacity: 0.85,
        }}
      />
      {profile?.profile_photo_url ? (
        <img
          src={profile.profile_photo_url}
          alt=""
          className={`${dim} rounded-full object-cover relative z-10`}
          style={{ border: "2px solid transparent" }}
        />
      ) : (
        <div
          className={`${dim} rounded-full bg-gradient-to-br from-glow-pink to-glow-purple flex items-center justify-center text-white font-bold relative z-10`}
          style={{ border: size === "lg" ? "2px solid rgba(0,0,0,0.2)" : "1.5px solid rgba(0,0,0,0.2)" }}
        >
          {profile ? getInitials(profile) : "…"}
        </div>
      )}
    </div>
  );
}

// ─── Quick Action Button ──────────────────────────────────────────────────────

function QuickAction({ icon: Icon, label, onClick, isDark, accentColor, disabled }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.96 }}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-xl transition-all duration-150 flex-1"
      style={{
        background: hovered
          ? isDark ? `rgba(255,255,255,0.09)` : `rgba(0,0,0,0.05)`
          : isDark ? "rgba(255,255,255,0.045)" : "rgba(0,0,0,0.028)",
        border: hovered
          ? isDark ? "1px solid rgba(255,255,255,0.14)" : "1px solid rgba(0,0,0,0.10)"
          : isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.06)",
        boxShadow: hovered
          ? isDark ? `0 4px 16px rgba(0,0,0,0.25), 0 0 0 1px ${accentColor}22` : `0 2px 10px rgba(0,0,0,0.06)`
          : "none",
        opacity: disabled ? 0.45 : 1,
        cursor: disabled ? "default" : "pointer",
      }}
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center"
        style={{
          background: hovered ? `${accentColor}22` : `${accentColor}14`,
          border: `1px solid ${accentColor}30`,
        }}
      >
        <Icon className="w-3.5 h-3.5" style={{ color: accentColor }} />
      </div>
      <span
        className="text-[10px] font-semibold leading-tight text-center"
        style={{ color: isDark ? "rgba(255,255,255,0.72)" : "#334155" }}
      >
        {label}
      </span>
    </motion.button>
  );
}

// ─── Footer Item ─────────────────────────────────────────────────────────────

function FooterItem({ icon: Icon, label, onClick, isDark, danger, muted }) {
  const [hovered, setHovered] = useState(false);
  const color = danger ? "#f43f5e" : isDark ? "rgba(255,255,255,0.80)" : "#1e293b";
  const hoverBg = danger
    ? isDark ? "rgba(244,63,94,0.10)" : "rgba(244,63,94,0.06)"
    : isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.04)";

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium transition-all duration-120"
      style={{
        background: hovered ? hoverBg : "transparent",
        color,
        opacity: muted ? 0.5 : 1,
      }}
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{
          background: hovered
            ? danger ? "rgba(244,63,94,0.15)" : isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.06)"
            : isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
          border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.07)",
        }}
      >
        <Icon className="w-3.5 h-3.5" style={{ color }} />
      </div>
      <span>{label}</span>
      {muted && (
        <span
          className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
          style={{
            background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
            color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)",
          }}
        >
          Soon
        </span>
      )}
    </button>
  );
}

// ─── Gradient Separator ───────────────────────────────────────────────────────

function GradSep({ isDark }) {
  return (
    <div
      className="mx-4 my-0.5"
      style={{
        height: "1px",
        background: isDark
          ? "linear-gradient(to right, transparent, rgba(255,255,255,0.10), transparent)"
          : "linear-gradient(to right, transparent, rgba(0,0,0,0.08), transparent)",
      }}
    />
  );
}

// ─── Section Label ────────────────────────────────────────────────────────────

function SectionLabel({ label, isDark }) {
  return (
    <p
      className="px-4 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest"
      style={{ color: isDark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.32)" }}
    >
      {label}
    </p>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProfileMenu() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const menuRef = useRef(null);

  useEffect(() => {
    (async () => {
      const res = await base44.functions.invoke("getOrCreateProfile", {});
      if (res.data?.profile) setProfile(res.data.profile);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const displayName = profile?.preferred_name || profile?.display_name || "Loading…";
  const subtitle = profile?.job_title || profile?.department || profile?.role_type || "";
  const completion = profile?.profile_completion_percentage ?? 0;
  const statusCfg = STATUS_CONFIG[profile?.employment_status] || STATUS_CONFIG.Active;
  const StatusIcon = statusCfg.Icon;

  const dropdownStyle = {
    background: isDark
      ? "linear-gradient(160deg, rgba(18,12,38,0.98) 0%, rgba(10,8,28,0.99) 100%)"
      : "linear-gradient(160deg, rgba(255,255,255,0.99) 0%, rgba(246,244,255,0.98) 100%)",
    border: isDark
      ? "1px solid rgba(255,255,255,0.12)"
      : "1px solid rgba(0,0,0,0.09)",
    boxShadow: isDark
      ? "0 32px 80px rgba(0,0,0,0.65), 0 8px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.10), inset 1px 0 0 rgba(255,255,255,0.04)"
      : "0 16px 60px rgba(0,0,0,0.14), 0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,1)",
    backdropFilter: "blur(40px)",
  };

  const completionColor =
    completion >= 80 ? "#10b981" : completion >= 50 ? "#f59e0b" : "#ec2ca3";

  return (
    <div className="relative" ref={menuRef}>

      {/* ── Trigger ── */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2.5 ml-3 pl-3 border-l border-border/40"
      >
        {loading ? (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-glow-pink/40 to-glow-purple/40 animate-pulse" />
        ) : (
          <Avatar profile={profile} size="sm" />
        )}
        <div className="text-left hidden md:block">
          {loading ? (
            <div className="space-y-1">
              <div className="h-2.5 w-20 rounded bg-foreground/10 animate-pulse" />
              <div className="h-2 w-12 rounded bg-foreground/10 animate-pulse" />
            </div>
          ) : (
            <>
              <p className="text-xs font-semibold leading-tight text-foreground">{displayName}</p>
              <p className="text-[10px] leading-tight text-foreground/60">{subtitle || "—"}</p>
            </>
          )}
        </div>
        <ChevronDown
          className="w-3 h-3 hidden md:block text-foreground/50 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </motion.button>

      {/* ── Dropdown ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ duration: 0.20, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute right-0 top-full mt-2.5 w-[360px] rounded-2xl overflow-hidden z-50"
            style={dropdownStyle}
          >
            {/* Top edge neon line */}
            <div
              className="absolute inset-x-0 top-0 h-px pointer-events-none"
              style={{
                background: "linear-gradient(to right, transparent 5%, #ec2ca3 30%, #7c3aed 55%, #0ea5e9 80%, transparent 95%)",
                opacity: isDark ? 0.75 : 0.45,
              }}
            />

            {/* ── Profile Header ── */}
            <div
              className="px-5 pt-5 pb-4"
              style={{
                background: isDark
                  ? "linear-gradient(160deg, rgba(236,44,163,0.07) 0%, rgba(124,58,237,0.05) 60%, transparent 100%)"
                  : "linear-gradient(160deg, rgba(236,44,163,0.04) 0%, rgba(124,58,237,0.03) 60%, transparent 100%)",
              }}
            >
              <div className="flex items-start gap-4">
                <Avatar profile={profile} size="lg" />
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="font-bold text-[15px] leading-tight truncate"
                    style={{ color: isDark ? "#ffffff" : "#0f172a" }}>
                    {profile?.preferred_name || profile?.display_name || "—"}
                  </p>
                  <p className="text-[12px] mt-0.5 truncate"
                    style={{ color: isDark ? "rgba(255,255,255,0.62)" : "#475569" }}>
                    {profile?.email || "—"}
                  </p>
                  {(profile?.job_title || profile?.department) && (
                    <p className="text-[11px] mt-0.5 truncate"
                      style={{ color: isDark ? "rgba(255,255,255,0.45)" : "#64748b" }}>
                      {profile.job_title}{profile.job_title && profile.department ? " · " : ""}{profile.department}
                    </p>
                  )}

                  {/* Badges row */}
                  <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                    {profile?.staff_code && (
                      <span
                        className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg"
                        style={{ background: "rgba(236,44,163,0.18)", color: "#ec2ca3", border: "1px solid rgba(236,44,163,0.35)" }}
                      >
                        {profile.staff_code}
                      </span>
                    )}
                    {profile?.role_type && (
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-lg"
                        style={{
                          background: isDark ? "rgba(124,58,237,0.18)" : "rgba(124,58,237,0.10)",
                          color: isDark ? "#a78bfa" : "#7c3aed",
                          border: isDark ? "1px solid rgba(124,58,237,0.35)" : "1px solid rgba(124,58,237,0.22)",
                        }}
                      >
                        {profile.role_type}
                      </span>
                    )}
                    {profile?.employment_status && (
                      <span
                        className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-lg"
                        style={{ background: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.border}` }}
                      >
                        <StatusIcon className="w-2.5 h-2.5" />
                        {profile.employment_status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <GradSep isDark={isDark} />

            {/* ── Operational Stats ── */}
            <div className="px-4 py-3">
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    label: "Department",
                    value: profile?.department || "—",
                    color: "#0ea5e9",
                  },
                  {
                    label: "Status",
                    value: profile?.employment_status || "—",
                    color: statusCfg.color,
                  },
                  {
                    label: "Completion",
                    value: `${completion}%`,
                    color: completionColor,
                  },
                ].map(({ label, value, color }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl"
                    style={{
                      background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                      border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.06)",
                    }}
                  >
                    <p className="text-[11px] font-bold leading-tight text-center truncate w-full text-center"
                      style={{ color }}>
                      {value}
                    </p>
                    <p className="text-[9.5px] font-medium leading-tight text-center"
                      style={{ color: isDark ? "rgba(255,255,255,0.38)" : "#94a3b8" }}>
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Profile completion bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-semibold"
                    style={{ color: isDark ? "rgba(255,255,255,0.45)" : "#64748b" }}>
                    Profile completeness
                  </span>
                  <span className="text-[10px] font-bold" style={{ color: completionColor }}>
                    {completion}%
                  </span>
                </div>
                <div
                  className="w-full rounded-full overflow-hidden"
                  style={{
                    height: "5px",
                    background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)",
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completion}%` }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(to right, #ec2ca3, ${completionColor})`,
                      boxShadow: `0 0 8px ${completionColor}60`,
                    }}
                  />
                </div>
              </div>
            </div>

            <GradSep isDark={isDark} />

            {/* ── Quick Access ── */}
            <SectionLabel label="Quick Access" isDark={isDark} />
            <div className="flex items-stretch gap-2 px-4 pb-3">
              <QuickAction icon={User} label="My Profile" isDark={isDark} accentColor="#ec2ca3"
                onClick={() => { setOpen(false); navigate("/my-profile"); }} />
              <QuickAction icon={Bell} label="Notifications" isDark={isDark} accentColor="#0ea5e9" disabled />
              <QuickAction icon={BookOpen} label="Learning" isDark={isDark} accentColor="#7c3aed"
                onClick={() => { setOpen(false); navigate("/learning"); }} />
              <QuickAction icon={Bookmark} label="Bookmarks" isDark={isDark} accentColor="#22d3ee" disabled />
            </div>

            <GradSep isDark={isDark} />

            {/* ── Footer ── */}
            <div className="py-1.5">
              <FooterItem icon={Settings} label="Settings" isDark={isDark} muted
                onClick={() => setOpen(false)} />
            </div>

            {/* Sign out separated */}
            <div
              className="mx-3 mb-3 rounded-xl overflow-hidden"
              style={{
                background: isDark ? "rgba(244,63,94,0.07)" : "rgba(244,63,94,0.04)",
                border: isDark ? "1px solid rgba(244,63,94,0.18)" : "1px solid rgba(244,63,94,0.14)",
              }}
            >
              <FooterItem
                icon={LogOut}
                label="Sign out"
                isDark={isDark}
                danger
                onClick={() => { setOpen(false); base44.auth.logout(); }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
import { motion } from "framer-motion";
import { useTheme } from "../ThemeProvider";
import { Camera, CheckCircle, Clock, UserCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const STATUS_COLORS = {
  Active: "#10b981",
  Inactive: "#ef4444",
  "On Leave": "#f59e0b",
};

export default function ProfileHeroCard({ profile, onPhotoUpload, isOwnProfile }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const completionColor =
    profile.profile_completion_percentage >= 80
      ? "#10b981"
      : profile.profile_completion_percentage >= 50
      ? "#f59e0b"
      : "#ef4444";

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file || !onPhotoUpload) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onPhotoUpload(file_url);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl p-6"
      style={{
        background: isDark
          ? "linear-gradient(135deg, rgba(236,44,163,0.12) 0%, rgba(124,58,237,0.08) 50%, rgba(14,165,233,0.06) 100%)"
          : "linear-gradient(135deg, rgba(236,44,163,0.06) 0%, rgba(255,255,255,0.92) 60%, rgba(14,165,233,0.04) 100%)",
        border: isDark ? "1px solid rgba(236,44,163,0.20)" : "1px solid rgba(0,0,0,0.07)",
        backdropFilter: "blur(24px)",
        boxShadow: isDark
          ? "0 8px 40px rgba(0,0,0,0.35), 0 0 60px rgba(236,44,163,0.06), inset 0 1px 0 rgba(255,255,255,0.07)"
          : "0 4px 24px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.90)",
      }}
    >
      {/* Ambient glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: "linear-gradient(135deg, #ec2ca3, #7c3aed)" }} />
      <div className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(to right, transparent, rgba(236,44,163,0.40), transparent)" }} />

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #ec2ca3, #7c3aed)",
              boxShadow: "0 0 24px rgba(236,44,163,0.40)",
            }}
          >
            {profile.profile_photo_url ? (
              <img src={profile.profile_photo_url} alt={profile.display_name} className="w-full h-full object-cover" />
            ) : (
              <UserCircle2 className="w-10 h-10 text-white/80" />
            )}
          </div>
          {isOwnProfile && (
            <label className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-xl flex items-center justify-center cursor-pointer"
              style={{ background: "linear-gradient(135deg, #ec2ca3, #7c3aed)", boxShadow: "0 2px 8px rgba(236,44,163,0.40)" }}>
              <Camera className="w-3.5 h-3.5 text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </label>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-xl font-bold" style={{ color: isDark ? "#ffffff" : "hsl(230 25% 10%)" }}>
              {profile.display_name || `${profile.first_name} ${profile.last_name}`}
            </h1>
            {profile.employment_status && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background: `${STATUS_COLORS[profile.employment_status]}20`,
                  color: STATUS_COLORS[profile.employment_status],
                  border: `1px solid ${STATUS_COLORS[profile.employment_status]}35`,
                }}>
                <CheckCircle className="w-2.5 h-2.5 inline mr-1" />
                {profile.employment_status}
              </span>
            )}
          </div>
          <p className="text-sm font-medium mb-0.5" style={{ color: isDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.55)" }}>
            {[profile.job_title, profile.department].filter(Boolean).join(" · ")}
          </p>
          <p className="text-xs font-mono font-semibold" style={{ color: "#ec2ca3" }}>
            {profile.staff_code}
          </p>
        </div>

        {/* Completion ring */}
        <div className="flex-shrink-0 text-center">
          <div className="relative w-14 h-14">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="22" fill="none" strokeWidth="4"
                stroke={isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"} />
              <circle cx="28" cy="28" r="22" fill="none" strokeWidth="4"
                stroke={completionColor}
                strokeLinecap="round"
                strokeDasharray={`${(profile.profile_completion_percentage / 100) * 138.2} 138.2`} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold" style={{ color: completionColor }}>
                {profile.profile_completion_percentage}%
              </span>
            </div>
          </div>
          <p className="text-[10px] mt-1" style={{ color: isDark ? "rgba(255,255,255,0.40)" : "rgba(0,0,0,0.40)" }}>
            Profile
          </p>
        </div>
      </div>
    </motion.div>
  );
}
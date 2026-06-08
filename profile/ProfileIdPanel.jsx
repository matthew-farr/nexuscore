import { useTheme } from "../ThemeProvider";
import { motion } from "framer-motion";
import { ShieldCheck, Copy } from "lucide-react";

export default function ProfileIdPanel({ profile, delay = 0 }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const idFields = [
    { label: "Staff Code", value: profile.staff_code },
    { label: "Learner ID", value: profile.learner_id || profile.staff_code },
    { label: "Certificate ID", value: profile.certificate_profile_id || profile.staff_code },
  ];

  function copyToClipboard(val) {
    navigator.clipboard.writeText(val || "");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className="relative rounded-2xl p-5 overflow-hidden"
      style={{
        background: isDark
          ? "linear-gradient(135deg, rgba(236,44,163,0.12) 0%, rgba(124,58,237,0.08) 100%)"
          : "linear-gradient(135deg, rgba(236,44,163,0.06) 0%, rgba(255,255,255,0.90) 100%)",
        border: isDark ? "1px solid rgba(236,44,163,0.22)" : "1px solid rgba(236,44,163,0.15)",
        backdropFilter: "blur(20px)",
        boxShadow: isDark
          ? "0 4px 24px rgba(0,0,0,0.25), 0 0 40px rgba(236,44,163,0.06)"
          : "0 2px 12px rgba(0,0,0,0.05)",
      }}
    >
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{ background: "linear-gradient(135deg, #ec2ca3, #7c3aed)" }} />
      <div className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(to right, transparent, rgba(236,44,163,0.40), transparent)" }} />

      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(236,44,163,0.20)", border: "1px solid rgba(236,44,163,0.30)" }}>
          <ShieldCheck className="w-3.5 h-3.5" style={{ color: "#ec2ca3" }} />
        </div>
        <div>
          <h2 className="text-sm font-semibold" style={{ color: isDark ? "rgba(255,255,255,0.90)" : "hsl(230 25% 12%)" }}>
            Permanent Checks Direct ID
          </h2>
          <p className="text-[10px]" style={{ color: isDark ? "rgba(255,255,255,0.40)" : "rgba(0,0,0,0.40)" }}>
            These IDs are permanent and link all your records
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {idFields.map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between p-3 rounded-xl group"
            style={{
              background: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.65)",
              border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.06)",
            }}>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5"
                style={{ color: isDark ? "rgba(180,195,220,0.50)" : "rgba(0,0,0,0.38)" }}>
                {label}
              </p>
              <p className="text-sm font-mono font-bold" style={{ color: "#ec2ca3" }}>
                {value || "—"}
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(value)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg"
              style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }}>
              <Copy className="w-3 h-3" style={{ color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.45)" }} />
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
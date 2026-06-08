import { motion } from "framer-motion";
import { Briefcase, DollarSign, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { useTheme } from "../../ThemeProvider";

const KPI_DEF = [
  { key: "open_deals",       label: "Open Deals",        icon: Briefcase,    colour: "#06b6d4" },
  { key: "pipeline_value",   label: "Pipeline Value",    icon: DollarSign,   colour: "#10b981", currency: true },
  { key: "tasks_due_today",  label: "Tasks Due Today",   icon: CheckCircle2, colour: "#f59e0b" },
  { key: "tasks_overdue",    label: "Overdue Tasks",     icon: AlertTriangle,colour: "#ef4444" },
];

function fmt(value, currency) {
  if (currency) {
    if (value >= 1000000) return `£${(value / 1000000).toFixed(1)}m`;
    if (value >= 1000)    return `£${(value / 1000).toFixed(0)}k`;
    return `£${value.toFixed(0)}`;
  }
  return String(value);
}

export default function CRMKPICards({ kpis, loading, error }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {KPI_DEF.map(({ key, label, icon: Icon, colour, currency }, i) => {
        const value = kpis?.[key] ?? 0;
        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.04 }}
            className="rounded-xl p-4 border"
            style={{
              background: isDark
                ? "linear-gradient(135deg,rgba(255,255,255,0.05) 0%,rgba(255,255,255,0.02) 100%)"
                : "linear-gradient(135deg,rgba(255,255,255,0.9) 0%,rgba(248,248,255,0.7) 100%)",
              border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.07)",
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-1"
                  style={{ color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.50)" }}>
                  {label}
                </p>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mt-1" style={{ color: colour }} />
                ) : error ? (
                  <p className="text-xl font-bold" style={{ color: isDark ? "#ffffff" : "#000000" }}>0</p>
                ) : (
                  <p className="text-2xl font-bold" style={{ color: isDark ? "#ffffff" : "#000000" }}>
                    {fmt(value, currency)}
                  </p>
                )}
              </div>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${colour}20` }}>
                <Icon className="w-4.5 h-4.5" style={{ color: colour }} />
              </div>
            </div>
            {error && (
              <p className="text-[10px] mt-1.5" style={{ color: isDark ? "rgba(255,255,255,0.40)" : "rgba(0,0,0,0.40)" }}>
                Unable to load
              </p>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
import { Briefcase, Loader2, Inbox, AlertTriangle } from "lucide-react";
import { useTheme } from "../../ThemeProvider";

function formatValue(v) {
  if (v >= 1000000) return `£${(v / 1000000).toFixed(1)}m`;
  if (v >= 1000)    return `£${(v / 1000).toFixed(0)}k`;
  return `£${v.toFixed(0)}`;
}

function stageName(raw) {
  if (!raw) return "Unknown";
  // Convert HubSpot internal keys like "appointmentscheduled" → "Appointment Scheduled"
  return raw
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, c => c.toUpperCase());
}

export default function PipelineSnapshot({ stages, loading, error, isDark }) {
  const maxValue = stages?.length ? Math.max(...stages.map(s => s.value)) : 1;

  return (
    <div className="rounded-xl border overflow-hidden"
      style={{
        background: isDark
          ? "linear-gradient(135deg,rgba(255,255,255,0.04) 0%,rgba(255,255,255,0.01) 100%)"
          : "rgba(255,255,255,0.85)",
        border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.07)",
      }}>
      <div className="px-4 pt-4 pb-3">
        <h3 className="text-sm font-bold mb-3" style={{ color: isDark ? "#ffffff" : "#000000" }}>
          Pipeline Snapshot
        </h3>

        {loading ? (
          <div className="flex items-center gap-2 py-3">
            <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
            <span className="text-sm" style={{ color: isDark ? "#ffffff" : "#000000" }}>Loading pipeline…</span>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 py-3">
            <AlertTriangle className="w-4 h-4" style={{ color: "#ef4444" }} />
            <span className="text-sm" style={{ color: isDark ? "#ffffff" : "#000000" }}>Unable to load pipeline</span>
          </div>
        ) : !stages?.length ? (
          <div className="flex flex-col items-center py-5 gap-1.5">
            <Inbox className="w-8 h-8 opacity-20" style={{ color: isDark ? "#ffffff" : "#000000" }} />
            <p className="text-sm font-semibold" style={{ color: isDark ? "#ffffff" : "#000000" }}>
              No open deals
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {stages.slice(0, 8).map((s, i) => {
              const pct = maxValue > 0 ? Math.round((s.value / maxValue) * 100) : 0;
              return (
                <div key={s.stage}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold" style={{ color: isDark ? "#ffffff" : "#000000" }}>
                      {stageName(s.stage)}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px]"
                        style={{ color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.50)" }}>
                        {s.count} deal{s.count !== 1 ? "s" : ""}
                      </span>
                      <span className="text-xs font-bold" style={{ color: "#06b6d4" }}>
                        {formatValue(s.value)}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden"
                    style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }}>
                    <div className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, #06b6d4, #8b5cf6)`,
                      }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
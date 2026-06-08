import { Users, TrendingUp, AlertCircle, Crown } from "lucide-react";
import { useTheme } from "../ThemeProvider";

const ACCENT = "#8b5cf6";

export default function SkillsMatrixOverview({ records, isDark }) {
  const uniqueUsers = new Set(records.map(r => r.user_id)).size;
  const avgScore = records.length > 0 
    ? (records.reduce((sum, r) => sum + (r.rating || 0), 0) / records.length).toFixed(1)
    : 0;
  const belowThree = records.filter(r => r.rating && r.rating < 3).length;
  const champions = records.filter(r => r.rating === 5).length;

  const kpis = [
    { label: "Staff Reviewed", value: uniqueUsers, icon: Users, color: "#06b6d4" },
    { label: "Average Score", value: avgScore, icon: TrendingUp, color: "#8b5cf6" },
    { label: "Needs Development", value: belowThree, icon: AlertCircle, color: "#f97316" },
    { label: "Product Champions", value: champions, icon: Crown, color: "#eab308" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {kpis.map((kpi, i) => {
        const Icon = kpi.icon;
        return (
          <div
            key={i}
            className="rounded-2xl p-5"
            style={{
              background: isDark
                ? "linear-gradient(145deg, rgba(15,23,42,0.68) 0%, rgba(15,23,42,0.50) 100%)"
                : "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,246,255,0.85) 100%)",
              border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.07)",
              boxShadow: isDark ? "0 8px 24px rgba(0,0,0,0.30)" : "0 4px 16px rgba(0,0,0,0.08)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: isDark ? "#ffffff" : "#000000" }}>
                {kpi.label}
              </p>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${kpi.color}18`, border: `1px solid ${kpi.color}30` }}>
                <Icon className="w-4 h-4" style={{ color: kpi.color }} />
              </div>
            </div>
            <p className="text-3xl font-extrabold" style={{ color: isDark ? "#ffffff" : "#000000" }}>
              {kpi.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
import { useTheme } from "../../ThemeProvider";
import { Lightbulb, Zap, TrendingUp, CheckCircle, ArrowRight, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const ACCENT = "#8b5cf6";

const STATUS_COLORS = {
  Submitted: "#8b5cf6", Reviewing: "#f59e0b", Planned: "#06b6d4",
  Building: "#10b981", Completed: "#22c55e", "Not Progressing": "#ef4444",
};

export default function InnovationOverviewTab({ onTabChange, onSubmitIdea }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { data: ideas = [] } = useQuery({
    queryKey: ["innovationIdeas"],
    queryFn: () => base44.entities.InnovationIdea.filter({ is_archived: false }, "-vote_score", 500),
    staleTime: 30000,
  });

  const activeIdeas = ideas.filter(i => i.status !== "Archived");
  const topIdeas = [...activeIdeas].sort((a, b) => (b.vote_score || 0) - (a.vote_score || 0)).slice(0, 3);
  const recentIdeas = [...activeIdeas].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 3);

  const kpiCards = [
    { label: "Ideas Submitted", value: activeIdeas.length, icon: Lightbulb, color: "#8b5cf6" },
    { label: "In Progress",     value: activeIdeas.filter(i => ["Reviewing","Planned","Building"].includes(i.status)).length, icon: Zap, color: "#f59e0b" },
    { label: "Completed",       value: activeIdeas.filter(i => i.status === "Completed").length, icon: CheckCircle, color: "#10b981" },
    { label: "Total Votes",     value: activeIdeas.reduce((s, i) => s + (i.upvotes_count || 0), 0), icon: TrendingUp, color: "#06b6d4" },
  ];

  const quickActions = [
    {
      label: "Submit an Idea",
      desc: "Share your improvement idea with the team",
      action: () => {
        console.log("[InnovationOverviewTab] Submit an Idea clicked");
        if (onSubmitIdea) onSubmitIdea();
      },
    },
    {
      label: "View Ideas Board",
      desc: "Browse, vote and comment on all ideas",
      action: () => {
        console.log("[InnovationOverviewTab] View Ideas Board clicked → switching tab to ideas-board");
        if (onTabChange) onTabChange("ideas-board");
      },
    },
    {
      label: "Check the Roadmap",
      desc: "See what's planned and in progress",
      action: () => {
        console.log("[InnovationOverviewTab] Check the Roadmap clicked → switching tab to internal-roadmap");
        if (onTabChange) onTabChange("internal-roadmap");
      },
    },
  ];

  const cardBg = isDark
    ? "linear-gradient(145deg, rgba(15,23,42,0.68) 0%, rgba(15,23,42,0.50) 100%)"
    : "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,246,255,0.85) 100%)";
  const cardBorder = isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.07)";
  const cardShadow = isDark ? "0 8px 24px rgba(0,0,0,0.30)" : "0 4px 16px rgba(0,0,0,0.08)";

  return (
    <div className="space-y-6">

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((k, i) => (
          <div key={i} className="rounded-2xl p-5" style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: isDark ? "#ffffff" : "#000000" }}>
                 {k.label}
               </p>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${k.color}18`, border: `1px solid ${k.color}30` }}>
                <k.icon className="w-4 h-4" style={{ color: k.color }} />
              </div>
            </div>
            <p className="text-3xl font-extrabold" style={{ color: isDark ? "#ffffff" : "#000000" }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl p-5" style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
        <h2 className="text-sm font-bold mb-4" style={{ color: isDark ? "#ffffff" : "#000000" }}>Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {quickActions.map((a, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                a.action();
              }}
              className="flex items-center justify-between p-4 rounded-xl text-left transition-all duration-200 hover:scale-[1.01]"
              style={{
                background: isDark ? `rgba(139,92,246,0.10)` : `rgba(139,92,246,0.06)`,
                border: `1px solid ${ACCENT}25`,
                cursor: "pointer",
              }}
            >
              <div>
                <p className="text-xs font-bold mb-1" style={{ color: isDark ? "#ffffff" : "#000000" }}>{a.label}</p>
                <p className="text-[11px]" style={{ color: isDark ? "#ffffff" : "#000000" }}>{a.desc}</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 flex-shrink-0 ml-2" style={{ color: ACCENT }} />
            </button>
          ))}
        </div>
      </div>

      {/* Top Ideas & Recent Ideas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Top Ideas */}
        <div className="rounded-2xl p-5" style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
          <h2 className="text-sm font-bold mb-4" style={{ color: isDark ? "#ffffff" : "#000000" }}>Top Ideas</h2>
          <div className="space-y-3">
            {topIdeas.length === 0 ? (
              <p className="text-xs py-4 text-center" style={{ color: isDark ? "#ffffff" : "#000000" }}>No ideas yet.</p>
            ) : topIdeas.map((idea, i) => (
              <div key={idea.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: `${ACCENT}20`, color: ACCENT }}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: isDark ? "#ffffff" : "#000000" }}>{idea.title}</p>
                  <p className="text-[10px]" style={{ color: isDark ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.40)" }}>{idea.category}</p>
                </div>
                <span className="text-xs font-bold flex-shrink-0" style={{ color: ACCENT }}>{idea.vote_score || 0} votes</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Ideas */}
        <div className="rounded-2xl p-5" style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
          <h2 className="text-sm font-bold mb-4" style={{ color: isDark ? "#ffffff" : "#000000" }}>Recent Ideas</h2>
          <div className="space-y-3">
            {recentIdeas.length === 0 ? (
              <p className="text-xs py-4 text-center" style={{ color: isDark ? "#ffffff" : "#000000" }}>No ideas yet.</p>
            ) : recentIdeas.map((idea) => {
              const statusColor = STATUS_COLORS[idea.status] || ACCENT;
              return (
                <div key={idea.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" }}>
                  <Clock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: ACCENT }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: isDark ? "#ffffff" : "#000000" }}>{idea.title}</p>
                    <p className="text-[10px]" style={{ color: isDark ? "#ffffff" : "#000000" }}>{idea.category}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}30` }}>
                    {idea.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Innovation Activity */}
      <div className="rounded-2xl p-5" style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
        <h2 className="text-sm font-bold mb-4" style={{ color: isDark ? "#ffffff" : "#000000" }}>Innovation Activity</h2>
        <div className="flex items-center justify-center h-24" style={{ color: isDark ? "#ffffff" : "#000000" }}>
           <p className="text-xs">Activity feed will appear here once ideas are submitted.</p>
         </div>
      </div>

    </div>
  );
}
import { useTheme } from "../../ThemeProvider";
import { Settings, BarChart2, Lock } from "lucide-react";
import RoadmapManagementPanel from "../admin/RoadmapManagementPanel";

const ACCENT = "#8b5cf6";

const PLACEHOLDER_SECTIONS = [
  {
    icon: Settings,
    title: "Idea Management",
    desc: "Review, approve, reject and manage all submitted ideas.",
    items: ["Review pending submissions", "Update idea status", "Assign owners", "Archive ideas"],
  },
  {
    icon: BarChart2,
    title: "Reporting",
    desc: "View innovation metrics, engagement data and activity reports.",
    items: ["Submission trends", "Voting analytics", "Department breakdown", "Progress tracking"],
  },
];

export default function InnovationAdminTab() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const cardBg = isDark
    ? "linear-gradient(145deg, rgba(15,23,42,0.68) 0%, rgba(15,23,42,0.50) 100%)"
    : "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,246,255,0.85) 100%)";
  const cardBorder = isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.07)";
  const cardShadow = isDark ? "0 8px 24px rgba(0,0,0,0.30)" : "0 4px 16px rgba(0,0,0,0.08)";

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="rounded-2xl p-5 flex items-center gap-3"
        style={{ background: isDark ? `${ACCENT}18` : `${ACCENT}0a`, border: `1px solid ${ACCENT}30`, boxShadow: cardShadow }}>
        <Lock className="w-5 h-5 flex-shrink-0" style={{ color: ACCENT }} />
        <div>
          <p className="text-sm font-bold" style={{ color: isDark ? "#ffffff" : "#000000" }}>Admin Panel</p>
          <p className="text-xs" style={{ color: isDark ? "#ffffff" : "#000000" }}>
            This section is visible to administrators only.
          </p>
        </div>
      </div>

      {/* Live: Roadmap Management */}
      <RoadmapManagementPanel />

      {/* Placeholder sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {PLACEHOLDER_SECTIONS.map((s, i) => (
          <div key={i} className="rounded-2xl p-5" style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}18`, border: `1px solid ${ACCENT}30` }}>
                <s.icon className="w-4 h-4" style={{ color: ACCENT }} />
              </div>
              <h3 className="text-sm font-bold" style={{ color: isDark ? "#ffffff" : "#000000" }}>{s.title}</h3>
            </div>
            <p className="text-xs mb-4" style={{ color: isDark ? "#ffffff" : "#000000" }}>
              {s.desc}
            </p>
            <ul className="space-y-2">
              {s.items.map((item, j) => (
                <li key={j} className="flex items-center gap-2 text-xs" style={{ color: isDark ? "#ffffff" : "#000000" }}>
                  <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: ACCENT }} />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4" style={{ borderTop: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)" }}>
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: isDark ? "#ffffff" : "#000000" }}>
                Coming Soon
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
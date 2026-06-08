import { useTheme } from "../../ThemeProvider";
import { Map } from "lucide-react";

const ACCENT = "#8b5cf6";

export default function InnovationRoadmapTab({ title, description }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const cardBg = isDark
    ? "linear-gradient(145deg, rgba(15,23,42,0.68) 0%, rgba(15,23,42,0.50) 100%)"
    : "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,246,255,0.85) 100%)";
  const cardBorder = isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.07)";
  const cardShadow = isDark ? "0 8px 24px rgba(0,0,0,0.30)" : "0 4px 16px rgba(0,0,0,0.08)";

  const stages = [
    { label: "Now", color: "#10b981", desc: "Currently in progress" },
    { label: "Next", color: "#f59e0b", desc: "Coming up soon" },
    { label: "Later", color: "#8b5cf6", desc: "Future ideas" },
    { label: "Completed", color: "#6b7280", desc: "Done" },
  ];

  return (
    <div className="space-y-5">
      {/* Header card */}
      <div className="rounded-2xl p-6" style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}18`, border: `1px solid ${ACCENT}30` }}>
            <Map className="w-4 h-4" style={{ color: ACCENT }} />
          </div>
          <div>
            <h2 className="text-base font-bold" style={{ color: isDark ? "#ffffff" : "#000000" }}>{title}</h2>
            <p className="text-xs mt-0.5" style={{ color: isDark ? "rgba(255,255,255,0.48)" : "rgba(0,0,0,0.48)" }}>{description}</p>
          </div>
        </div>
      </div>

      {/* Stage columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stages.map((stage, i) => (
          <div key={i} className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: stage.color }} />
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: isDark ? "#ffffff" : "#000000" }}>
                {stage.label}
              </h3>
            </div>
            <p className="text-[10px]" style={{ color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.40)" }}>
              {stage.desc}
            </p>
            <div className="rounded-xl p-3 text-center" style={{
              background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
              border: isDark ? "1px dashed rgba(255,255,255,0.10)" : "1px dashed rgba(0,0,0,0.10)",
            }}>
              <p className="text-[10px]" style={{ color: isDark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.28)" }}>
                No items yet
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
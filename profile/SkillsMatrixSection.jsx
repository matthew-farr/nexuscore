import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useTheme } from "../ThemeProvider";
import { RATING_SCALE, SKILL_CATEGORIES } from "@/lib/skillsMatrixConfig";
import { TrendingUp, Target, AlertCircle } from "lucide-react";

const ACCENT = "#8b5cf6";

export default function SkillsMatrixSection({ userId }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { data: skills = [], isLoading } = useQuery({
    queryKey: ["userSkills", userId],
    queryFn: () => base44.entities.SkillMatrixRecord.filter({ user_id: userId }, "-rating", 100),
    enabled: !!userId,
  });

  if (isLoading) return <div>Loading skills...</div>;
  if (skills.length === 0) return null;

  // Calculate metrics
  const avgScore = (skills.reduce((sum, s) => sum + (s.rating || 0), 0) / skills.length).toFixed(1);
  const categories = {};
  skills.forEach(s => {
    if (!categories[s.skill_category]) {
      categories[s.skill_category] = { count: 0, avgRating: 0, skills: [] };
    }
    categories[s.skill_category].count += 1;
    categories[s.skill_category].avgRating += s.rating || 0;
    categories[s.skill_category].skills.push(s);
  });

  Object.keys(categories).forEach(cat => {
    categories[cat].avgRating = (categories[cat].avgRating / categories[cat].count).toFixed(1);
  });

  const strongestCategory = Object.entries(categories).sort((a, b) => b[1].avgRating - a[1].avgRating)[0];
  const developmentArea = Object.entries(categories).sort((a, b) => a[1].avgRating - b[1].avgRating)[0];
  const champions = skills.filter(s => s.rating === 5).length;

  return (
    <div className="space-y-6 mt-8">
      <div>
        <h3 className="text-lg font-bold mb-4" style={{ color: isDark ? "#ffffff" : "#000000" }}>Skills Matrix</h3>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="rounded-2xl p-4"
            style={{
              background: isDark
                ? "linear-gradient(145deg, rgba(15,23,42,0.68) 0%, rgba(15,23,42,0.50) 100%)"
                : "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,246,255,0.85) 100%)",
              border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.07)",
            }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: isDark ? "#ffffff" : "#000000" }}>Avg Score</p>
            <p className="text-2xl font-extrabold" style={{ color: ACCENT }}>{avgScore}/5</p>
          </div>

          <div className="rounded-2xl p-4"
            style={{
              background: isDark
                ? "linear-gradient(145deg, rgba(15,23,42,0.68) 0%, rgba(15,23,42,0.50) 100%)"
                : "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,246,255,0.85) 100%)",
              border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.07)",
            }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: isDark ? "#ffffff" : "#000000" }}>Skills Tracked</p>
            <p className="text-2xl font-extrabold" style={{ color: ACCENT }}>{skills.length}</p>
          </div>

          <div className="rounded-2xl p-4"
            style={{
              background: isDark
                ? "linear-gradient(145deg, rgba(15,23,42,0.68) 0%, rgba(15,23,42,0.50) 100%)"
                : "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,246,255,0.85) 100%)",
              border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.07)",
            }}>
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5" style={{ color: "#06b6d4" }} />
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: isDark ? "#ffffff" : "#000000" }}>Strongest</p>
            </div>
            <p className="text-sm font-bold" style={{ color: isDark ? "#ffffff" : "#000000" }}>{strongestCategory?.[0]}</p>
          </div>

          <div className="rounded-2xl p-4"
            style={{
              background: isDark
                ? "linear-gradient(145deg, rgba(15,23,42,0.68) 0%, rgba(15,23,42,0.50) 100%)"
                : "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,246,255,0.85) 100%)",
              border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.07)",
            }}>
            <div className="flex items-center gap-1.5 mb-1">
              <AlertCircle className="w-3.5 h-3.5" style={{ color: "#f97316" }} />
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: isDark ? "#ffffff" : "#000000" }}>Development</p>
            </div>
            <p className="text-sm font-bold" style={{ color: isDark ? "#ffffff" : "#000000" }}>{developmentArea?.[0]}</p>
          </div>
        </div>

        {/* Skills by Category */}
        <div className="space-y-4">
          {Object.entries(categories).map(([category, data]) => (
            <div
              key={category}
              className="rounded-2xl p-5"
              style={{
                background: isDark
                  ? "linear-gradient(145deg, rgba(15,23,42,0.68) 0%, rgba(15,23,42,0.50) 100%)"
                  : "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,246,255,0.85) 100%)",
                border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.07)",
              }}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold" style={{ color: isDark ? "#ffffff" : "#000000" }}>{category}</h4>
                <span className="text-sm font-bold" style={{ color: ACCENT }}>{data.avgRating}/5</span>
              </div>

              <div className="space-y-3">
                {data.skills.map(skill => {
                  const ratingConfig = RATING_SCALE[skill.rating] || RATING_SCALE[1];
                  const progress = (skill.rating / 5) * 100;
                  return (
                    <div key={skill.id}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium" style={{ color: isDark ? "#ffffff" : "#000000" }}>{skill.skill_name}</p>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                          style={{ background: ratingConfig.bgColor, color: ratingConfig.color }}>
                          {skill.rating} - {ratingConfig.label}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2 rounded-full overflow-hidden" style={{
                        background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
                      }}>
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${progress}%`,
                            background: `linear-gradient(90deg, ${ratingConfig.color}80, ${ratingConfig.color})`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
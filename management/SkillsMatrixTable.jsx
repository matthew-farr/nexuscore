import { Edit2, Trash2 } from "lucide-react";
import { useTheme } from "../ThemeProvider";
import { RATING_SCALE } from "@/lib/skillsMatrixConfig";
import { formatDistanceToNow } from "date-fns";

export default function SkillsMatrixTable({ records, onEdit, onDelete, isDark, user }) {
  const isAdmin = user?.role === "admin";

  return (
    <div className="overflow-x-auto rounded-2xl"
      style={{
        background: isDark
          ? "linear-gradient(145deg, rgba(15,23,42,0.68) 0%, rgba(15,23,42,0.50) 100%)"
          : "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,246,255,0.85) 100%)",
        border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.07)",
        boxShadow: isDark ? "0 8px 24px rgba(0,0,0,0.30)" : "0 4px 16px rgba(0,0,0,0.08)",
      }}>
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)" }}>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: isDark ? "#ffffff" : "#000000" }}>Staff</th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: isDark ? "#ffffff" : "#000000" }}>Category</th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: isDark ? "#ffffff" : "#000000" }}>Skill</th>
            <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: isDark ? "#ffffff" : "#000000" }}>Rating</th>
            <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: isDark ? "#ffffff" : "#000000" }}>Target</th>
            <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: isDark ? "#ffffff" : "#000000" }}>Last Review</th>
            {isAdmin && <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: isDark ? "#ffffff" : "#000000" }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {records.map((record) => {
            const ratingConfig = RATING_SCALE[record.rating] || RATING_SCALE[1];
            const targetConfig = RATING_SCALE[record.target_rating] || RATING_SCALE[3];
            return (
              <tr
                key={record.id}
                style={{ borderBottom: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)" }}
                className="hover:bg-foreground/[0.03] transition-colors">
                <td className="px-6 py-4 text-sm font-medium" style={{ color: isDark ? "#ffffff" : "#000000" }}>{record.user_name}</td>
                <td className="px-6 py-4 text-sm" style={{ color: isDark ? "#ffffff" : "#000000" }}>{record.skill_category}</td>
                <td className="px-6 py-4 text-sm" style={{ color: isDark ? "#ffffff" : "#000000" }}>{record.skill_name}</td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold"
                    style={{ background: ratingConfig.bgColor, color: ratingConfig.color }}>
                    {record.rating} - {ratingConfig.label}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ background: `${targetConfig.color}18`, color: targetConfig.color }}>
                    {record.target_rating}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-center" style={{ color: isDark ? "#ffffff" : "#000000" }}>
                  {record.last_reviewed_date ? formatDistanceToNow(new Date(record.last_reviewed_date), { addSuffix: true }) : "—"}
                </td>
                {isAdmin && (
                  <td className="px-6 py-4 text-center flex items-center justify-center gap-2">
                    <button
                      onClick={() => onEdit(record)}
                      className="p-2 rounded-lg hover:bg-foreground/[0.08] transition-colors"
                      title="Edit">
                      <Edit2 className="w-4 h-4" style={{ color: "#8b5cf6" }} />
                    </button>
                    <button
                      onClick={() => onDelete(record.id)}
                      className="p-2 rounded-lg hover:bg-foreground/[0.08] transition-colors"
                      title="Delete">
                      <Trash2 className="w-4 h-4" style={{ color: "#ef4444" }} />
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      {records.length === 0 && (
        <div className="px-6 py-12 text-center">
          <p style={{ color: isDark ? "#ffffff" : "#000000" }}>No skill records found</p>
        </div>
      )}
    </div>
  );
}
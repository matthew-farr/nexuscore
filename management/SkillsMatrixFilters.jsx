import { Filter } from "lucide-react";
import { useTheme } from "../ThemeProvider";
import { SKILL_CATEGORIES, RATING_SCALE, STATUS_OPTIONS } from "@/lib/skillsMatrixConfig";

const ACCENT = "#8b5cf6";

export default function SkillsMatrixFilters({ filters, setFilters, staffOptions, isDark }) {
  return (
    <div className="mb-6 rounded-2xl p-4"
      style={{
        background: isDark
          ? "linear-gradient(145deg, rgba(15,23,42,0.68) 0%, rgba(15,23,42,0.50) 100%)"
          : "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,246,255,0.85) 100%)",
        border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.07)",
        boxShadow: isDark ? "0 8px 24px rgba(0,0,0,0.30)" : "0 4px 16px rgba(0,0,0,0.08)",
      }}>
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4" style={{ color: ACCENT }} />
        <p className="text-sm font-bold" style={{ color: isDark ? "#ffffff" : "#000000" }}>Filters</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Staff Filter */}
        <select
          value={filters.userId || ""}
          onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
          className="px-3 py-2 rounded-lg text-sm font-medium"
          style={{
            background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
            border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.07)",
            color: isDark ? "#ffffff" : "#000000",
          }}>
          <option value="">All Staff</option>
          {staffOptions.map(staff => (
            <option key={staff.id} value={staff.id}>{staff.name}</option>
          ))}
        </select>

        {/* Department Filter */}
        <select
          value={filters.department || ""}
          onChange={(e) => setFilters({ ...filters, department: e.target.value })}
          className="px-3 py-2 rounded-lg text-sm font-medium"
          style={{
            background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
            border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.07)",
            color: isDark ? "#ffffff" : "#000000",
          }}>
          <option value="">All Departments</option>
          <option value="Operations">Operations</option>
          <option value="Sales">Sales</option>
          <option value="Management">Management</option>
          <option value="Compliance">Compliance</option>
        </select>

        {/* Category Filter */}
        <select
          value={filters.category || ""}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="px-3 py-2 rounded-lg text-sm font-medium"
          style={{
            background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
            border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.07)",
            color: isDark ? "#ffffff" : "#000000",
          }}>
          <option value="">All Categories</option>
          {SKILL_CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* Rating Filter */}
        <select
          value={filters.rating || ""}
          onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
          className="px-3 py-2 rounded-lg text-sm font-medium"
          style={{
            background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
            border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.07)",
            color: isDark ? "#ffffff" : "#000000",
          }}>
          <option value="">All Ratings</option>
          {Object.entries(RATING_SCALE).map(([rating, config]) => (
            <option key={rating} value={rating}>{config.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
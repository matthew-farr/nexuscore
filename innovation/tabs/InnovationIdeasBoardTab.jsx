import { useState } from "react";
import { useTheme } from "../../ThemeProvider";
import { Search, Lightbulb } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import IdeaDetailDrawer from "../IdeaDetailDrawer";

const ACCENT = "#8b5cf6";

const STATUS_OPTIONS = ["All", "Submitted", "Reviewing", "Planned", "Building", "Completed", "Not Progressing"];
const DEPT_OPTIONS   = ["All Departments", "Operations", "Sales", "Technology", "Compliance", "Finance", "HR", "Marketing"];
const SORT_OPTIONS   = ["Most Votes", "Newest", "Oldest", "Alphabetical"];

const STATUS_COLORS = {
  Submitted: "#8b5cf6", Reviewing: "#f59e0b", Planned: "#06b6d4",
  Building: "#10b981", Completed: "#22c55e", "Not Progressing": "#ef4444",
};

export default function InnovationIdeasBoardTab() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [sortBy, setSortBy] = useState("Most Votes");
  const [selectedIdea, setSelectedIdea] = useState(null);

  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });

  const { data: ideas = [], isLoading } = useQuery({
    queryKey: ["innovationIdeas"],
    queryFn: () => base44.entities.InnovationIdea.filter({ is_archived: false }, "-vote_score", 500),
    staleTime: 10000,
  });

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ["innovationIdeas"] });
    queryClient.invalidateQueries({ queryKey: ["innovationIdeasAdmin"] });
  };

  // Filter
  let filtered = ideas.filter(idea => {
    const matchSearch = !search || idea.title?.toLowerCase().includes(search.toLowerCase()) || idea.description?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || idea.status === statusFilter;
    const matchDept = deptFilter === "All Departments" || idea.department === deptFilter;
    return matchSearch && matchStatus && matchDept;
  });

  // Sort
  if (sortBy === "Most Votes") filtered = [...filtered].sort((a, b) => (b.vote_score || 0) - (a.vote_score || 0));
  else if (sortBy === "Newest") filtered = [...filtered].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  else if (sortBy === "Oldest") filtered = [...filtered].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
  else if (sortBy === "Alphabetical") filtered = [...filtered].sort((a, b) => (a.title || "").localeCompare(b.title || ""));

  const cardBg = isDark
    ? "linear-gradient(145deg, rgba(15,23,42,0.68) 0%, rgba(15,23,42,0.50) 100%)"
    : "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,246,255,0.85) 100%)";
  const cardBorder = isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.07)";
  const cardShadow = isDark ? "0 8px 24px rgba(0,0,0,0.30)" : "0 4px 16px rgba(0,0,0,0.08)";

  const selectStyle = {
    background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
    border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.10)",
    color: isDark ? "#ffffff" : "#000000",
    borderRadius: "10px",
    padding: "0 12px",
    height: "36px",
    fontSize: "12px",
    fontWeight: 500,
    outline: "none",
    cursor: "pointer",
  };

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="rounded-2xl p-4" style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)" }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search ideas…"
              className="w-full pl-8 pr-3 text-xs font-medium focus:outline-none rounded-xl"
              style={{ height: "36px", background: isDark ? "rgba(255,255,255,0.06)" : "#ffffff", border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.15)", color: isDark ? "#ffffff" : "#000000" }}
            />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selectStyle}>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} style={selectStyle}>
            {DEPT_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={selectStyle}>
            {SORT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${ACCENT}40`, borderTopColor: ACCENT }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl p-10 flex items-center justify-center" style={{ background: cardBg, border: cardBorder }}>
          <p className="text-xs" style={{ color: isDark ? "#ffffff" : "#000000" }}>No ideas found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((idea) => {
            const statusColor = STATUS_COLORS[idea.status] || ACCENT;
            return (
              <button
                key={idea.id}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("[InnovationIdeasBoardTab] Card clicked → opening drawer for:", idea.title);
                  setSelectedIdea(idea);
                }}
                className="rounded-2xl p-5 flex flex-col gap-3 cursor-pointer transition-all duration-200 hover:scale-[1.01]"
                style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow, textAlign: "left" }}
                type="button"
              >
                {/* Status + Votes */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                    style={{ background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}30` }}>
                    {idea.status || "Submitted"}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold" style={{ color: ACCENT }}>{idea.vote_score || 0}</span>
                    <span className="text-[10px]" style={{ color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)" }}>votes</span>
                  </div>
                </div>

                {/* Title */}
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: ACCENT }} />
                  <p className="text-sm font-semibold leading-snug" style={{ color: isDark ? "#ffffff" : "#000000" }}>
                    {idea.title}
                  </p>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-2 flex-wrap">
                  {idea.category && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", color: isDark ? "#ffffff" : "#000000" }}>
                      {idea.category}
                    </span>
                  )}
                  {idea.department && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", color: isDark ? "#ffffff" : "#000000" }}>
                      {idea.department}
                    </span>
                  )}
                </div>

                {/* Submitted by */}
                {idea.submitted_by && (
                  <p className="text-[10px]" style={{ color: isDark ? "#ffffff" : "#000000" }}>
                    By {idea.submitted_by}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Idea Detail Drawer */}
      {selectedIdea && (
        <IdeaDetailDrawer
          idea={selectedIdea}
          user={user}
          onClose={() => setSelectedIdea(null)}
          onSaved={() => {
            refetch();
            setSelectedIdea(null);
          }}
        />
      )}
    </div>
  );
}
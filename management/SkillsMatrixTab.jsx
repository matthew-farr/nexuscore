import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useTheme } from "../ThemeProvider";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import SkillsMatrixOverview from "./SkillsMatrixOverview";
import SkillsMatrixFilters from "./SkillsMatrixFilters";
import SkillsMatrixTable from "./SkillsMatrixTable";
import SkillMatrixDrawer from "./SkillMatrixDrawer";

const ACCENT = "#8b5cf6";

export default function SkillsMatrixTab({ user }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const queryClient = useQueryClient();
  const isAdmin = user?.role === "admin";

  const [filters, setFilters] = useState({
    userId: "",
    department: "",
    category: "",
    rating: "",
  });
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { data: records = [], isLoading, refetch } = useQuery({
    queryKey: ["skillMatrixRecords"],
    queryFn: () => base44.entities.SkillMatrixRecord.list("-created_date", 500),
  });

  const { data: staffList = [] } = useQuery({
    queryKey: ["staffList"],
    queryFn: () => base44.entities.User.list(),
  });

  const staffOptions = staffList.map(s => ({ id: s.id, name: s.full_name }));

  const filteredRecords = records.filter(r => {
    if (filters.userId && r.user_id !== filters.userId) return false;
    if (filters.department && r.department !== filters.department) return false;
    if (filters.category && r.skill_category !== filters.category) return false;
    if (filters.rating && r.rating !== parseInt(filters.rating)) return false;
    return true;
  });

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setIsDrawerOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this skill record?")) {
      await base44.entities.SkillMatrixRecord.delete(id);
      refetch();
    }
  };

  const handleOpenNew = () => {
    setSelectedRecord(null);
    setIsDrawerOpen(true);
  };

  const handleSaved = () => {
    refetch();
    setIsDrawerOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${ACCENT}40`, borderTopColor: ACCENT }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Overview */}
      <SkillsMatrixOverview records={filteredRecords} isDark={isDark} />

      {/* Filters & Add Button */}
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <SkillsMatrixFilters
            filters={filters}
            setFilters={setFilters}
            staffOptions={staffOptions}
            isDark={isDark}
          />
        </div>
        {isAdmin && (
          <button
            onClick={handleOpenNew}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white whitespace-nowrap"
            style={{
              background: ACCENT,
              boxShadow: `0 4px 12px ${ACCENT}40`,
            }}>
            <Plus className="w-4 h-4" />
            Add Skill
          </button>
        )}
      </div>

      {/* Table */}
      <SkillsMatrixTable
        records={filteredRecords}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isDark={isDark}
        user={user}
      />

      {/* Drawer */}
      <SkillMatrixDrawer
        record={selectedRecord}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSaved={handleSaved}
      />
    </div>
  );
}
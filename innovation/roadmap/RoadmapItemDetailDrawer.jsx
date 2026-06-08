import { useState, useEffect } from "react";
import { X, Save, Archive, CheckCircle, Loader2, Lock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useTheme } from "../../ThemeProvider";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { STATUS_CONFIG } from "@/lib/roadmapConfig";
import RoadmapItemForm from "./RoadmapItemForm";

const ACCENT = "#8b5cf6";

export default function RoadmapItemDetailDrawer({ item, user, onClose, onSaved }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [currentItem, setCurrentItem] = useState(item);
  const [formData, setFormData] = useState(item);

  useEffect(() => {
    setCurrentItem(item);
    setFormData(item);
    setIsEditing(false);
  }, [item]);

  const { data: sourceIdea } = useQuery({
    queryKey: ["innovationIdea", item?.linked_roadmap_id],
    queryFn: () => item?.linked_roadmap_id ? base44.entities.InnovationIdea.filter({ linked_roadmap_id: item.id }) : null,
    enabled: !!item?.id,
  });

  const handleSave = async () => {
    if (!formData.title?.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    try {
      const updated = await base44.entities.RoadmapItem.update(item.id, formData);
      setCurrentItem(updated);
      setFormData(updated);
      setIsEditing(false);
      toast.success("Roadmap item updated");
      if (onSaved) onSaved();
    } catch (err) {
      toast.error("Failed to save changes");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (archiving) return;
    setArchiving(true);
    try {
      await base44.entities.RoadmapItem.update(item.id, { status: "Archived" });
      toast.success("Item archived");
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      toast.error("Failed to archive item");
    } finally {
      setArchiving(false);
    }
  };

  const handleUnarchive = async () => {
    if (archiving) return;
    setArchiving(true);
    try {
      await base44.entities.RoadmapItem.update(item.id, { status: "Planned" });
      toast.success("Item restored");
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      toast.error("Failed to restore item");
    } finally {
      setArchiving(false);
    }
  };

  const bg = isDark
    ? "linear-gradient(160deg, #0d1124 0%, #080b1a 100%)"
    : "linear-gradient(160deg, #ffffff 0%, #f5f3ff 100%)";

  const statusCfg = STATUS_CONFIG[currentItem.status] || STATUS_CONFIG["Planned"];
  const createdDate = currentItem.created_date ? new Date(currentItem.created_date).toLocaleDateString("en-GB") : "—";
  const updatedDate = currentItem.updated_date ? new Date(currentItem.updated_date).toLocaleDateString("en-GB") : "—";

  const inputStyle = {
    background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
    border: isDark ? "1px solid rgba(255,255,255,0.14)" : "1px solid rgba(0,0,0,0.12)",
    borderRadius: "10px",
    padding: "8px 12px",
    fontSize: "13px",
    color: isDark ? "#ffffff" : "#000000",
    outline: "none",
    width: "100%",
  };

  const labelStyle = {
    fontSize: "11px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: isDark ? "#ffffff" : "#000000",
    marginBottom: "6px",
    display: "block",
  };

  const handleQuarterChange = async (newQuarter) => {
    if (newQuarter === formData.quarter) return;
    setFormData({ ...formData, quarter: newQuarter });
  };

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.50)", backdropFilter: "blur(4px)" }} onClick={onClose} />

      <div className="fixed right-0 top-0 bottom-0 z-50 flex flex-col overflow-hidden"
        style={{ width: "min(480px, 95vw)", background: bg, borderLeft: isDark ? `1px solid ${ACCENT}30` : "1px solid rgba(0,0,0,0.10)", boxShadow: isDark ? `-24px 0 64px rgba(0,0,0,0.60)` : `-12px 0 40px rgba(0,0,0,0.12)` }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)" }}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-sm font-bold truncate" style={{ color: isDark ? "#ffffff" : "#000000" }}>
                {isEditing ? "Edit Roadmap Item" : "Roadmap Item Details"}
              </h2>
              {!isAdmin && (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)", color: isDark ? "#ffffff" : "#000000", border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.10)" }}>
                  <Lock className="w-3 h-3" /> View Only
                </span>
              )}
            </div>
            {!isEditing && (
              <p className="text-xs" style={{ color: isDark ? "#ffffff" : "#000000" }}>
                {currentItem.title}
              </p>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)" }}>
            <X className="w-4 h-4" style={{ color: isDark ? "#ffffff" : "#000000" }} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <RoadmapItemForm 
            formData={isEditing ? formData : currentItem} 
            setFormData={setFormData} 
            isDark={isDark} 
            labelStyle={labelStyle} 
            inputStyle={inputStyle} 
            isReadOnly={!isEditing}
          />

          {/* Meta Info - Staff/Everyone can see */}
          {!isEditing && (
            <div className="space-y-5 mt-5">
              {currentItem.owner && (
                <div>
                  <p style={labelStyle}>Owner</p>
                  <p className="text-sm" style={{ color: isDark ? "#ffffff" : "#000000" }}>
                    {currentItem.owner}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p style={labelStyle}>Created</p>
                  <p className="text-sm" style={{ color: isDark ? "#ffffff" : "#000000" }}>
                    {createdDate}
                  </p>
                </div>
                <div>
                  <p style={labelStyle}>Updated</p>
                  <p className="text-sm" style={{ color: isDark ? "#ffffff" : "#000000" }}>
                    {updatedDate}
                  </p>
                </div>
              </div>

              {sourceIdea && sourceIdea.length > 0 && (
                <div className="rounded-xl p-3" style={{ background: `${ACCENT}10`, border: `1px solid ${ACCENT}30` }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span style={labelStyle}>Converted from Idea</span>
                  </div>
                  <p className="text-sm" style={{ color: isDark ? "#ffffff" : "#000000" }}>
                    {sourceIdea[0].title}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions Footer - Admins Only */}
        {isAdmin && (
          <div className="px-6 py-5 space-y-3"
            style={{ borderTop: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)" }}>
            {!isEditing ? (
              <>
                <button onClick={() => setIsEditing(true)}
                  className="w-full h-10 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
                  style={{ background: `linear-gradient(135deg, ${ACCENT}, #6d28d9)` }}>
                  <Save className="w-4 h-4" />
                  Edit Item
                </button>
                <button onClick={currentItem.status === "Archived" ? handleUnarchive : handleArchive} disabled={archiving}
                  className="w-full h-10 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                  style={{
                    background: archiving ? `${ACCENT}20` : isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                    border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.10)",
                    color: isDark ? "#ffffff" : "#000000",
                    opacity: archiving ? 0.7 : 1,
                  }}>
                  <Archive className="w-4 h-4" />
                  {archiving ? (currentItem.status === "Archived" ? "Restoring…" : "Archiving…") : (currentItem.status === "Archived" ? "Restore" : "Archive")}
                </button>
              </>
            ) : (
              <>
                <button onClick={handleSave} disabled={saving || !formData.title?.trim()}
                  className="w-full h-10 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
                  style={{ background: `linear-gradient(135deg, ${ACCENT}, #6d28d9)`, opacity: saving || !formData.title?.trim() ? 0.6 : 1 }}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  {saving ? "Saving…" : "Save Changes"}
                </button>
                <button onClick={() => { setFormData(currentItem); setIsEditing(false); }}
                  className="w-full h-10 rounded-xl text-sm font-bold flex items-center justify-center"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                    border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.10)",
                    color: isDark ? "#ffffff" : "#000000",
                  }}>
                  Cancel
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
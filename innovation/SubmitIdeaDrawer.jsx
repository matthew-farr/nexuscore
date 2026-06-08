import { useState } from "react";
import { X, Lightbulb, Loader2, Send } from "lucide-react";
import { useTheme } from "../ThemeProvider";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const ACCENT = "#8b5cf6";

const CATEGORIES = ["Process Improvement", "Technology", "Customer Experience", "Cost Reduction", "Revenue Growth", "Compliance", "People & Culture", "Other"];
const DEPARTMENTS = ["Operations", "Sales", "Technology", "Compliance", "Finance", "HR", "Marketing", "All Departments"];

const EMPTY = { title: "", description: "", problem_statement: "", suggested_solution: "", business_benefit: "", category: "", department: "" };

export default function SubmitIdeaDrawer({ open, onClose }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const queryClient = useQueryClient();

  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  console.log("[SubmitIdeaDrawer] Rendered with open =", open);
  if (!open) return null;

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    console.log("[SubmitIdeaDrawer] Form submitted → Submitting idea:", form.title);
    setSaving(true);
    try {
      await base44.entities.InnovationIdea.create({
        ...form,
        submitted_by: user?.full_name || "Anonymous",
        submitted_by_id: user?.id || "",
        submitted_date: new Date().toISOString().split("T")[0],
        status: "Submitted",
        upvotes_count: 0,
        downvotes_count: 0,
        vote_score: 0,
        is_archived: false,
      });
      queryClient.invalidateQueries({ queryKey: ["innovationIdeas"] });
      queryClient.invalidateQueries({ queryKey: ["innovationIdeasAdmin"] });
      toast.success("Idea submitted! Thank you.");
      setForm(EMPTY);
      onClose();
    } catch (err) {
      toast.error("Failed to submit idea. Please try again.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: "100%",
    background: isDark ? "rgba(255,255,255,0.06)" : "#ffffff",
    border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.15)",
    color: isDark ? "#ffffff" : "#000000",
    borderRadius: "10px",
    padding: "10px 12px",
    fontSize: "13px",
    outline: "none",
  }

  const labelStyle = {
    display: "block",
    fontSize: "11px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "6px",
    color: isDark ? "#ffffff" : "#000000",
  };

  const drawerBg = isDark
    ? "linear-gradient(160deg, #0d1229 0%, #090f1e 100%)"
    : "linear-gradient(160deg, #ffffff 0%, #f8f6ff 100%)";

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)", pointerEvents: "auto" }} onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full z-50 w-full max-w-lg flex flex-col overflow-hidden"
        style={{ background: drawerBg, borderLeft: isDark ? "1px solid rgba(255,255,255,0.09)" : "1px solid rgba(0,0,0,0.08)", boxShadow: "-12px 0 48px rgba(0,0,0,0.25)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${ACCENT}18`, border: `1px solid ${ACCENT}30` }}>
            <Lightbulb className="w-4 h-4" style={{ color: ACCENT }} />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: isDark ? "#ffffff" : "#000000" }}>Submit an Idea</p>
            <p className="text-[10px]" style={{ color: isDark ? "#ffffff" : "#000000" }}>Share your improvement idea</p>
          </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)" }}>
            <X className="w-4 h-4" style={{ color: isDark ? "#ffffff" : "#000000" }} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          <div>
            <label style={labelStyle}>Idea Title *</label>
            <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Give your idea a clear title…" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea value={form.description} onChange={e => set("description", e.target.value)} placeholder="Briefly describe your idea…" rows={3} style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          <div>
            <label style={labelStyle}>What problem does this solve?</label>
            <textarea value={form.problem_statement} onChange={e => set("problem_statement", e.target.value)} placeholder="Describe the problem or pain point…" rows={3} style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          <div>
            <label style={labelStyle}>Suggested Solution</label>
            <textarea value={form.suggested_solution} onChange={e => set("suggested_solution", e.target.value)} placeholder="How could this be addressed?…" rows={3} style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          <div>
            <label style={labelStyle}>Business Benefit</label>
            <textarea value={form.business_benefit} onChange={e => set("business_benefit", e.target.value)} placeholder="What's the expected benefit?…" rows={2} style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Category</label>
              <select value={form.category} onChange={e => set("category", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="">Select…</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Department</label>
              <select value={form.department} onChange={e => set("department", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="">Select…</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button type="submit" disabled={saving}
              className="w-full flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-bold transition-all"
              style={{
                background: saving ? `${ACCENT}80` : `linear-gradient(135deg, ${ACCENT}, #6d28d9)`,
                color: "#ffffff",
                border: "none",
                opacity: saving ? 0.8 : 1,
                cursor: saving ? "not-allowed" : "pointer",
              }}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {saving ? "Submitting…" : "Submit Idea"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
import { useState, useEffect } from "react";
import { X, ThumbsUp, ThumbsDown, MinusCircle, ChevronDown, Map, Archive, Loader2 } from "lucide-react";
import { useTheme } from "../ThemeProvider";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const ACCENT = "#8b5cf6";

const STATUS_COLORS = {
  Submitted: "#8b5cf6", Reviewing: "#f59e0b", Planned: "#06b6d4",
  Building: "#10b981", Completed: "#22c55e", "Not Progressing": "#ef4444", Archived: "#64748b",
};
const STATUSES = ["Submitted", "Reviewing", "Planned", "Building", "Completed", "Not Progressing"];

export default function IdeaDetailDrawer({ idea, user, onClose, onSaved }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const queryClient = useQueryClient();
  const isAdmin = user?.role === "admin";

  const [voting, setVoting] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [convertingRoadmap, setConvertingRoadmap] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [currentIdea, setCurrentIdea] = useState(idea);

  // Keep local state in sync if parent refreshes
  useEffect(() => { setCurrentIdea(idea); }, [idea]);

  // Fetch user's existing vote
  const { data: myVote, refetch: refetchMyVote } = useQuery({
    queryKey: ["myVote", idea.id, user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const votes = await base44.entities.InnovationVote.filter({ idea_id: idea.id, user_id: user.id });
      return votes[0] || null;
    },
    enabled: !!user?.id,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["innovationIdeas"] });
    queryClient.invalidateQueries({ queryKey: ["innovationIdeasAdmin"] });
    queryClient.invalidateQueries({ queryKey: ["myVote", idea.id, user?.id] });
  };

  const handleVote = async (voteType) => {
    if (!user?.id || voting) return;
    console.log("[IdeaDetailDrawer] Vote clicked:", voteType);
    setVoting(true);
    try {
      if (myVote) {
        if (myVote.vote_type === voteType) {
          // Remove vote
          await base44.entities.InnovationVote.delete(myVote.id);
          const delta = voteType === "upvote" ? -1 : 1;
          const upDelta = voteType === "upvote" ? -1 : 0;
          const downDelta = voteType === "downvote" ? -1 : 0;
          const updated = await base44.entities.InnovationIdea.update(idea.id, {
            vote_score: (currentIdea.vote_score || 0) + delta,
            upvotes_count: Math.max(0, (currentIdea.upvotes_count || 0) + upDelta),
            downvotes_count: Math.max(0, (currentIdea.downvotes_count || 0) + downDelta),
          });
          setCurrentIdea(prev => ({ ...prev, ...updated }));
          toast.success("Vote removed");
        } else {
          // Change vote
          await base44.entities.InnovationVote.update(myVote.id, { vote_type: voteType });
          const scoreDelta = voteType === "upvote" ? 2 : -2;
          const updated = await base44.entities.InnovationIdea.update(idea.id, {
            vote_score: (currentIdea.vote_score || 0) + scoreDelta,
            upvotes_count: voteType === "upvote" ? (currentIdea.upvotes_count || 0) + 1 : Math.max(0, (currentIdea.upvotes_count || 0) - 1),
            downvotes_count: voteType === "downvote" ? (currentIdea.downvotes_count || 0) + 1 : Math.max(0, (currentIdea.downvotes_count || 0) - 1),
          });
          setCurrentIdea(prev => ({ ...prev, ...updated }));
          toast.success(voteType === "upvote" ? "Upvoted!" : "Downvoted");
        }
      } else {
        // New vote
        await base44.entities.InnovationVote.create({ idea_id: idea.id, user_id: user.id, vote_type: voteType });
        const scoreDelta = voteType === "upvote" ? 1 : -1;
        const updated = await base44.entities.InnovationIdea.update(idea.id, {
          vote_score: (currentIdea.vote_score || 0) + scoreDelta,
          upvotes_count: voteType === "upvote" ? (currentIdea.upvotes_count || 0) + 1 : (currentIdea.upvotes_count || 0),
          downvotes_count: voteType === "downvote" ? (currentIdea.downvotes_count || 0) + 1 : (currentIdea.downvotes_count || 0),
        });
        setCurrentIdea(prev => ({ ...prev, ...updated }));
        toast.success(voteType === "upvote" ? "Upvoted!" : "Downvoted");
      }
      refetchMyVote();
      invalidate();
    } catch (err) {
      toast.error("Failed to record vote");
      console.error(err);
    } finally {
      setVoting(false);
    }
  };

  const handleRemoveVote = async () => {
    if (!myVote || voting) return;
    console.log("[IdeaDetailDrawer] Remove vote clicked");
    setVoting(true);
    try {
      await base44.entities.InnovationVote.delete(myVote.id);
      const isUp = myVote.vote_type === "upvote";
      const updated = await base44.entities.InnovationIdea.update(idea.id, {
        vote_score: (currentIdea.vote_score || 0) + (isUp ? -1 : 1),
        upvotes_count: isUp ? Math.max(0, (currentIdea.upvotes_count || 0) - 1) : (currentIdea.upvotes_count || 0),
        downvotes_count: !isUp ? Math.max(0, (currentIdea.downvotes_count || 0) - 1) : (currentIdea.downvotes_count || 0),
      });
      setCurrentIdea(prev => ({ ...prev, ...updated }));
      refetchMyVote();
      invalidate();
      toast.success("Vote removed");
    } catch (err) {
      toast.error("Failed to remove vote");
    } finally {
      setVoting(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    console.log("[IdeaDetailDrawer] Status change:", newStatus);
    setSavingStatus(true);
    setShowStatusPicker(false);
    try {
      const updated = await base44.entities.InnovationIdea.update(idea.id, { status: newStatus });
      setCurrentIdea(prev => ({ ...prev, ...updated }));
      invalidate();
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setSavingStatus(false);
    }
  };

  const handleConvertToRoadmap = async () => {
    if (convertingRoadmap) return;
    console.log("[IdeaDetailDrawer] Convert to Internal Roadmap clicked");
    setConvertingRoadmap(true);
    try {
      const roadmapItem = await base44.entities.RoadmapItem.create({
        title: currentIdea.title,
        description: currentIdea.description || currentIdea.suggested_solution || "",
        roadmap_type: "Internal",
        quarter: "Future Considerations",
        status: "Planned",
      });
      await base44.entities.InnovationIdea.update(idea.id, {
        converted_to_roadmap: true,
        linked_roadmap_id: roadmapItem.id,
        status: "Planned",
      });
      setCurrentIdea(prev => ({ ...prev, converted_to_roadmap: true, status: "Planned" }));
      invalidate();
      toast.success("Added to Internal Roadmap!");
      if (onSaved) onSaved();
    } catch (err) {
      toast.error("Failed to convert to roadmap");
      console.error(err);
    } finally {
      setConvertingRoadmap(false);
    }
  };

  const handleArchive = async () => {
    if (archiving) return;
    console.log("[IdeaDetailDrawer] Archive clicked");
    setArchiving(true);
    try {
      await base44.entities.InnovationIdea.update(idea.id, { is_archived: true, status: "Archived" });
      invalidate();
      toast.success("Idea archived");
      if (onSaved) onSaved();
    } catch (err) {
      toast.error("Failed to archive idea");
    } finally {
      setArchiving(false);
    }
  };

  const statusColor = STATUS_COLORS[currentIdea.status] || ACCENT;
  const myVoteType = myVote?.vote_type;

  const drawerBg = isDark
    ? "linear-gradient(160deg, #0d1229 0%, #090f1e 100%)"
    : "linear-gradient(160deg, #ffffff 0%, #f8f6ff 100%)";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)", pointerEvents: "auto" }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-full z-50 w-full max-w-lg flex flex-col overflow-hidden"
        style={{
          background: drawerBg,
          borderLeft: isDark ? "1px solid rgba(255,255,255,0.09)" : "1px solid rgba(0,0,0,0.08)",
          boxShadow: "-12px 0 48px rgba(0,0,0,0.25)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
              style={{ background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}30` }}>
              {currentIdea.status || "Submitted"}
            </span>
            {savingStatus && <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: ACCENT }} />}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)" }}>
            <X className="w-4 h-4" style={{ color: isDark ? "#ffffff" : "#000000" }} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Title */}
          <div>
            <h2 className="text-lg font-bold leading-snug" style={{ color: isDark ? "#ffffff" : "#000000" }}>
              {currentIdea.title}
            </h2>
            <div className="flex flex-wrap gap-2 mt-2">
              {currentIdea.category && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{ background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)", color: isDark ? "#ffffff" : "#000000" }}>
                  {currentIdea.category}
                </span>
              )}
              {currentIdea.department && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{ background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)", color: isDark ? "#ffffff" : "#000000" }}>
                  {currentIdea.department}
                </span>
              )}
            </div>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-4 text-xs" style={{ color: isDark ? "rgba(255,255,255,0.65)" : "#000000" }}>
            {currentIdea.submitted_by && <span>By <strong style={{ color: isDark ? "#ffffff" : "#000000" }}>{currentIdea.submitted_by}</strong></span>}
            {currentIdea.submitted_date && <span>{new Date(currentIdea.submitted_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>}
          </div>

          {/* Votes */}
          <div className="rounded-xl p-4 flex items-center justify-between"
            style={{ background: isDark ? "rgba(139,92,246,0.08)" : "rgba(139,92,246,0.06)", border: `1px solid ${ACCENT}20` }}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: isDark ? "#ffffff" : "#000000" }}>Vote Score</p>
              <p className="text-2xl font-extrabold" style={{ color: ACCENT }}>{currentIdea.vote_score || 0}</p>
              <p className="text-[10px] mt-0.5" style={{ color: isDark ? "#ffffff" : "#000000" }}>
                {currentIdea.upvotes_count || 0} up · {currentIdea.downvotes_count || 0} down
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); handleVote("upvote"); }}
                disabled={voting}
                className="flex items-center gap-1.5 px-3 h-9 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: myVoteType === "upvote" ? "#10b98120" : isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)",
                  border: myVoteType === "upvote" ? "1px solid #10b98150" : isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.08)",
                  color: myVoteType === "upvote" ? "#10b981" : isDark ? "#ffffff" : "#000000",
                  }}>
                  <ThumbsUp className="w-3.5 h-3.5" /> Up
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleVote("downvote"); }}
                disabled={voting}
                className="flex items-center gap-1.5 px-3 h-9 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: myVoteType === "downvote" ? "#ef444420" : isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)",
                  border: myVoteType === "downvote" ? "1px solid #ef444450" : isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.08)",
                  color: myVoteType === "downvote" ? "#ef4444" : isDark ? "#ffffff" : "#000000",
                  }}>
                  <ThumbsDown className="w-3.5 h-3.5" /> Down
              </button>
              {myVote && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleRemoveVote(); }}
                  disabled={voting}
                  className="flex items-center gap-1.5 px-3 h-9 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                    border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.07)",
                    color: isDark ? "#ffffff" : "#000000",
                  }}>
                  <MinusCircle className="w-3.5 h-3.5" /> Remove
                </button>
              )}
            </div>
          </div>

          {/* Description */}
          {currentIdea.description && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: isDark ? "#ffffff" : "#000000" }}>Description</p>
              <p className="text-sm leading-relaxed" style={{ color: isDark ? "#ffffff" : "#000000" }}>{currentIdea.description}</p>
            </div>
          )}

          {/* Problem Statement */}
          {currentIdea.problem_statement && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: isDark ? "#ffffff" : "#000000" }}>Problem Statement</p>
              <p className="text-sm leading-relaxed" style={{ color: isDark ? "#ffffff" : "#000000" }}>{currentIdea.problem_statement}</p>
            </div>
          )}

          {/* Suggested Solution */}
          {currentIdea.suggested_solution && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: isDark ? "#ffffff" : "#000000" }}>Suggested Solution</p>
              <p className="text-sm leading-relaxed" style={{ color: isDark ? "#ffffff" : "#000000" }}>{currentIdea.suggested_solution}</p>
            </div>
          )}

          {/* Business Benefit */}
          {currentIdea.business_benefit && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: isDark ? "#ffffff" : "#000000" }}>Business Benefit</p>
              <p className="text-sm leading-relaxed" style={{ color: isDark ? "#ffffff" : "#000000" }}>{currentIdea.business_benefit}</p>
            </div>
          )}

          {/* Already converted badge */}
          {currentIdea.converted_to_roadmap && (
            <div className="rounded-xl px-4 py-3 flex items-center gap-2"
              style={{ background: "#10b98112", border: "1px solid #10b98130" }}>
              <Map className="w-3.5 h-3.5" style={{ color: "#10b981" }} />
              <p className="text-xs font-semibold" style={{ color: "#10b981" }}>Added to Internal Roadmap</p>
            </div>
          )}

          {/* Admin Section */}
          {isAdmin && (
            <div className="space-y-3 pt-2" style={{ borderTop: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.06)" }}>
              <p className="text-xs font-bold uppercase tracking-wider pt-2" style={{ color: isDark ? "#ffffff" : "#000000" }}>Admin Actions</p>

              {/* Status Picker */}
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowStatusPicker(p => !p); }}
                  disabled={savingStatus}
                  className="w-full flex items-center justify-between px-4 h-9 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                    border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.08)",
                    color: isDark ? "#ffffff" : "#000000",
                  }}>
                  <span>Change Status: {currentIdea.status}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                {showStatusPicker && (
                  <div className="absolute top-10 left-0 right-0 z-10 rounded-xl overflow-hidden"
                    style={{ background: isDark ? "#0d1229" : "#ffffff", border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.10)", boxShadow: "0 8px 24px rgba(0,0,0,0.20)" }}>
                    {STATUSES.map(s => {
                      const c = STATUS_COLORS[s] || ACCENT;
                      return (
                        <button key={s} onClick={(e) => { e.stopPropagation(); handleStatusChange(s); }}
                          className="w-full text-left px-4 py-2.5 text-xs font-semibold flex items-center gap-2 transition-colors"
                          style={{ color: c, background: s === currentIdea.status ? `${c}12` : "transparent" }}>
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c }} />
                          {s}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Convert to Roadmap */}
              {!currentIdea.converted_to_roadmap && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleConvertToRoadmap(); }}
                  disabled={convertingRoadmap}
                  className="w-full flex items-center justify-center gap-2 h-9 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    background: convertingRoadmap ? `${ACCENT}12` : `${ACCENT}14`,
                    border: `1px solid ${ACCENT}30`,
                    color: ACCENT,
                  }}>
                  {convertingRoadmap ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Map className="w-3.5 h-3.5" />}
                  {convertingRoadmap ? "Adding to Roadmap…" : "Convert to Internal Roadmap"}
                </button>
              )}

              {/* Archive */}
              <button
                onClick={(e) => { e.stopPropagation(); handleArchive(); }}
                disabled={archiving}
                className="w-full flex items-center justify-center gap-2 h-9 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: isDark ? "rgba(239,68,68,0.08)" : "rgba(239,68,68,0.06)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  color: "#ef4444",
                }}>
                {archiving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Archive className="w-3.5 h-3.5" />}
                {archiving ? "Archiving…" : "Archive Idea"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { X, Edit2, Trash2, CheckCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useTheme } from "../ThemeProvider";
import { getCategoryConfig } from "../../lib/announcementConfig";
import { acknowledgeAnnouncement, hasUserAcknowledged } from "../../services/announcementService";
import { base44 } from "../../api/base44Client";

export default function AnnouncementDetailModal({
  announcement,
  onClose,
  onEdit,
  onDelete,
  isAdmin = false,
  userProfile = null,
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const config = getCategoryConfig(announcement.category);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);
  const [acknowledging, setAcknowledging] = useState(false);

  useEffect(() => {
    const checkAcknowledgement = async () => {
      if (!userProfile || !announcement.requires_acknowledgement) return;
      const acked = await hasUserAcknowledged(announcement.id, userProfile.id);
      setHasAcknowledged(acked);
    };
    checkAcknowledgement();
  }, [announcement.id, userProfile, announcement.requires_acknowledgement]);

  const handleAcknowledge = async () => {
    if (!userProfile) return;
    setAcknowledging(true);
    try {
      const ack = await acknowledgeAnnouncement(announcement.id, userProfile.id);
      if (ack) {
        setHasAcknowledged(true);
        await base44.functions.invoke("logAnnouncementActivity", {
          action: "acknowledged",
          announcement,
        });
      }
    } catch (err) {
      console.error("Error acknowledging:", err);
    } finally {
      setAcknowledging(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div
        className="rounded-xl max-w-2xl w-full my-8"
        style={{
          background: isDark ? "rgba(20, 30, 60, 0.95)" : "rgba(255,255,255,0.95)",
          border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.10)",
        }}
      >
        {/* Header with cover image */}
        {announcement.cover_image_url && (
          <div className="relative h-48 overflow-hidden rounded-t-xl">
            <img
              src={announcement.cover_image_url}
              alt={announcement.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
          </div>
        )}

        <div className="p-6">
          {/* Top controls */}
          <div className="flex items-start justify-between mb-4">
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Category & priority badges */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `${config.colour}20`, border: `1px solid ${config.colour}30` }}
            >
              <config.icon className="w-4 h-4" style={{ color: config.colour }} />
            </div>
            <span
              className="text-xs px-2 py-1 rounded-full font-semibold"
              style={{ background: `${config.colour}20`, color: config.colour }}
            >
              {config.label}
            </span>
            {announcement.priority !== "low" && (
              <span
                className="text-xs px-2 py-1 rounded-full font-semibold"
                style={{
                  background:
                    announcement.priority === "critical"
                      ? "rgba(239, 68, 68, 0.2)"
                      : announcement.priority === "high"
                      ? "rgba(245, 158, 11, 0.2)"
                      : "rgba(59, 130, 246, 0.2)",
                  color:
                    announcement.priority === "critical"
                      ? "#ef4444"
                      : announcement.priority === "high"
                      ? "#f59e0b"
                      : "#3b82f6",
                }}
              >
                {announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)}
              </span>
            )}
            {announcement.is_pinned && (
              <span
                className="text-xs px-2 py-1 rounded-full font-semibold"
                style={{ background: "rgba(236, 44, 163, 0.2)", color: "#ec2ca3" }}
              >
                Pinned
              </span>
            )}
          </div>

          {/* Title */}
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: isDark ? "rgba(255,255,255,0.95)" : "hsl(230 25% 12%)" }}
          >
            {announcement.title}
          </h1>

          {/* Meta */}
          <p
            className="text-sm mb-6"
            style={{ color: isDark ? "rgba(255,255,255,0.50)" : "rgba(0,0,0,0.50)" }}
          >
            By {announcement.author_name} •{" "}
            {announcement.publish_datetime
              ? format(parseISO(announcement.publish_datetime), "MMMM d, yyyy")
              : format(new Date(announcement.created_date), "MMMM d, yyyy")}
          </p>

          {/* Body */}
          <div
            className="prose prose-sm prose-invert max-w-none mb-6"
            style={{ color: isDark ? "rgba(255,255,255,0.80)" : "rgba(0,0,0,0.80)" }}
          >
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p style={{ color: isDark ? "rgba(255,255,255,0.70)" : "rgba(0,0,0,0.70)" }}>
                    {children}
                  </p>
                ),
                h2: ({ children }) => (
                  <h2
                    style={{ color: isDark ? "rgba(255,255,255,0.90)" : "hsl(230 25% 12%)" }}
                    className="text-xl font-semibold mt-4 mb-2"
                  >
                    {children}
                  </h2>
                ),
                ul: ({ children }) => (
                  <ul style={{ color: isDark ? "rgba(255,255,255,0.70)" : "rgba(0,0,0,0.70)" }}>
                    {children}
                  </ul>
                ),
              }}
            >
              {announcement.body}
            </ReactMarkdown>
          </div>

          {/* Acknowledgement section */}
          {announcement.requires_acknowledgement && !isAdmin && (
            <div
              className="p-4 rounded-lg mb-6 border"
              style={{
                background: isDark ? "rgba(59, 130, 246, 0.10)" : "rgba(59, 130, 246, 0.05)",
                borderColor: "#3b82f6",
              }}
            >
              {hasAcknowledged ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" style={{ color: "#10b981" }} />
                  <span style={{ color: "#10b981" }} className="text-sm font-semibold">
                    You acknowledged this on {announcement.acknowledged_at && format(parseISO(announcement.acknowledged_at), "MMM d, yyyy")}
                  </span>
                </div>
              ) : (
                <button
                  onClick={handleAcknowledge}
                  disabled={acknowledging}
                  className="w-full py-2 px-4 rounded-lg text-sm font-semibold transition-all"
                  style={{
                    background: "#3b82f6",
                    color: "white",
                    opacity: acknowledging ? 0.5 : 1,
                  }}
                >
                  {acknowledging ? "Acknowledging..." : "I acknowledge that I have read this"}
                </button>
              )}
            </div>
          )}

          {/* Admin controls */}
          {isAdmin && (
            <div
              className="pt-6 border-t flex gap-3"
              style={{ borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}
            >
              <button
                onClick={() => {
                  onEdit(announcement);
                  onClose();
                }}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
                style={{
                  background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                  border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
                  color: isDark ? "rgba(255,255,255,0.70)" : "hsl(230 25% 20%)",
                }}
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={async () => {
                  if (window.confirm("Archive this announcement?")) {
                    onDelete();
                    onClose();
                  }
                }}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#ef4444",
                }}
              >
                <Trash2 className="w-4 h-4" />
                Archive
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                  border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
                  color: isDark ? "rgba(255,255,255,0.70)" : "hsl(230 25% 20%)",
                }}
              >
                Close
              </button>
            </div>
          )}

          {!isAdmin && (
            <div className="pt-6 border-t">
              <button
                onClick={onClose}
                className="w-full py-2 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                  border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
                  color: isDark ? "rgba(255,255,255,0.70)" : "hsl(230 25% 20%)",
                }}
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
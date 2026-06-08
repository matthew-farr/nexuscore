import { format, parseISO } from "date-fns";
import { X, Clock, MapPin, Edit2, Trash2 } from "lucide-react";
import { useTheme } from "../ThemeProvider";
import { getEventTypeConfig } from "../../lib/eventTypeConfig";
import { deleteCalendarEvent } from "../../services/calendarService";
import { base44 } from "../../api/base44Client";

export default function EventDetailsModal({ event, onClose, isAdmin = false, onEdit, onDelete }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const config = getEventTypeConfig(event.event_type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="rounded-xl p-6 max-w-md w-full"
        style={{
          background: isDark ? "rgba(20, 30, 60, 0.95)" : "rgba(255,255,255,0.95)",
          border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.10)",
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${config.colour}20`, border: `1px solid ${config.colour}30` }}
              >
                <config.icon className="w-4 h-4" style={{ color: config.colour }} />
              </div>
              <span
                className="text-xs font-semibold px-2 py-1 rounded-full"
                style={{ background: `${config.colour}20`, color: config.colour }}
              >
                {config.label}
              </span>
            </div>
            <h2
              className="text-xl font-bold"
              style={{ color: isDark ? "rgba(255,255,255,0.95)" : "hsl(230 25% 12%)" }}
            >
              {event.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Details */}
        <div className="space-y-3 mb-6">
          {/* Date & Time */}
          <div className="flex gap-3">
            <Clock className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: config.colour }} />
            <div>
              <p
                className="text-sm font-semibold"
                style={{ color: isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 15%)" }}
              >
                {event.all_day
                  ? format(parseISO(event.start_datetime), "EEEE, MMMM d, yyyy")
                  : `${format(parseISO(event.start_datetime), "EEEE, MMMM d, yyyy")} • ${format(
                      parseISO(event.start_datetime),
                      "HH:mm"
                    )} – ${format(parseISO(event.end_datetime), "HH:mm")}`}
              </p>
            </div>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex gap-3">
              <MapPin className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: config.colour }} />
              <p
                className="text-sm"
                style={{ color: isDark ? "rgba(255,255,255,0.70)" : "rgba(0,0,0,0.70)" }}
              >
                {event.location}
              </p>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div>
              <p
                className="text-sm"
                style={{ color: isDark ? "rgba(255,255,255,0.70)" : "rgba(0,0,0,0.70)" }}
              >
                {event.description}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t space-y-2" style={{ borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
          {isAdmin && (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onEdit(event);
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
                  if (window.confirm("Delete this event?")) {
                    const deleted = await deleteCalendarEvent(event.id);
                    if (deleted) {
                      await base44.functions.invoke("logCalendarActivity", {
                        action: "delete",
                        event,
                      });
                      onDelete();
                    }
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
                Delete
              </button>
            </div>
          )}
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
      </div>
    </div>
  );
}
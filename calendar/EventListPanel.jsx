import { format, parseISO } from "date-fns";
import { useTheme } from "../ThemeProvider";
import { getEventTypeConfig } from "../../lib/eventTypeConfig";
import { Clock, MapPin } from "lucide-react";

export default function EventListPanel({ events = [], selectedDate = null, onEventClick = () => {} }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (!selectedDate) {
    return (
      <div
        className="rounded-xl p-6 text-center"
        style={{
          background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)",
          border: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)",
        }}
      >
        <p style={{ color: isDark ? "rgba(255,255,255,0.40)" : "rgba(0,0,0,0.40)" }}>
          Select a date to view events
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="mb-4">
        <h4 className="text-sm font-semibold" style={{ color: isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 15%)" }}>
          {format(selectedDate, "EEEE, MMMM d")}
        </h4>
        <p style={{ color: isDark ? "rgba(255,255,255,0.40)" : "rgba(0,0,0,0.40)" }} className="text-xs">
          {events.length} event{events.length !== 1 ? "s" : ""}
        </p>
      </div>

      {events.length === 0 ? (
        <div
          className="rounded-xl p-6 text-center"
          style={{
            background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)",
            border: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)",
          }}
        >
          <p style={{ color: isDark ? "rgba(255,255,255,0.40)" : "rgba(0,0,0,0.40)" }}>
            No events scheduled
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((event) => {
            const config = getEventTypeConfig(event.event_type);
            const Icon = config.icon;
            const startTime = format(parseISO(event.start_datetime), "HH:mm");
            const endTime = format(parseISO(event.end_datetime), "HH:mm");

            return (
              <button
                key={event.id}
                onClick={() => onEventClick(event)}
                className="w-full text-left p-3 rounded-lg transition-all hover:shadow-lg"
                style={{
                  background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                  border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
                }}
              >
                <div className="flex gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${config.colour}20`, border: `1px solid ${config.colour}30` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: config.colour }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: isDark ? "rgba(255,255,255,0.90)" : "hsl(230 25% 12%)" }}>
                      {event.title}
                    </p>
                    <div className="flex gap-3 mt-1 text-xs" style={{ color: isDark ? "rgba(255,255,255,0.50)" : "rgba(0,0,0,0.50)" }}>
                      {!event.all_day && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {startTime} - {endTime}
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {event.location}
                        </div>
                      )}
                    </div>
                  </div>
                  <span
                    className="text-[10px] font-semibold px-2 py-1 rounded-full flex-shrink-0"
                    style={{ background: `${config.colour}20`, color: config.colour }}
                  >
                    {config.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
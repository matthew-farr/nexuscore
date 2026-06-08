import { useState, useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "../ThemeProvider";
import { getEventTypeConfig } from "../../lib/eventTypeConfig";

export default function MonthCalendarView({ events = [], onDateClick = () => {} }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get days to display (pad with previous/next month)
  const startDate = monthStart;
  while (startDate.getDay() !== 0) {
    startDate.setDate(startDate.getDate() - 1);
  }
  const endDate = monthEnd;
  while (endDate.getDay() !== 6) {
    endDate.setDate(endDate.getDate() + 1);
  }
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  // Group events by date
  const eventsByDate = useMemo(() => {
    const map = {};
    events.forEach((event) => {
      const date = format(new Date(event.start_datetime), "yyyy-MM-dd");
      if (!map[date]) map[date] = [];
      map[date].push(event);
    });
    return map;
  }, [events]);

  return (
    <div
      className="rounded-xl p-4 space-y-4"
      style={{
        background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)",
        border: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold" style={{ color: isDark ? "rgba(255,255,255,0.90)" : "hsl(230 25% 12%)" }}>
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-1 rounded-lg hover:bg-opacity-10"
            style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-1 rounded-lg hover:bg-opacity-10"
            style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 gap-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-xs font-semibold text-center py-2"
            style={{ color: isDark ? "rgba(255,255,255,0.40)" : "rgba(0,0,0,0.40)" }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, idx) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const dateStr = format(day, "yyyy-MM-dd");
          const dayEvents = eventsByDate[dateStr] || [];
          const hasEvents = dayEvents.length > 0;

          return (
            <button
              key={idx}
              onClick={() => onDateClick(day, dayEvents)}
              className="aspect-square p-1 rounded-lg transition-all text-xs relative group"
              style={{
                background: isCurrentMonth
                  ? isDark
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(0,0,0,0.025)"
                  : isDark
                  ? "rgba(255,255,255,0.01)"
                  : "rgba(0,0,0,0.005)",
                border: hasEvents
                  ? `1px solid hsl(320 85% 55%)`
                  : isDark
                  ? "1px solid rgba(255,255,255,0.05)"
                  : "1px solid rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{
                  color: isCurrentMonth
                    ? isDark
                      ? "rgba(255,255,255,0.80)"
                      : "hsl(230 25% 15%)"
                    : isDark
                    ? "rgba(255,255,255,0.30)"
                    : "rgba(0,0,0,0.30)",
                }}
              >
                {format(day, "d")}
              </div>

              {/* Event dots */}
              {hasEvents && (
                <div className="flex gap-0.5 mt-0.5 flex-wrap">
                  {dayEvents.slice(0, 2).map((event, i) => {
                    const config = getEventTypeConfig(event.event_type);
                    return (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: config.colour }}
                      />
                    );
                  })}
                  {dayEvents.length > 2 && (
                    <span
                      className="text-[9px] leading-none"
                      style={{ color: "rgba(236, 44, 163, 0.8)" }}
                    >
                      +{dayEvents.length - 2}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
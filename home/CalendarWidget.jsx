import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { format, parseISO, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import GlassCard from "../ui-custom/GlassCard";
import { getEventsForMonth, getEventsForDate } from "../../services/calendarService";
import { useAuth } from "../../lib/AuthContext";
import { getEventTypeConfig } from "../../lib/eventTypeConfig";

const DAYS = ["S", "M", "T", "W", "Th", "F", "Sa"];

export default function CalendarWidget() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [monthEvents, setMonthEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const loadEvents = async () => {
      setLoading(true);
      const events = await getEventsForMonth(currentDate, user);
      setMonthEvents(events);
      setLoading(false);
    };
    loadEvents();
  }, [currentDate, user]);

  const handleDateClick = async (day) => {
    setSelectedDate(day);
    if (!user) {
      setSelectedDayEvents([]);
      return;
    }
    const dayEvents = await getEventsForDate(day, user);
    setSelectedDayEvents(dayEvents);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const blanks = Array(firstDay).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const cells = [...blanks, ...days];

  // Group events by date
  const eventsByDate = {};
  monthEvents.forEach((event) => {
    const date = format(parseISO(event.start_datetime), "d");
    if (!eventsByDate[date]) eventsByDate[date] = [];
    eventsByDate[date].push(event);
  });

  return (
    <GlassCard delay={0.2} hover={false} className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">
          {monthName} {year}
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-muted/50 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-muted/50 transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {loading ? (
        <div className="h-24 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-0.5">
          {cells.map((day, i) => {
            const dayHasEvents = day && eventsByDate[day];
            const isSelected = selectedDate && selectedDate.getDate() === day;

            return (
              <button
                key={i}
                onClick={() => day && handleDateClick(new Date(year, month, day))}
                className={`text-center text-xs py-1.5 rounded-md transition-colors relative
                  ${!day
                    ? ""
                    : isSelected
                    ? "bg-primary text-primary-foreground font-bold shadow-sm shadow-primary/30"
                    : dayHasEvents
                    ? "bg-accent/15 text-foreground border border-accent/30 hover:bg-accent/20"
                    : "text-foreground hover:bg-muted/50"
                }`}
              >
                {day || ""}
                {dayHasEvents && !isSelected && (
                  <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                    {dayHasEvents.slice(0, 2).map((event, idx) => {
                      const config = getEventTypeConfig(event.event_type);
                      return (
                        <div
                          key={idx}
                          className="w-1 h-1 rounded-full"
                          style={{ background: config.colour }}
                        />
                      );
                    })}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-border/30">
        {selectedDate ? (
          <div>
            <p className="text-xs text-muted-foreground mb-2">
              {format(selectedDate, "MMM d")} • {selectedDayEvents.length} event{selectedDayEvents.length !== 1 ? "s" : ""}
            </p>
            {selectedDayEvents.length > 0 && (
              <div className="space-y-1 mb-2 max-h-16 overflow-y-auto">
                {selectedDayEvents.map((event) => {
                  const config = getEventTypeConfig(event.event_type);
                  return (
                    <div
                      key={event.id}
                      className="text-[10px] px-2 py-1 rounded flex gap-1 items-center"
                      style={{ background: `${config.colour}10`, border: `1px solid ${config.colour}30` }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: config.colour }} />
                      <span className="text-foreground truncate">{event.title}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground mb-2">Select a date to view events</p>
        )}
        <Link
          to="/calendar"
          className="w-full py-2 text-xs font-medium text-primary border border-primary/30 rounded-xl hover:bg-primary/10 transition-colors block text-center"
        >
          View Full Calendar
        </Link>
      </div>
    </GlassCard>
  );
}
import { useState, useEffect } from "react";
import { useAuth } from "../lib/AuthContext";
import { getEventsForMonth } from "../services/calendarService";
import { useActivityTracking } from "../hooks/useActivityTracking";
import PageContainer from "../components/ui-custom/PageContainer";
import MonthCalendarView from "../components/calendar/MonthCalendarView";
import EventListPanel from "../components/calendar/EventListPanel";
import EventDetailsModal from "../components/calendar/EventDetailsModal";
import EventFormModal from "../components/calendar/EventFormModal";
import { useTheme } from "../components/ThemeProvider";
import { Search, Plus } from "lucide-react";

export default function Calendar() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [allEvents, setAllEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("all");
  const isAdmin = user?.role === "Admin";

  useActivityTracking({
    entity_type: "hub",
    entity_id: "calendar",
    title: "Calendar",
    route: "/calendar",
    icon: "Calendar",
  });

  useEffect(() => {
    if (!user) return;
    const loadEvents = async () => {
      setLoading(true);
      const now = new Date();
      const events = await getEventsForMonth(now, user);
      setAllEvents(events);
      setLoading(false);
    };
    loadEvents();
  }, [user]);

  const refreshEvents = async () => {
    if (!user) return;
    const now = new Date();
    const events = await getEventsForMonth(now, user);
    setAllEvents(events);
    setSelectedDate(null);
    setEditingEvent(null);
    setShowFormModal(false);
  };

  const handleDateClick = (day, dayEvents) => {
    setSelectedDate(day);
  };

  const selectedDateEvents = selectedDate
    ? allEvents.filter(
        (event) => new Date(event.start_datetime).toDateString() === selectedDate.toDateString()
      )
    : [];

  const filteredEvents = selectedDateEvents.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = eventTypeFilter === "all" || event.event_type === eventTypeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold" style={{ color: isDark ? "rgba(255,255,255,0.95)" : "hsl(230 25% 12%)" }}>
            Calendar
          </h1>
          <p style={{ color: isDark ? "rgba(255,255,255,0.50)" : "rgba(0,0,0,0.50)" }}>
            Events, deadlines, and important dates
          </p>
        </div>

        {/* Action buttons */}
        {isAdmin && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditingEvent(null);
                setShowFormModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: "hsl(320 85% 55%)",
                color: "white",
              }}
            >
              <Plus className="w-4 h-4" />
              New Event
            </button>
          </div>
        )}

        {/* Main layout */}
        <div className="flex flex-col xl:flex-row gap-4">
          {/* Calendar panel */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
            ) : (
              <MonthCalendarView events={allEvents} onDateClick={handleDateClick} />
            )}
          </div>

          {/* Event list panel */}
          <div className="w-full xl:w-80">
            {/* Search and filters */}
            <div className="space-y-3 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: isDark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.30)" }} />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg text-sm"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                    border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
                    color: isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 15%)",
                  }}
                />
              </div>

              <select
                value={eventTypeFilter}
                onChange={(e) => setEventTypeFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                  border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
                  color: isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 15%)",
                }}
              >
                <option value="all">All Events</option>
                <option value="company_event">Company Events</option>
                <option value="training">Training</option>
                <option value="meeting">Meetings</option>
                <option value="deadline">Deadlines</option>
                <option value="birthday">Birthdays</option>
                <option value="anniversary">Anniversaries</option>
                <option value="compliance">Compliance</option>
              </select>
            </div>

            {/* Events panel */}
            <EventListPanel
              events={filteredEvents}
              selectedDate={selectedDate}
              onEventClick={setSelectedEvent}
            />
          </div>
        </div>
      </div>

      {/* Event details modal */}
      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          isAdmin={isAdmin}
          onEdit={(event) => setEditingEvent(event)}
          onDelete={refreshEvents}
        />
      )}

      {/* Event form modal */}
      {showFormModal && (
        <EventFormModal
          event={editingEvent}
          onClose={() => {
            setShowFormModal(false);
            setEditingEvent(null);
          }}
          onSave={refreshEvents}
          userProfile={user}
        />
      )}
    </PageContainer>
  );
}
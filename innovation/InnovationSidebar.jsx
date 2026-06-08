import { Bell, Clock, TrendingUp } from "lucide-react";
import { useTheme } from "../ThemeProvider";
import HubSidebarPanel from "../hub/HubSidebarPanel";
import CalendarWidget from "../home/CalendarWidget";

const ACCENT = "#8b5cf6";

const NOTIFICATIONS = [
  { text: "Innovation Hub is now live", time: "Today" },
  { text: "Submit your first idea to get started", time: "Today" },
];

const RECENTLY_UPDATED = [
  { title: "No recent activity yet", sub: "Ideas and roadmap updates will appear here" },
];

const UPCOMING = [
  { title: "Innovation review meeting", time: "TBC" },
  { title: "Q3 roadmap planning", time: "TBC" },
];

export default function InnovationSidebar() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="w-full xl:w-[260px] flex-shrink-0 space-y-4">

      {/* 1. Calendar */}
      <CalendarWidget />

      {/* 2. Notifications */}
      <HubSidebarPanel title="Notifications" delay={0.10}>
        <div className="space-y-2">
          {NOTIFICATIONS.map((n, i) => (
            <div key={i} className="flex items-start gap-2">
              <Bell className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: ACCENT }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs leading-tight" style={{ color: isDark ? "#ffffff" : "#000000" }}>
                  {n.text}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: isDark ? "#ffffff" : "#000000" }}>
                  {n.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </HubSidebarPanel>

      {/* 3. Recently Updated */}
      <HubSidebarPanel title="Recently Updated" delay={0.14}>
        <div className="space-y-2">
          {RECENTLY_UPDATED.map((r, i) => (
            <div key={i} className="flex items-start gap-2">
              <TrendingUp className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: ACCENT }} />
              <div>
                <p className="text-xs font-medium leading-tight" style={{ color: isDark ? "#ffffff" : "#000000" }}>
                  {r.title}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: isDark ? "#ffffff" : "#000000" }}>
                  {r.sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </HubSidebarPanel>

      {/* 4. Upcoming */}
      <HubSidebarPanel title="Upcoming" delay={0.18}>
        <div className="space-y-2">
          {UPCOMING.map((u, i) => (
            <div key={i} className="flex items-start gap-2">
              <Clock className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: ACCENT }} />
              <div>
                <p className="text-xs font-medium leading-tight" style={{ color: isDark ? "#ffffff" : "#000000" }}>
                  {u.title}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: isDark ? "#ffffff" : "#000000" }}>
                  {u.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </HubSidebarPanel>
    </div>
  );
}
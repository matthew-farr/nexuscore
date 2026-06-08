/**
 * HubSidebarSection — generic version of SalesSidebar.
 * Renders Calendar + Notifications (from HubContentItem) + Upcoming widget.
 * Identical structure and styling to SalesSidebar.
 */
import { useState, useEffect } from "react";
import { Bell, Clock } from "lucide-react";
import { useTheme } from "../ThemeProvider";
import { base44 } from "@/api/base44Client";
import HubSidebarPanel from "./HubSidebarPanel";
import CalendarWidget from "../home/CalendarWidget";

const DEFAULT_NOTIFICATIONS = [
  { text: "No new notifications", time: "Now" },
];

export default function HubSidebarSection({ hubKey, accentColour }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const ACCENT = accentColour || "#06b6d4";
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hubKey) return;
    const now = new Date().toISOString();
    base44.entities.HubContentItem
      .filter({ hub_key: hubKey, content_type: "notification", is_active: true }, "sort_order", 10)
      .then(data => {
        const active = (data || []).filter(n => {
          const start = n.start_date ? new Date(n.start_date) : new Date(0);
          const end = n.end_date ? new Date(n.end_date) : new Date("2099-12-31");
          return new Date(now) >= start && new Date(now) <= end;
        });
        setNotifications(active.map(n => ({
          text: n.description || n.title,
          time: n.start_date ? new Date(n.start_date).toLocaleDateString("en-GB", { month: "short", day: "numeric" }) : "Active",
        })));
      })
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, [hubKey]);

  const displayNotifications = notifications.length > 0 ? notifications : DEFAULT_NOTIFICATIONS;

  return (
    <div className="w-full xl:w-[260px] flex-shrink-0 space-y-4">
      {/* 1. Calendar */}
      <CalendarWidget />

      {/* 2. Notifications */}
      <HubSidebarPanel title="Notifications" delay={0.10}>
        <div className="space-y-2">
          {displayNotifications.map((n, i) => (
            <div key={i} className="flex items-start gap-2">
              <Bell className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: ACCENT }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs leading-tight" style={{ color: isDark ? "rgba(255,255,255,0.75)" : "hsl(230 25% 15%)" }}>{n.text}</p>
                <p className="text-[10px] mt-0.5" style={{ color: isDark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.35)" }}>{n.time}</p>
              </div>
            </div>
          ))}
        </div>
      </HubSidebarPanel>

      {/* 3. Recently Updated */}
      <HubSidebarPanel title="Recently Updated" delay={0.14}>
        <div className="space-y-2">
          {[
            { title: "Operations Manual", time: "Today" },
            { title: "DBS Process SOP", time: "Yesterday" },
            { title: "Compliance Policy", time: "3 days ago" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <Clock className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: isDark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.30)" }} />
              <div>
                <p className="text-xs font-medium leading-tight" style={{ color: isDark ? "rgba(255,255,255,0.78)" : "hsl(230 25% 15%)" }}>{item.title}</p>
                <p className="text-[10px] mt-0.5" style={{ color: isDark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.35)" }}>{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </HubSidebarPanel>

      {/* 4. Upcoming */}
      <HubSidebarPanel title="Upcoming" delay={0.18}>
        <div className="space-y-2">
          {[
            { title: "Monthly Ops Review", time: "Mon 2 Jun · 09:30" },
            { title: "Compliance Audit", time: "Wed 4 Jun" },
            { title: "Process Update Meeting", time: "Fri 6 Jun · 14:00" },
          ].map((u, i) => (
            <div key={i} className="flex items-start gap-2">
              <Clock className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: isDark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.30)" }} />
              <div>
                <p className="text-xs font-medium leading-tight" style={{ color: isDark ? "rgba(255,255,255,0.78)" : "hsl(230 25% 15%)" }}>{u.title}</p>
                <p className="text-[10px] mt-0.5" style={{ color: isDark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.35)" }}>{u.time}</p>
              </div>
            </div>
          ))}
        </div>
      </HubSidebarPanel>
    </div>
  );
}
import { useState, useEffect } from "react";
import { Bell, Clock } from "lucide-react";
import { useTheme } from "../ThemeProvider";
import { base44 } from "@/api/base44Client";
import HubSidebarPanel from "../hub/HubSidebarPanel";
import CalendarWidget from "../home/CalendarWidget";
import { useSalesHubBranding } from "./SalesHubBrandingContext";

const TOP_PERFORMERS = [
  { name: "Matthew F.", value: "£48K", rank: 1 },
  { name: "Sarah L.",   value: "£36K", rank: 2 },
  { name: "James T.",   value: "£29K", rank: 3 },
  { name: "Rachel M.",  value: "£22K", rank: 4 },
];

const UPCOMING = [
  { title: "Pipeline Review",        time: "Mon 2 Jun · 09:30" },
  { title: "Vertex Financial Call",  time: "Mon 2 Jun · 11:00" },
  { title: "Enterprise Proposal Due",time: "Wed 4 Jun" },
  { title: "Q2 Commission Deadline", time: "Fri 6 Jun" },
];

const DEFAULT_NOTIFICATIONS = [
  { text: "New pricing approved for enterprise tier", time: "Today" },
  { text: "Q1 commission statements now available",   time: "3 days ago" },
  { text: "June pipeline meeting scheduled",          time: "5 days ago" },
];

const rankColors = ["#f59e0b", "#94a3b8", "#b45309"];

export default function SalesSidebar() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const branding = useSalesHubBranding();
  const ACCENT = branding.accent_colour || "#06b6d4";
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const now = new Date().toISOString();
      const data = await base44.entities.SalesHubNotificationConfig.filter(
        { is_active: true },
        "priority",
        100
      );
      const active = (data || []).filter(n => {
        const start = n.start_date ? new Date(n.start_date) : new Date(0);
        const end = n.end_date ? new Date(n.end_date) : new Date("2099-12-31");
        return new Date(now) >= start && new Date(now) <= end;
      });
      if (active.length > 0) {
        setNotifications(
          active.map(n => ({
            text: n.message,
            time: n.start_date ? new Date(n.start_date).toLocaleDateString("en-GB", { month: "short", day: "numeric" }) : "Active",
          }))
        );
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full xl:w-[260px] flex-shrink-0 space-y-4">

      {/* 1. Calendar */}
      <CalendarWidget />

      {/* 2. Notifications */}
      <HubSidebarPanel title="Notifications" delay={0.10}>
        <div className="space-y-2">
          {notifications.map((n, i) => (
            <div key={i} className="flex items-start gap-2">
              <Bell className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: ACCENT }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs leading-tight" style={{ color: isDark ? "rgba(255,255,255,0.75)" : "hsl(230 25% 15%)" }}>
                  {n.text}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: isDark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.35)" }}>
                  {n.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </HubSidebarPanel>

      {/* 3. Top Performers */}
      <HubSidebarPanel title="Top Performers" delay={0.14}>
        <div className="space-y-2">
          {TOP_PERFORMERS.map((p, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-bold"
                style={{
                  background: i < 3 ? `${rankColors[i]}20` : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"),
                  border: `1px solid ${i < 3 ? rankColors[i] : (isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)")}`,
                  color: i < 3 ? rankColors[i] : (isDark ? "rgba(255,255,255,0.40)" : "rgba(0,0,0,0.40)"),
                }}
              >
                {p.rank}
              </div>
              <span className="flex-1 text-xs truncate" style={{ color: isDark ? "rgba(255,255,255,0.75)" : "hsl(230 25% 15%)" }}>
                {p.name}
              </span>
              <span className="text-xs font-semibold" style={{ color: ACCENT }}>
                {p.value}
              </span>
            </div>
          ))}
        </div>
        <p className="text-[9px] mt-3" style={{ color: isDark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.28)" }}>
          MTD · Gross Profit
        </p>
      </HubSidebarPanel>

      {/* 4. Upcoming Activity */}
      <HubSidebarPanel title="Upcoming" delay={0.18}>
        <div className="space-y-2">
          {UPCOMING.map((u, i) => (
            <div key={i} className="flex items-start gap-2">
              <Clock className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: isDark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.30)" }} />
              <div>
                <p className="text-xs font-medium leading-tight" style={{ color: isDark ? "rgba(255,255,255,0.78)" : "hsl(230 25% 15%)" }}>
                  {u.title}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: isDark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.35)" }}>
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
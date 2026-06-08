/**
 * Core widget implementations — Calendar, Quick Links, Announcements,
 * Notifications, Activity Feed, KPI, Resource Library, Embeds, AI Assistant, Tasks
 */
import { useState, useEffect } from "react";
import {
  Calendar, Link2, Megaphone, Bell, Activity, TrendingUp, BookOpen,
  BarChart2, ExternalLink, Sparkles, CheckSquare, FileText, AlertCircle,
  ArrowUp, ArrowDown, Minus, Clock, ChevronRight, Monitor
} from "lucide-react";
import { base44 } from "@/api/base44Client";

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────
function WidgetShell({ title, icon: Icon, theme, children, action, actionLabel }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {(title || action) && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {Icon && (
              <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: theme.iconBg, border: `1px solid ${theme.iconBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon style={{ width: "13px", height: "13px", color: theme.primary }} />
              </div>
            )}
            <span style={{ fontSize: "13px", fontWeight: 700, color: theme.text, opacity: 0.85 }}>{title}</span>
          </div>
          {action && (
            <button onClick={action} style={{ fontSize: "11px", color: theme.primary, background: "none", border: "none", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: "3px" }}>
              {actionLabel || "View all"} <ChevronRight style={{ width: "11px", height: "11px" }} />
            </button>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

function Spinner({ theme }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: `2px solid ${theme.spinnerBorder}`, borderTopColor: theme.spinnerTop, animation: "spin 0.8s linear infinite" }} />
    </div>
  );
}

function EmptyMsg({ text, theme }) {
  return <p style={{ fontSize: "12px", color: theme.textSubtle, textAlign: "center", padding: "16px 0" }}>{text}</p>;
}

// ─────────────────────────────────────────
// CALENDAR WIDGET
// ─────────────────────────────────────────
export function CalendarWidget({ config, theme }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const maxEvents = config?.maxEvents || 5;

  useEffect(() => {
    base44.entities.CalendarEvent
      .filter({ is_active: true }, "start_datetime", maxEvents)
      .then(data => setEvents(data || []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [maxEvents]);

  const fmt = (dt) => {
    if (!dt) return "";
    const d = new Date(dt);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <WidgetShell title="Calendar" icon={Calendar} theme={theme}>
      {loading ? <Spinner theme={theme} /> : events.length === 0 ? (
        <EmptyMsg text="No upcoming events" theme={theme} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {events.slice(0, maxEvents).map(ev => (
            <div key={ev.id} style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "8px 10px", borderRadius: "8px", background: theme.surface, border: `1px solid ${theme.border}` }}>
              <div style={{ width: "3px", height: "36px", borderRadius: "2px", background: theme.primary, flexShrink: 0, marginTop: "1px" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: theme.text }}>{ev.title}</div>
                <div style={{ fontSize: "11px", color: theme.textMuted, display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                  <Clock style={{ width: "10px", height: "10px" }} />
                  {fmt(ev.start_datetime)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </WidgetShell>
  );
}

// ─────────────────────────────────────────
// QUICK LINKS WIDGET
// ─────────────────────────────────────────
export function QuickLinksWidget({ config, theme, hubKey }) {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const display = config?.display || "grid";
  const resolvedHub = config?.hub_key || hubKey || "sales";

  useEffect(() => {
    // Use HubContentItem for non-sales hubs, SalesHubQuickLink for sales (backward compat)
    const promise = resolvedHub === "sales"
      ? base44.entities.SalesHubQuickLink.filter({ is_active: true }, "sort_order", 20)
      : base44.entities.HubContentItem.filter({ hub_key: resolvedHub, content_type: "quick_link", is_active: true }, "sort_order", 20);
    promise
      .then(data => setLinks(data || []))
      .catch(() => setLinks([]))
      .finally(() => setLoading(false));
  }, [resolvedHub]);

  if (loading) return <WidgetShell title="Quick Links" icon={Link2} theme={theme}><Spinner theme={theme} /></WidgetShell>;
  if (links.length === 0) return <WidgetShell title="Quick Links" icon={Link2} theme={theme}><EmptyMsg text="No quick links configured" theme={theme} /></WidgetShell>;

  return (
    <WidgetShell title="Quick Links" icon={Link2} theme={theme}>
      <div style={{ display: "grid", gridTemplateColumns: display === "grid" ? "repeat(2, 1fr)" : "1fr", gap: "6px" }}>
        {links.map(link => (
          <a key={link.id} href={link.url} target={link.open_in_new_tab !== false ? "_blank" : "_self"} rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", borderRadius: "8px", background: theme.surface, border: `1px solid ${theme.border}`, textDecoration: "none", transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = theme.surfaceHover; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = theme.surface; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <Link2 style={{ width: "12px", height: "12px", color: theme.primary, flexShrink: 0 }} />
            <span style={{ fontSize: "12px", fontWeight: 600, color: theme.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{link.title}</span>
            <ExternalLink style={{ width: "10px", height: "10px", color: theme.textSubtle, flexShrink: 0, marginLeft: "auto" }} />
          </a>
        ))}
      </div>
    </WidgetShell>
  );
}

// ─────────────────────────────────────────
// ANNOUNCEMENTS WIDGET
// ─────────────────────────────────────────
export function AnnouncementsWidget({ config, theme }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const maxItems = config?.maxItems || 3;

  useEffect(() => {
    base44.entities.Announcement
      .filter({ status: "published", is_active: true }, "-publish_datetime", maxItems)
      .then(data => setItems(data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [maxItems]);

  return (
    <WidgetShell title="Announcements" icon={Megaphone} theme={theme}>
      {loading ? <Spinner theme={theme} /> : items.length === 0 ? (
        <EmptyMsg text="No announcements" theme={theme} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {items.map(a => (
            <div key={a.id} style={{ padding: "10px 12px", borderRadius: "8px", background: theme.surface, border: `1px solid ${theme.border}` }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                <Megaphone style={{ width: "13px", height: "13px", color: theme.primary, flexShrink: 0, marginTop: "1px" }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: theme.text }}>{a.title}</div>
                  {a.excerpt && <div style={{ fontSize: "11px", color: theme.textMuted, marginTop: "2px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{a.excerpt}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </WidgetShell>
  );
}

// ─────────────────────────────────────────
// NOTIFICATIONS WIDGET
// ─────────────────────────────────────────
export function NotificationsWidget({ config, theme, hubKey }) {
  const typeColour = { Alert: "#ef4444", Warning: "#f59e0b", Info: theme.info || "#0ea5e9", Success: "#10b981", Update: theme.primary };
  const maxItems = config?.maxItems || 5;
  const resolvedHub = config?.hub_key || hubKey || "sales";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const promise = resolvedHub === "sales"
      ? base44.entities.SalesHubNotificationConfig.filter({ is_active: true }, "-created_date", maxItems)
      : base44.entities.HubContentItem.filter({ hub_key: resolvedHub, content_type: "notification", is_active: true }, "-created_date", maxItems);
    promise
      .then(data => setItems(data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [resolvedHub, maxItems]);

  return (
    <WidgetShell title="Notifications" icon={Bell} theme={theme}>
      {loading ? <Spinner theme={theme} /> : items.length === 0 ? (
        <EmptyMsg text="No notifications" theme={theme} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          {items.map(n => {
            const c = typeColour[n.notification_type] || theme.primary;
            return (
              <div key={n.id} style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "8px 10px", borderRadius: "8px", background: `${c}0a`, border: `1px solid ${c}25` }}>
                <AlertCircle style={{ width: "13px", height: "13px", color: c, flexShrink: 0, marginTop: "1px" }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: theme.text }}>{n.title}</div>
                  {n.message && <div style={{ fontSize: "11px", color: theme.textMuted, marginTop: "1px" }}>{n.message}</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </WidgetShell>
  );
}

// ─────────────────────────────────────────
// ACTIVITY FEED WIDGET
// ─────────────────────────────────────────
export function ActivityFeedWidget({ config, theme }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const maxItems = config?.maxItems || 8;

  useEffect(() => {
    base44.entities.Activity
      .filter({}, "-created_date", maxItems)
      .then(data => setItems(data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [maxItems]);

  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "";

  return (
    <WidgetShell title="Activity Feed" icon={Activity} theme={theme}>
      {loading ? <Spinner theme={theme} /> : items.length === 0 ? (
        <EmptyMsg text="No recent activity" theme={theme} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {items.map((item, i) => (
            <div key={item.id || i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "7px 0", borderBottom: i < items.length - 1 ? `1px solid ${theme.borderSubtle}` : "none" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: theme.primary, flexShrink: 0, marginTop: "5px" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "12px", color: theme.text }}>{item.description || item.action || item.title}</div>
                <div style={{ fontSize: "10px", color: theme.textSubtle, marginTop: "2px" }}>{fmt(item.created_date)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </WidgetShell>
  );
}

// ─────────────────────────────────────────
// KPI WIDGET
// ─────────────────────────────────────────
export function KpiWidget({ config, theme }) {
  const { metric = "Metric", value = "—", unit = "", trend = "", trendDirection = "neutral", description = "" } = config || {};
  const TrendIcon = trendDirection === "up" ? ArrowUp : trendDirection === "down" ? ArrowDown : Minus;
  const trendColour = trendDirection === "up" ? "#10b981" : trendDirection === "down" ? "#ef4444" : theme.textMuted;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "4px 0" }}>
      <div style={{ fontSize: "11px", fontWeight: 700, color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{metric}</div>
      <div style={{ fontSize: "28px", fontWeight: 800, color: theme.text, lineHeight: 1, letterSpacing: "-1px" }}>{value}</div>
      {unit && <div style={{ fontSize: "11px", color: theme.textMuted }}>{unit}</div>}
      {trend && (
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <TrendIcon style={{ width: "12px", height: "12px", color: trendColour }} />
          <span style={{ fontSize: "11px", fontWeight: 600, color: trendColour }}>{trend}</span>
        </div>
      )}
      {description && <div style={{ fontSize: "11px", color: theme.textSubtle }}>{description}</div>}
    </div>
  );
}

// ─────────────────────────────────────────
// RESOURCE LIBRARY WIDGET
// ─────────────────────────────────────────
export function ResourceLibraryWidget({ config, theme, hubKey }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const maxItems = config?.maxItems || 6;
  const resolvedHub = config?.hub_key || hubKey || "sales";

  useEffect(() => {
    const promise = resolvedHub === "sales"
      ? base44.entities.SalesEnablementItem.filter({ is_active: true }, "sort_order", maxItems)
      : base44.entities.HubContentItem.filter({ hub_key: resolvedHub, content_type: "enablement", is_active: true }, "sort_order", maxItems);
    promise
      .then(data => setItems(data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [resolvedHub, maxItems]);

  return (
    <WidgetShell title="Resources" icon={BookOpen} theme={theme}>
      {loading ? <Spinner theme={theme} /> : items.length === 0 ? (
        <EmptyMsg text="No resources available" theme={theme} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          {items.map(item => (
            <a key={item.id} href={item.file_url || item.url || "#"} target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", borderRadius: "8px", background: theme.surface, border: `1px solid ${theme.border}`, textDecoration: "none", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = theme.surfaceHover; }}
              onMouseLeave={e => { e.currentTarget.style.background = theme.surface; }}
            >
              <FileText style={{ width: "13px", height: "13px", color: theme.primary, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: theme.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</div>
                {item.content_type && <div style={{ fontSize: "10px", color: theme.textMuted }}>{item.content_type}</div>}
              </div>
              <ExternalLink style={{ width: "11px", height: "11px", color: theme.textSubtle, flexShrink: 0 }} />
            </a>
          ))}
        </div>
      )}
    </WidgetShell>
  );
}

// ─────────────────────────────────────────
// POWER BI / DASHBOARD EMBED WIDGET
// ─────────────────────────────────────────
export function EmbedWidget({ config, theme, type }) {
  const { embedUrl, title, height = 460, showHeader = true, embedType = "Custom iframe" } = config || {};

  return (
    <div style={{ borderRadius: "10px", overflow: "hidden", border: `1px solid ${theme.border}` }}>
      {showHeader && title && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", borderBottom: `1px solid ${theme.borderSubtle}` }}>
          {type === "powerbi_embed" ? <BarChart2 style={{ width: "14px", height: "14px", color: theme.primary }} /> : <Monitor style={{ width: "14px", height: "14px", color: theme.primary }} />}
          <span style={{ fontSize: "13px", fontWeight: 700, color: theme.text }}>{title}</span>
          {embedType && <span style={{ fontSize: "10px", color: theme.textSubtle, marginLeft: "auto", background: theme.surface, padding: "2px 6px", borderRadius: "4px" }}>{embedType}</span>}
        </div>
      )}
      {embedUrl ? (
        <iframe src={embedUrl} style={{ width: "100%", height: `${height}px`, border: "none", display: "block" }} title={title || "Dashboard"} allowFullScreen />
      ) : (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "160px", background: theme.surface }}>
          <div style={{ textAlign: "center" }}>
            <BarChart2 style={{ width: "28px", height: "28px", margin: "0 auto 8px", color: theme.textSubtle }} />
            <p style={{ fontSize: "12px", color: theme.textSubtle }}>No embed URL configured</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// AI ASSISTANT WIDGET
// ─────────────────────────────────────────
export function AiAssistantWidget({ config, theme }) {
  const { title = "AI Assistant", promptSuggestions = [] } = config || {};
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: theme.gradientStrong, border: `1px solid ${theme.borderStrong}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: theme.glow }}>
          <Sparkles style={{ width: "18px", height: "18px", color: "#ffffff" }} />
        </div>
        <div>
          <div style={{ fontSize: "13px", fontWeight: 700, color: theme.text }}>{title}</div>
          <div style={{ fontSize: "11px", color: theme.textMuted }}>Ask anything…</div>
        </div>
      </div>
      {promptSuggestions.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {promptSuggestions.slice(0, 3).map((p, i) => (
            <button key={i} style={{ textAlign: "left", padding: "7px 10px", borderRadius: "7px", background: theme.surface, border: `1px solid ${theme.border}`, fontSize: "11px", color: theme.text, cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = theme.surfaceHover}
              onMouseLeave={e => e.currentTarget.style.background = theme.surface}
            >
              {p}
            </button>
          ))}
        </div>
      )}
      <button style={{ width: "100%", padding: "8px", borderRadius: "8px", background: theme.buttonBg, color: theme.buttonText, border: "none", fontSize: "12px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", boxShadow: theme.glow }}>
        <Sparkles style={{ width: "13px", height: "13px" }} />
        Ask AI
      </button>
    </div>
  );
}

// ─────────────────────────────────────────
// TASKS WIDGET
// ─────────────────────────────────────────
export function TasksWidget({ config, theme }) {
  return (
    <WidgetShell title="Tasks" icon={CheckSquare} theme={theme}>
      <EmptyMsg text="Tasks coming soon — connect your task system" theme={theme} />
    </WidgetShell>
  );
}
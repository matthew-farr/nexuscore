import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Bell, CheckSquare, Calendar, AlertTriangle, MessageSquare, Wrench, Building2, Shield, ChevronRight } from "lucide-react";

// ---- Notifications ----
function OpsNotifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.HubContentItem
      .filter({ hub_key: "operations", content_type: "notification", is_active: true }, "-created_date", 5)
      .then(data => setItems(data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const typeColour = { Info: "#22d3ee", Warning: "#f59e0b", Success: "#10b981", Alert: "#ef4444", Update: "#7c3aed" };

  return (
    <div className="rounded-2xl p-4 mb-3"
      style={{ background: "linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="flex items-center gap-2 mb-3">
        <Bell className="w-4 h-4 text-pink-400" />
        <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Notifications</span>
        {items.length > 0 && (
          <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-pink-500/20 text-pink-400">{items.length}</span>
        )}
      </div>
      {loading ? (
        <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-12 rounded-xl bg-white/5 animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <p className="text-xs text-white/30 text-center py-3">No active notifications</p>
      ) : (
        <div className="space-y-2">
          {items.map((n, i) => {
            const col = typeColour[n.notification_type] || "#22d3ee";
            return (
              <div key={n.id || i} className="rounded-xl p-3 flex items-start gap-2.5"
                style={{ background: `${col}10`, border: `1px solid ${col}25` }}>
                <div className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0" style={{ background: col }} />
                <div>
                  <p className="text-xs font-semibold text-white/85 leading-tight">{n.title}</p>
                  {n.description && <p className="text-[10px] text-white/45 mt-0.5 leading-snug line-clamp-2">{n.description}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---- Today's Tasks ----
function OpsTodaysTasks() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  const TASK_ITEMS = [
    { key: "escalations", label: "Escalations due today", icon: AlertTriangle, colour: "#ec2ca3", route: "/operations/60-day-dbs-escalations" },
    { key: "cjsm", label: "CJSM responses waiting", icon: MessageSquare, colour: "#7c3aed", route: "/operations/60-day-dbs-escalations" },
    { key: "issues", label: "Open operational incidents", icon: Wrench, colour: "#f59e0b", route: "/operations/issue-log" },
    { key: "suppliers", label: "Supplier reviews due", icon: Building2, colour: "#10b981", route: "/operations/supplier-register" },
    { key: "compliance", label: "Compliance actions due", icon: Shield, colour: "#0ea5e9", route: "/knowledge" },
  ];

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const fetchAll = async () => {
      const results = {};
      await Promise.allSettled([
        base44.entities.DBSEscalation.filter({ status: "DUE TO BE ESCALATED" }, "", 200).then(d => { results.escalations = d?.length || 0; }),
        base44.entities.DBSQueryTracker.list("-date_received", 1000).then(data => {
          results.cjsm = (data || []).filter(q => {
            if (q.stage !== "Waiting on Client") return false;
            if (!q.date_sent_to_client) return false;
            return Math.floor((new Date() - new Date(q.date_sent_to_client)) / (1000 * 60 * 60 * 24)) >= 10;
          }).length;
        }),
        base44.entities.OperationsIssue.filter({ is_archived: false }, "", 200).then(d => { results.issues = (d || []).filter(x => x.status !== "Resolved").length; }),
      ]);
      results.suppliers = 0;
      results.compliance = 0;
      setCounts(results);
      setLoading(false);
    };
    fetchAll();
  }, []);

  return (
    <div className="rounded-2xl p-4 mb-3"
      style={{ background: "linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="flex items-center gap-2 mb-3">
        <CheckSquare className="w-4 h-4 text-emerald-400" />
        <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Today's Tasks</span>
      </div>
      {loading ? (
        <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="h-10 rounded-xl bg-white/5 animate-pulse" />)}</div>
      ) : (
        <div className="space-y-1.5">
          {TASK_ITEMS.map((task) => {
            const Icon = task.icon;
            const count = counts[task.key] ?? 0;
            return (
              <button key={task.key} onClick={() => navigate(task.route)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-left"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                onMouseEnter={e => { e.currentTarget.style.background = `${task.colour}12`; e.currentTarget.style.border = `1px solid ${task.colour}30`; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.border = "1px solid rgba(255,255,255,0.06)"; }}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: task.colour }} />
                <span className="flex-1 text-xs text-white/70">{task.label}</span>
                {count > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: `${task.colour}20`, color: task.colour }}>{count}</span>
                )}
                <ChevronRight className="w-3 h-3 text-white/20 flex-shrink-0" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---- Calendar ----
function OpsCalendarWidget() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date().toISOString();
    base44.entities.CalendarEvent
      .filter({ is_active: true }, "start_date", 5)
      .then(data => {
        const upcoming = (data || []).filter(e => e.start_date >= now).slice(0, 4);
        setEvents(upcoming);
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date();
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  return (
    <div className="rounded-2xl p-4 mb-3"
      style={{ background: "linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Calendar</span>
        </div>
        <button onClick={() => navigate("/calendar")} className="text-[10px] text-white/35 hover:text-white/60 transition-colors">View →</button>
      </div>

      {/* Today badge */}
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-3"
        style={{ background: "linear-gradient(135deg, rgba(34,211,238,0.15), rgba(34,211,238,0.05))", border: "1px solid rgba(34,211,238,0.25)" }}>
        <div className="text-center">
          <div className="text-[10px] text-cyan-400/70 font-semibold">{days[today.getDay()]}</div>
          <div className="text-xl font-black text-white leading-none">{today.getDate()}</div>
          <div className="text-[10px] text-cyan-400/70 font-semibold">{months[today.getMonth()]}</div>
        </div>
        <div>
          <p className="text-xs font-bold text-white">Today</p>
          <p className="text-[10px] text-white/45">{events.length > 0 ? `${events.length} upcoming event${events.length > 1 ? "s" : ""}` : "No upcoming events"}</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-10 rounded-xl bg-white/5 animate-pulse" />)}</div>
      ) : events.length > 0 ? (
        <div className="space-y-1.5">
          {events.map((evt, i) => {
            const d = new Date(evt.start_date);
            return (
              <div key={evt.id || i} className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="w-8 h-8 rounded-lg flex flex-col items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(34,211,238,0.12)", border: "1px solid rgba(34,211,238,0.20)" }}>
                  <span className="text-[9px] font-bold text-cyan-400">{months[d.getMonth()]}</span>
                  <span className="text-xs font-black text-white leading-none">{d.getDate()}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white/80 truncate">{evt.title}</p>
                  <p className="text-[10px] text-white/35">{d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

// ---- Main Sidebar ----
export default function OpsSidebar() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, delay: 0.15 }}
      className="w-full"
    >
      <OpsNotifications />
      <OpsTodaysTasks />
      <OpsCalendarWidget />
    </motion.div>
  );
}
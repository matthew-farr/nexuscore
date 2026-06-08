import { useState } from "react";
import { CheckCircle2, AlertTriangle, Clock, Building2, ExternalLink, Loader2, Inbox } from "lucide-react";
import { useTheme } from "../../ThemeProvider";

function formatDue(ts) {
  if (!ts) return null;
  const d = new Date(Number(ts));
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) +
    " " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function TaskRow({ task, colour, isDark }) {
  const p = task.properties || {};
  const subject = p.hs_task_subject || "Untitled task";
  const ts = p.hs_timestamp;

  return (
    <div className="flex items-start gap-3 py-2.5 border-b last:border-0"
      style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}>
      <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: colour }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-snug" style={{ color: isDark ? "#ffffff" : "#000000" }}>
          {subject}
        </p>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
          {task.company_name && (
            <span className="flex items-center gap-1 text-[11px]"
              style={{ color: isDark ? "rgba(255,255,255,0.60)" : "rgba(0,0,0,0.55)" }}>
              <Building2 className="w-3 h-3" />
              {task.company_name}
            </span>
          )}
          {task.owner_name && (
            <span className="text-[11px]"
              style={{ color: isDark ? "rgba(255,255,255,0.50)" : "rgba(0,0,0,0.45)" }}>
              {task.owner_name}
            </span>
          )}
          {ts && (
            <span className="flex items-center gap-1 text-[11px]"
              style={{ color: colour }}>
              <Clock className="w-3 h-3" />
              {formatDue(ts)}
            </span>
          )}
        </div>
      </div>
      {task.url && (
        <a href={task.url} target="_blank" rel="noreferrer"
          className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity"
          style={{ background: `${colour}18` }}>
          <ExternalLink className="w-3.5 h-3.5" style={{ color: colour }} />
        </a>
      )}
    </div>
  );
}

export default function TodaysWorkPanel({ tasksDueToday, tasksOverdue, loading, error, isDark }) {
  const [tab, setTab] = useState("today");

  const tabs = [
    { key: "today",   label: `Due Today (${tasksDueToday?.length ?? 0})`,  colour: "#f59e0b" },
    { key: "overdue", label: `Overdue (${tasksOverdue?.length ?? 0})`,      colour: "#ef4444" },
  ];

  const items = tab === "today" ? tasksDueToday : tasksOverdue;
  const colour = tabs.find(t => t.key === tab)?.colour || "#f59e0b";

  return (
    <div className="rounded-xl border overflow-hidden"
      style={{
        background: isDark
          ? "linear-gradient(135deg,rgba(255,255,255,0.04) 0%,rgba(255,255,255,0.01) 100%)"
          : "rgba(255,255,255,0.85)",
        border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.07)",
      }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-0">
        <h3 className="text-sm font-bold" style={{ color: isDark ? "#ffffff" : "#000000" }}>
          Today's Work
        </h3>
        <div className="flex gap-1">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors"
              style={{
                background: tab === t.key ? `${t.colour}20` : "transparent",
                color: tab === t.key ? t.colour : (isDark ? "rgba(255,255,255,0.50)" : "rgba(0,0,0,0.45)"),
                border: tab === t.key ? `1px solid ${t.colour}40` : "1px solid transparent",
              }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-2 pt-3">
        {loading ? (
          <div className="flex items-center gap-2 py-4">
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: colour }} />
            <span className="text-sm" style={{ color: isDark ? "#ffffff" : "#000000" }}>Loading tasks…</span>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 py-4">
            <AlertTriangle className="w-4 h-4" style={{ color: "#ef4444" }} />
            <span className="text-sm" style={{ color: isDark ? "#ffffff" : "#000000" }}>Unable to load tasks</span>
          </div>
        ) : !items?.length ? (
          <div className="flex flex-col items-center py-6 gap-1.5">
            <Inbox className="w-8 h-8 opacity-20" style={{ color: isDark ? "#ffffff" : "#000000" }} />
            <p className="text-sm font-semibold" style={{ color: isDark ? "#ffffff" : "#000000" }}>
              {tab === "today" ? "No tasks due today" : "No overdue tasks"}
            </p>
          </div>
        ) : (
          <div>
            {items.map(task => (
              <TaskRow key={task.id} task={task} colour={colour} isDark={isDark} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
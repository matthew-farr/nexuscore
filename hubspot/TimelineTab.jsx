import { useState, useEffect, useCallback, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import {
  Loader2, AlertCircle, Inbox, RefreshCw,
  FileText, Phone, CheckSquare, Square, Tag, Ticket, Search, X
} from "lucide-react";
import { cleanHubSpotText, useHubSpotOwners, resolveOwner } from "@/lib/hubspotUtils";

// ─── Config ───────────────────────────────────────────────────────────────────

const ACTIVITY_CONFIG = {
  note:           { label: "Note",            icon: FileText,    gradient: "from-amber-400 to-orange-400",   badge: "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",   dot: "bg-amber-400" },
  call:           { label: "Call",            icon: Phone,       gradient: "from-blue-400 to-indigo-500",    badge: "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",         dot: "bg-blue-400" },
  task_created:   { label: "Task Created",    icon: Square,      gradient: "from-violet-400 to-purple-500",  badge: "bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800", dot: "bg-violet-400" },
  task_completed: { label: "Task Completed",  icon: CheckSquare, gradient: "from-green-400 to-emerald-500",  badge: "bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800",   dot: "bg-green-400" },
  ticket_created: { label: "Ticket Created",  icon: Ticket,      gradient: "from-rose-400 to-pink-500",      badge: "bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",         dot: "bg-rose-400" },
  ticket_updated: { label: "Ticket Updated",  icon: Tag,         gradient: "from-slate-400 to-slate-500",    badge: "bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700",   dot: "bg-slate-400" },
};

const FILTER_TABS = [
  { key: "all",     label: "All" },
  { key: "note",    label: "Notes" },
  { key: "call",    label: "Calls" },
  { key: "task",    label: "Tasks" },
  { key: "ticket",  label: "Tickets" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateTime(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function getDateGroup(dateStr) {
  if (!dateStr) return "Older";
  const d = new Date(dateStr);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday - 86400000);
  const startOf7Days = new Date(startOfToday - 6 * 86400000);
  if (d >= startOfToday) return "Today";
  if (d >= startOfYesterday) return "Yesterday";
  if (d >= startOf7Days) return "Last 7 Days";
  return "Older";
}

const GROUP_ORDER = ["Today", "Yesterday", "Last 7 Days", "Older"];

// ─── Activity Card ────────────────────────────────────────────────────────────

function ActivityCard({ item, ownerMap }) {
  const cfg = ACTIVITY_CONFIG[item.activityType] || ACTIVITY_CONFIG.note;
  const Icon = cfg.icon;
  const cleanDescription = cleanHubSpotText(item.description);
  const ownerName = item.ownerId ? resolveOwner(item.ownerId, ownerMap) : null;

  return (
    <div className="flex gap-3">
      {/* Timeline spine + icon */}
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${cfg.gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
          <Icon className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="w-px flex-1 bg-border mt-1" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-4">
        <div className="rounded-xl border border-border bg-card p-3 hover:shadow-sm transition-shadow">
          {/* Header */}
          <div className="flex items-start gap-2 mb-1">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground leading-snug">{cleanHubSpotText(item.title)}</p>
            </div>
            <span className={`flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${cfg.badge}`}>
              {cfg.label}
            </span>
          </div>

          {/* Description */}
          {cleanDescription && (
            <p className="text-xs text-foreground leading-relaxed line-clamp-3 mb-2 whitespace-pre-wrap">{cleanDescription}</p>
          )}

          {/* Meta row */}
          <div className="flex items-center justify-between gap-2 mt-1">
            <div className="flex items-center gap-2 text-[11px] text-foreground">
              <span>{formatDateTime(item.date)}</span>
              {ownerName && <span>· Owner: {ownerName}</span>}
            </div>
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-primary hover:underline flex-shrink-0"
              >
                View →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Date Group Header ────────────────────────────────────────────────────────

function DateGroupHeader({ label, count }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-xs font-bold text-foreground">{label}</span>
      <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">{count}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────

export default function TimelineTab({ company, portalId }) {
  const [activities,    setActivities]    = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [activeFilter,  setActiveFilter]  = useState("all");
  const [search,        setSearch]        = useState("");
  const ownerMap                          = useHubSpotOwners();

  const loadTimeline = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("getHubSpotCompanyTimeline", {
        companyId: company.id,
        portalId,
      });
      const d = res.data || {};
      if (d.error) setError(d.error);
      else { setActivities(d.activities || []); setLastRefreshed(new Date()); }
    } catch (e) {
      setError("Failed to load timeline.");
    }
    setLoading(false);
  }, [company.id, portalId]);

  useEffect(() => { loadTimeline(); }, [loadTimeline]);

  const filtered = useMemo(() => {
    if (!activities) return [];
    let items = activities;

    // Filter by type
    if (activeFilter !== "all") {
      items = items.filter(a => a.activityType.startsWith(activeFilter));
    }

    // Search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter(a =>
        a.title?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q)
      );
    }

    return items;
  }, [activities, activeFilter, search]);

  // Group by date
  const grouped = useMemo(() => {
    const groups = {};
    for (const item of filtered) {
      const g = getDateGroup(item.date);
      if (!groups[g]) groups[g] = [];
      groups[g].push(item);
    }
    return groups;
  }, [filtered]);

  const totalCount = activities?.length || 0;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="p-4 space-y-3 border-b border-border flex-shrink-0">
        {/* Search + Refresh */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search activity…"
              className="w-full text-xs pl-8 pr-7 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/50"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {lastRefreshed && (
              <span className="text-[10px] text-foreground hidden lg:block">
                {formatDateTime(lastRefreshed)}
              </span>
            )}
            <button
              onClick={loadTimeline}
              disabled={loading}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {FILTER_TABS.map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-colors border ${
                activeFilter === f.key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground border-border hover:text-foreground hover:border-muted-foreground/40"
              }`}
            >
              {f.label}
            </button>
          ))}
          {totalCount > 0 && (
            <span className="ml-auto flex-shrink-0 self-center text-[11px] text-foreground">
              {filtered.length} of {totalCount}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm text-foreground">Loading timeline…</span>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <AlertCircle className="w-7 h-7 text-destructive" />
            <p className="text-sm font-semibold text-destructive">{error}</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Inbox className="w-10 h-10 text-muted-foreground/40" />
            <p className="text-sm font-semibold text-foreground">
              {activities?.length === 0 ? "No activity yet" : "No matching activity"}
            </p>
            <p className="text-xs text-foreground/70">
              {activities?.length === 0
                ? "Activity from notes, calls, tasks and tickets will appear here"
                : "Try adjusting your search or filter"}
            </p>
          </div>
        )}

        {/* Grouped timeline */}
        {!loading && !error && filtered.length > 0 && (
          <div>
            {GROUP_ORDER.filter(g => grouped[g]?.length > 0).map(group => (
              <div key={group} className="mb-2">
                <DateGroupHeader label={group} count={grouped[group].length} />
                {grouped[group].map((item, idx) => (
                  <div key={item.id} className={idx === grouped[group].length - 1 ? "[&_.flex-col>div.w-px]:hidden" : ""}>
                    <ActivityCard item={item} ownerMap={ownerMap} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
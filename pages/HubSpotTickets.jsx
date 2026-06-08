import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { RefreshCw, Loader2, AlertCircle, Search, Ticket, ClipboardList, Inbox, Users } from "lucide-react";
import TicketDrawer from "@/components/hubspot/TicketDrawer";

// ─── Pipeline definitions ─────────────────────────────────────────────────────

export const PIPELINES = [
  { id: "0",          label: "Admin Tickets",       colour: "#f97316", icon: Ticket,        param: "admin" },
  { id: "3233773772", label: "Bespoke Checks",       colour: "#7c3aed", icon: ClipboardList, param: "bespoke" },
  { id: "3353771245", label: "Client / Applicant Raised Tickets", colour: "#0ea5e9", icon: Users, param: "self-raised" },
];

// ─── Stage → status mapping (exact HubSpot stage IDs) ────────────────────────

const STAGE_MAP = {
  // Admin Tickets (pipeline: "0")
  "1":          "needs_action",    // New
  "2143751371": "in_progress",     // In Progress
  "2":          "waiting_client",  // More information from ACM needed
  "4":          "completed",       // Closed

  // Bespoke Checks (pipeline: "3233773772")
  "4431881405": "needs_action",    // Client Paid - Awaiting Admin Action
  "4484845807": "in_progress",     // Submitted & In-Progress (ADMIN)
  "4485398723": "waiting_client",  // ACM Input needed
  "4570395877": "completed",       // Ticket Completed
  "4484845812": "completed",       // Closed – Declined
  "4918082801": "completed",       // Archived

  // Self Raised Tickets (pipeline: "3353771245")
  "4731583695": "needs_action",    // New Applicant Ticket
  "4595029220": "needs_action",    // Assign company & Ticket Owner (Client only)
  "4595029222": "in_progress",     // In Progress
  "4731583696": "waiting_client",  // On Hold
  "4595054839": "completed",       // Resolved (treat as completed despite HubSpot OPEN state)
  "4595029223": "completed",       // Closed
};

// ─── Status config ────────────────────────────────────────────────────────────

export const STATUS_CONFIG = {
  needs_action:     { label: "Needs Action",       bg: "bg-red-50 dark:bg-red-950/50",     text: "text-red-700 dark:text-red-400",     border: "border-red-200 dark:border-red-800",     accent: "#ef4444" },
  waiting_client:   { label: "Waiting — Client",   bg: "bg-amber-50 dark:bg-amber-950/50", text: "text-amber-700 dark:text-amber-400", border: "border-amber-200 dark:border-amber-800", accent: "#f59e0b" },
  waiting_supplier: { label: "Waiting — Supplier", bg: "bg-blue-50 dark:bg-blue-950/50",   text: "text-blue-700 dark:text-blue-400",   border: "border-blue-200 dark:border-blue-800",   accent: "#3b82f6" },
  in_progress:      { label: "In Progress",        bg: "bg-purple-50 dark:bg-purple-950/50", text: "text-purple-700 dark:text-purple-400", border: "border-purple-200 dark:border-purple-800", accent: "#7c3aed" },
  completed:        { label: "Completed",          bg: "bg-green-50 dark:bg-green-950/50", text: "text-green-700 dark:text-green-400", border: "border-green-200 dark:border-green-800",  accent: "#10b981" },
};

const PRIORITY_CONFIG = {
  HIGH:   { label: "High Priority",  classes: "text-red-600 dark:text-red-400",     dot: "bg-red-500" },
  MEDIUM: { label: "Med Priority",   classes: "text-amber-600 dark:text-amber-400", dot: "bg-amber-400" },
  LOW:    { label: "Low Priority",   classes: "text-slate-500 dark:text-slate-400", dot: "bg-slate-400" },
};

// Sort weight — lower = shown first
const STATUS_SORT_ORDER = {
  needs_action:     0,
  waiting_client:   2,
  in_progress:      3,
  waiting_supplier: 4,
  completed:        5,
};

const QUICK_FILTERS = [
  { id: "all",              label: "All" },
  { id: "my_tickets",       label: "My Tickets" },
  { id: "needs_action",     label: "Needs Action" },
  { id: "waiting_client",   label: "Waiting Client" },
  { id: "waiting_supplier", label: "Waiting Supplier" },
  { id: "in_progress",      label: "In Progress" },
  { id: "overdue",          label: "Overdue" },
  { id: "recently_updated", label: "Recently Updated" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function classifyStage(stageId = "") {
  return STAGE_MAP[stageId] || "in_progress";
}

export function daysOpen(dateStr) {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function isOverdue(ticket) {
  const d = daysOpen(ticket.properties?.createdate);
  return d !== null && d >= 15;
}

function isRecentlyUpdated(ticket) {
  const d = ticket.properties?.hs_lastmodifieddate;
  if (!d) return false;
  return Math.floor((Date.now() - new Date(d).getTime()) / 86400000) <= 2;
}

function sortTickets(tickets) {
  return [...tickets].sort((a, b) => {
    const aStatus = classifyStage(a.properties?.hs_pipeline_stage);
    const bStatus = classifyStage(b.properties?.hs_pipeline_stage);
    const aOrder = STATUS_SORT_ORDER[aStatus] ?? 9;
    const bOrder = STATUS_SORT_ORDER[bStatus] ?? 9;
    if (aOrder !== bOrder) return aOrder - bOrder;
    // Within same status: overdue first, then oldest first
    const aDays = daysOpen(a.properties?.createdate) || 0;
    const bDays = daysOpen(b.properties?.createdate) || 0;
    return bDays - aDays;
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ stageId }) {
  const status = classifyStage(stageId);
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.in_progress;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cfg.accent }} />
      {cfg.label}
    </span>
  );
}

function AgeIndicator({ days }) {
  if (days === null) return null;
  const colour = days >= 15
    ? "text-red-600 dark:text-red-400"
    : days >= 8
    ? "text-amber-600 dark:text-amber-400"
    : "text-green-600 dark:text-green-500";
  return (
    <span className={`text-xs font-medium ${colour}`}>
      {days >= 15 && "⚠ "}{days}d open
    </span>
  );
}

function TicketCard({ ticket, onClick }) {
  const p         = ticket.properties || {};
  const subject   = p.subject || p.content || "Untitled";
  const stageId   = p.hs_pipeline_stage || "";
  const stageLabel = p.hs_pipeline_stage_label || stageId;
  const priority  = p.hs_ticket_priority?.toUpperCase() || null;
  const owner     = p.owner_name || null;
  const company   = p.company_name || null;
  const candidate = [p.candidate_firstname, p.candidate_lastname].filter(Boolean).join(" ") || null;
  const created   = formatDate(p.createdate);
  const updated   = formatDate(p.hs_lastmodifieddate);
  const days      = daysOpen(p.createdate);
  const status    = classifyStage(stageId);
  const cfg       = STATUS_CONFIG[status] || STATUS_CONFIG.in_progress;
  const priCfg    = PRIORITY_CONFIG[priority];
  const overdue   = days !== null && days >= 15;

  return (
    <div
      onClick={onClick}
      className={`group bg-card border rounded-xl cursor-pointer transition-all hover:shadow-md overflow-hidden ${
        overdue ? "border-red-200 dark:border-red-900" : "border-border hover:border-primary/40"
      }`}
    >
      <div className="flex">
        <div className="w-1 flex-shrink-0" style={{ backgroundColor: cfg.accent }} />
        <div className="flex-1 min-w-0 px-5 py-4">
          {/* Title + priority */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <h3 className="text-base font-semibold text-foreground leading-snug">{subject}</h3>
            {priCfg && (
              <span className={`flex-shrink-0 flex items-center gap-1 text-xs font-medium ${priCfg.classes} mt-0.5`}>
                <span className={`w-1.5 h-1.5 rounded-full ${priCfg.dot}`} />
                {priCfg.label}
              </span>
            )}
          </div>

          {/* People */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-1 gap-x-6 mb-4">
            {candidate && (
              <div>
                <span className="block text-[11px] text-muted-foreground uppercase tracking-wide font-medium">Candidate</span>
                <span className="text-sm font-semibold text-foreground">{candidate}</span>
              </div>
            )}
            {company && (
              <div>
                <span className="block text-[11px] text-muted-foreground uppercase tracking-wide font-medium">Company</span>
                <span className="text-sm font-semibold text-foreground">{company}</span>
              </div>
            )}
            {owner && (
              <div>
                <span className="block text-[11px] text-muted-foreground uppercase tracking-wide font-medium">Owner</span>
                <span className="text-sm text-foreground">{owner}</span>
              </div>
            )}
          </div>

          {/* Status + dates */}
          <div className="flex items-center flex-wrap gap-x-4 gap-y-2">
            <StatusBadge stageId={stageId} />
            <div className="flex items-center gap-4 ml-auto text-xs text-muted-foreground">
              {created && <span>Created {created}</span>}
              {updated && updated !== created && <span>Updated {updated}</span>}
              <AgeIndicator days={days} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryBar({ tickets, stats, loading }) {
  const needsAction = useMemo(() =>
    tickets.filter(t => classifyStage(t.properties?.hs_pipeline_stage) === "needs_action").length,
    [tickets]);

  const overdueCount = useMemo(() => tickets.filter(isOverdue).length, [tickets]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[1,2,3,4].map(i => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}
      </div>
    );
  }

  const items = [
    { label: "Needs Action",     value: needsAction,              urgent: needsAction > 0, pulse: needsAction > 0 },
    { label: "Open Tickets",     value: tickets.length },
    { label: "Closed This Week", value: stats.closedThisWeek ?? "—" },
    { label: "Overdue",          value: overdueCount,             warn: overdueCount > 0 },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
      {items.map(item => (
        <div key={item.label} className={`relative bg-card border rounded-xl px-4 py-3 overflow-hidden ${
          item.urgent ? "border-red-300 dark:border-red-700" :
          item.warn   ? "border-amber-300 dark:border-amber-700" :
          "border-border"
        }`}>
          {item.pulse && (
            <span className="absolute top-2.5 right-2.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
          )}
          <p className={`text-2xl font-bold ${item.urgent ? "text-red-600 dark:text-red-400" : item.warn ? "text-amber-600 dark:text-amber-400" : "text-foreground"}`}>
            {item.value}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HubSpotTickets() {
  const urlParams       = new URLSearchParams(window.location.search);
  const initialPipeline = PIPELINES.find(p => p.param === urlParams.get("pipeline"))?.id || PIPELINES[0].id;

  const [activePipeline, setActivePipeline] = useState(initialPipeline);
  const [tickets, setTickets]               = useState([]);
  const [stats, setStats]                   = useState({});
  const [portalId, setPortalId]             = useState(null);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState(null);
  const [searchQuery, setSearchQuery]       = useState("");
  const [activeFilter, setActiveFilter]     = useState("all");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [currentUser, setCurrentUser]       = useState(null);
  // Per-pipeline ticket counts for tab badges
  const [pipelineCounts, setPipelineCounts] = useState({});

  const pipeline = PIPELINES.find(p => p.id === activePipeline);

  useEffect(() => {
    base44.auth.me().then(u => setCurrentUser(u)).catch(() => {});
  }, []);

  // Fetch all pipeline counts for tab badges on mount
  useEffect(() => {
    Promise.allSettled(
      PIPELINES.map(p =>
        base44.functions.invoke("getHubSpotTicketsList", { pipelineId: p.id })
          .then(res => ({ id: p.id, count: (res.data?.tickets || []).length }))
          .catch(() => ({ id: p.id, count: null }))
      )
    ).then(results => {
      const counts = {};
      results.forEach(r => { if (r.status === "fulfilled") counts[r.value.id] = r.value.count; });
      setPipelineCounts(counts);
    });
  }, []);

  const filteredTickets = useMemo(() => {
    let list = tickets;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(t => {
        const p = t.properties || {};
        return (
          (p.subject || "").toLowerCase().includes(q) ||
          (p.content || "").toLowerCase().includes(q) ||
          (p.candidate_firstname || "").toLowerCase().includes(q) ||
          (p.candidate_lastname || "").toLowerCase().includes(q) ||
          (p.company_name || "").toLowerCase().includes(q) ||
          (p.owner_name || "").toLowerCase().includes(q) ||
          t.id.includes(q)
        );
      });
    }

    if (activeFilter === "my_tickets") {
      const name = currentUser?.full_name?.toLowerCase();
      list = list.filter(t => name && (t.properties?.owner_name || "").toLowerCase().includes(name));
    } else if (activeFilter === "overdue") {
      list = list.filter(isOverdue);
    } else if (activeFilter === "recently_updated") {
      list = [...list].sort((a, b) =>
        new Date(b.properties?.hs_lastmodifieddate || 0) - new Date(a.properties?.hs_lastmodifieddate || 0)
      );
    } else if (activeFilter !== "all") {
      list = list.filter(t => classifyStage(t.properties?.hs_pipeline_stage) === activeFilter);
    }

    // Apply priority sort for all filters except recently_updated
    if (activeFilter !== "recently_updated") {
      list = sortTickets(list);
    }

    return list;
  }, [tickets, searchQuery, activeFilter, currentUser]);

  const fetchTickets = async (pipelineId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("getHubSpotTicketsList", { pipelineId });
      const d = res.data || {};
      setTickets(d.tickets || []);
      setPortalId(d.portalId || null);
      setStats({ closedThisWeek: d.closedThisWeek || 0 });
      // Update tab badge count for this pipeline
      setPipelineCounts(prev => ({ ...prev, [pipelineId]: (d.tickets || []).length }));
    } catch (e) {
      setError(e.message);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(activePipeline); }, [activePipeline]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-6">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">HubSpot Tickets</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage operational tickets and workloads</p>
          </div>
          <button
            onClick={() => fetchTickets(activePipeline)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Pipeline Selector */}
        <div className="flex bg-muted/70 border border-border rounded-xl p-1 mb-6 w-fit flex-wrap gap-1">
          {PIPELINES.map(p => {
            const Icon = p.icon;
            const active = activePipeline === p.id;
            const count = pipelineCounts[p.id];
            return (
              <button
                key={p.id}
                onClick={() => { setActivePipeline(p.id); setActiveFilter("all"); setSearchQuery(""); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  active
                    ? "bg-card text-foreground shadow-sm border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-3.5 h-3.5" style={active ? { color: p.colour } : {}} />
                {p.label}
                {count !== null && count !== undefined && (
                  <span
                    className="ml-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold"
                    style={{
                      backgroundColor: active ? p.colour + "20" : "rgba(0,0,0,0.06)",
                      color: active ? p.colour : "inherit"
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* KPI Summary Bar */}
        <SummaryBar tickets={tickets} stats={stats} loading={loading} />

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search by ticket, candidate, company or owner..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/50 transition-all"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {QUICK_FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                activeFilter === f.id
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-foreground/25"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Ticket Queue */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-sm">Loading tickets…</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <AlertCircle className="w-8 h-8 text-destructive" />
            <span className="text-sm text-destructive">{error}</span>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
            <Inbox className="w-12 h-12 opacity-20" />
            <p className="text-sm font-semibold">No Tickets Found</p>
            <p className="text-xs opacity-60">
              {searchQuery || activeFilter !== "all" ? "Try adjusting your search or filter" : "No open tickets in this pipeline"}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-foreground">
                {filteredTickets.length} Ticket{filteredTickets.length !== 1 ? "s" : ""}
                {activeFilter !== "all" && ` · ${QUICK_FILTERS.find(f => f.id === activeFilter)?.label}`}
              </p>
              {(searchQuery || activeFilter !== "all") && tickets.length !== filteredTickets.length && (
                <p className="text-xs text-muted-foreground">{tickets.length} total</p>
              )}
            </div>
            <div className="space-y-2">
              {filteredTickets.map(ticket => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onClick={() => setSelectedTicket(ticket)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {selectedTicket && (
        <TicketDrawer
          ticket={selectedTicket}
          pipeline={pipeline}
          portalId={portalId}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
}
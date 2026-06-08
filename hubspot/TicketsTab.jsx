import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import {
  Loader2, AlertCircle, Inbox, ExternalLink, RefreshCw,
  Clock, User, Tag, Layers, Flag
} from "lucide-react";
import { cleanHubSpotText, useHubSpotOwners, resolveOwner } from "@/lib/hubspotUtils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatTime(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

const PRIORITY_CONFIG = {
  HIGH:   { label: "High",   colour: "text-red-500" },
  MEDIUM: { label: "Medium", colour: "text-amber-500" },
  LOW:    { label: "Low",    colour: "text-blue-400" },
};

// ─── Ticket Card ──────────────────────────────────────────────────────────────

function TicketCard({ ticket, ownerMap }) {
  const isOpen = ticket.isOpen;
  const priCfg = PRIORITY_CONFIG[ticket.priority?.toUpperCase()] || null;
  const cleanNotes = cleanHubSpotText(ticket.notes);
  const ownerName = ticket.ownerId ? resolveOwner(ticket.ownerId, ownerMap) : null;

  return (
    <div className={`rounded-xl border bg-card overflow-hidden ${isOpen ? "border-border" : "border-border opacity-70"}`}>
      <div className={`h-0.5 w-full ${isOpen ? "bg-gradient-to-r from-rose-500 to-pink-500" : "bg-gradient-to-r from-green-400 to-emerald-400"}`} />
      <div className="p-4">
        {/* Subject + status badge */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="text-sm font-bold text-foreground leading-snug flex-1 min-w-0">{ticket.subject}</p>
          {ticket.stage && (
            <span className={`flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
              isOpen
                ? "bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                : "bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
            }`}>
              {ticket.stage}
            </span>
          )}
        </div>

        {/* Notes snippet */}
        {cleanNotes && (
          <p className="text-xs text-foreground leading-relaxed line-clamp-2 mb-2">{cleanNotes}</p>
        )}

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-foreground">
          {ticket.pipeline && (
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3" />
              {ticket.pipeline}
            </span>
          )}
          {priCfg && (
            <span className={`flex items-center gap-1 ${priCfg.colour}`}>
              <Flag className="w-3 h-3" />
              {priCfg.label}
            </span>
          )}
          {ownerName && (
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              Owner: {ownerName}
            </span>
          )}
          {ticket.createdDate && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Created {formatDate(ticket.createdDate)}
            </span>
          )}
          {ticket.lastModifiedDate && (
            <span className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              Updated {formatDate(ticket.lastModifiedDate)}
            </span>
          )}
          {ticket.url && (
            <a
              href={ticket.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-primary hover:underline ml-auto"
            >
              <ExternalLink className="w-3 h-3" />
              HubSpot
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────

export default function TicketsTab({ company, portalId }) {
  const [tickets,      setTickets]      = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const ownerMap                         = useHubSpotOwners();

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("getHubSpotCompanyTickets", {
        companyId: company.id,
        portalId,
      });
      const d = res.data || {};
      if (d.error) setError(d.error);
      else { setTickets(d.tickets || []); setLastRefreshed(new Date()); }
    } catch (e) {
      setError("Failed to load tickets.");
    }
    setLoading(false);
  }, [company.id, portalId]);

  useEffect(() => { loadTickets(); }, [loadTickets]);

  const openTickets = (tickets || []).filter(t => t.isOpen);
  const closedTickets = (tickets || []).filter(t => !t.isOpen);

  return (
    <div className="p-4 space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-end gap-2">
        {lastRefreshed && (
          <span className="text-[11px] text-foreground hidden sm:block">
            Refreshed {formatTime(lastRefreshed)}
          </span>
        )}
        <button
          onClick={loadTickets}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm text-foreground">Loading tickets…</span>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <AlertCircle className="w-7 h-7 text-destructive" />
          <p className="text-sm font-semibold text-destructive">{error}</p>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && tickets && tickets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Inbox className="w-10 h-10 text-muted-foreground/40" />
          <p className="text-sm font-semibold text-foreground">No tickets found</p>
          <p className="text-xs text-foreground/70">This company has no associated tickets in HubSpot</p>
        </div>
      )}

      {/* Open tickets */}
      {!loading && !error && openTickets.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
            {openTickets.length} Open Ticket{openTickets.length !== 1 ? "s" : ""}
          </p>
          {openTickets.map(t => <TicketCard key={t.id} ticket={t} ownerMap={ownerMap} />)}
        </div>
      )}

      {/* Closed tickets */}
      {!loading && !error && closedTickets.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
            {closedTickets.length} Closed Ticket{closedTickets.length !== 1 ? "s" : ""}
          </p>
          {closedTickets.map(t => <TicketCard key={t.id} ticket={t} ownerMap={ownerMap} />)}
        </div>
      )}
    </div>
  );
}
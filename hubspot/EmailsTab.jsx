import { useState, useEffect, useCallback, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { cleanHubSpotText } from "@/lib/hubspotUtils";
import {
  Loader2, AlertCircle, Inbox, RefreshCw, Search, X,
  Mail, ArrowUpRight, ArrowDownLeft, ExternalLink, ShieldAlert, Clock
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatDateShort(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  if (diffDays < 7)  return d.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" });
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// ─── Email Card ───────────────────────────────────────────────────────────────

function EmailCard({ email }) {
  const [expanded, setExpanded] = useState(false);
  const isOutbound = email.direction === "OUTBOUND" || !email.direction;
  const DirIcon = isOutbound ? ArrowUpRight : ArrowDownLeft;
  const dirColour = isOutbound
    ? "text-blue-600 dark:text-blue-400"
    : "text-green-600 dark:text-green-400";
  const dirLabel = isOutbound ? "Sent" : "Received";
  // bodyPreview is already stripped server-side, but run through cleaner for safety
  const cleanPreview = cleanHubSpotText(email.bodyPreview);
  const cleanSubject = cleanHubSpotText(email.subject);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden hover:shadow-sm transition-shadow">
      <div className="h-0.5 w-full bg-gradient-to-r from-indigo-400 to-violet-500" />
      <div className="p-3">
        {/* Header row */}
        <div className="flex items-start gap-2 mb-1.5">
          <div className={`flex-shrink-0 mt-0.5 ${dirColour}`}>
            <DirIcon className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <button
              onClick={() => setExpanded(v => !v)}
              className="text-left w-full"
            >
              <p className="text-xs font-bold text-foreground leading-snug truncate">
                {cleanSubject}
              </p>
            </button>
          </div>
          <span className="flex-shrink-0 text-[10px] text-foreground whitespace-nowrap">
            {formatDateShort(email.createdDate)}
          </span>
        </div>

        {/* From / To */}
        <div className="pl-5 mb-1.5 space-y-0.5">
          {email.from && (
            <p className="text-[11px] text-foreground truncate">
              <span className="font-semibold">From:</span> {email.from}
            </p>
          )}
          {email.to && (
            <p className="text-[11px] text-foreground truncate">
              <span className="font-semibold">To:</span> {email.to}
            </p>
          )}
          {email.cc && (
            <p className="text-[11px] text-foreground truncate">
              <span className="font-semibold">CC:</span> {email.cc}
            </p>
          )}
        </div>

        {/* Body preview */}
        {cleanPreview && (
          <p className={`pl-5 text-[11px] text-foreground leading-relaxed ${expanded ? "" : "line-clamp-2"}`}>
            {cleanPreview}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 mt-2 pl-5">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-semibold ${dirColour}`}>{dirLabel}</span>
            {cleanPreview && cleanPreview.length > 120 && (
              <button
                onClick={() => setExpanded(v => !v)}
                className="text-[10px] text-primary hover:underline"
              >
                {expanded ? "Show less" : "Show more"}
              </button>
            )}
          </div>
          {email.hubspotUrl && (
            <a
              href={email.hubspotUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-[10px] text-primary hover:underline flex-shrink-0"
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

// ─── Permission Error State ───────────────────────────────────────────────────

function PermissionError({ company, portalId, user }) {
  const companyUrl = portalId
    ? `https://app.hubspot.com/contacts/${portalId}/company/${company.id}`
    : null;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 gap-4 text-center">
      <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center">
        <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-400" />
      </div>
      <div>
        <p className="text-sm font-bold text-foreground mb-1">
          Email history unavailable
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
          Email history is not available with the current HubSpot connection.
        </p>
      </div>
      {user?.role === "admin" && (
        <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-4 py-2.5 text-left max-w-xs">
          <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400 mb-0.5">Admin Diagnostic</p>
          <p className="text-[11px] text-amber-600 dark:text-amber-300">
            Missing HubSpot scope likely: <code className="font-mono font-bold">sales-email-read</code>
          </p>
        </div>
      )}
      {companyUrl && (
        <a
          href={companyUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Open Company in HubSpot
        </a>
      )}
    </div>
  );
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────

export default function EmailsTab({ company, portalId }) {
  const [emails,         setEmails]         = useState(null);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState(null);
  const [permissionError,setPermissionError]= useState(false);
  const [lastRefreshed,  setLastRefreshed]  = useState(null);
  const [search,         setSearch]         = useState("");
  const [user,           setUser]           = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPermissionError(false);
    try {
      const res = await base44.functions.invoke("getHubSpotCompanyEmails", {
        companyId: company.id,
        portalId,
      });
      const d = res.data || {};
      if (d.permissionError) {
        setPermissionError(true);
      } else if (d.error) {
        setError("Failed to load emails. Please try again.");
      } else {
        setEmails(d.emails || []);
        setLastRefreshed(new Date());
      }
    } catch (e) {
      setError("Failed to load emails. Please try again.");
    }
    setLoading(false);
  }, [company.id, portalId]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    if (!emails) return [];
    if (!search.trim()) return emails;
    const q = search.trim().toLowerCase();
    return emails.filter(e =>
      e.subject?.toLowerCase().includes(q) ||
      e.from?.toLowerCase().includes(q) ||
      e.to?.toLowerCase().includes(q) ||
      e.bodyPreview?.toLowerCase().includes(q)
    );
  }, [emails, search]);

  // ── Permission error ──────────────────────────────────────────────────────
  if (!loading && permissionError) {
    return <PermissionError company={company} portalId={portalId} user={user} />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="p-4 space-y-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search subject, sender, body…"
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
              <span className="text-[10px] text-foreground hidden lg:flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {lastRefreshed.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            <button
              onClick={load}
              disabled={loading}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm text-foreground">Loading emails…</span>
          </div>
        )}

        {/* Generic error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <AlertCircle className="w-7 h-7 text-destructive" />
            <p className="text-sm font-semibold text-destructive">{error}</p>
            <button onClick={load} className="text-xs text-primary hover:underline">Try again</button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && emails && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Inbox className="w-10 h-10 text-muted-foreground/40" />
            <p className="text-sm font-semibold text-foreground">
              {emails.length === 0 ? "No emails found" : "No matching emails"}
            </p>
            <p className="text-xs text-foreground/70">
              {emails.length === 0
                ? "No email engagements are logged for this company in HubSpot"
                : "Try adjusting your search"}
            </p>
          </div>
        )}

        {/* Email list */}
        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Mail className="w-3 h-3" />
              {filtered.length} Email{filtered.length !== 1 ? "s" : ""}
              {search && emails && ` (of ${emails.length})`}
            </p>
            {filtered.map(email => (
              <EmailCard key={email.emailId} email={email} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
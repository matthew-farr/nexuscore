import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import {
  Loader2, AlertCircle, Inbox, Plus, ExternalLink,
  Clock, User, Phone, ArrowUpRight, ArrowDownLeft, CheckCircle2, CalendarDays
} from "lucide-react";
import { cleanHubSpotText, useHubSpotOwners, resolveOwner } from "@/lib/hubspotUtils";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDateTime(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatDateInput(dateStr) {
  // Returns YYYY-MM-DD for <input type="date">
  if (!dateStr) return "";
  return dateStr.slice(0, 10);
}

function localDatetimeNow() {
  const now = new Date();
  const pad = n => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

const DIRECTION_CONFIG = {
  OUTBOUND: { label: "Outbound", icon: ArrowUpRight, colour: "text-blue-600 dark:text-blue-400" },
  INBOUND:  { label: "Inbound",  icon: ArrowDownLeft, colour: "text-green-600 dark:text-green-400" },
};

const OUTCOMES = [
  { value: "CONNECTED",      label: "Connected" },
  { value: "NO_ANSWER",      label: "No Answer" },
  { value: "LEFT_VOICEMAIL", label: "Left Voicemail" },
  { value: "BUSY",           label: "Busy" },
  { value: "WRONG_NUMBER",   label: "Wrong Number" },
];

const OUTCOME_COLOUR = {
  Connected:      "bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800",
  "No Answer":    "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  "Left Voicemail":"bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  Busy:           "bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800",
  "Wrong Number": "bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
};

// ─── Call Card ────────────────────────────────────────────────────────────────

function CallCard({ call, ownerMap }) {
  const dirCfg = DIRECTION_CONFIG[call.direction] || null;
  const DirIcon = dirCfg?.icon || Phone;
  const outColour = OUTCOME_COLOUR[call.outcome] || "bg-muted text-muted-foreground border-border";
  const cleanBody = cleanHubSpotText(call.body);
  const ownerName = call.ownerId ? resolveOwner(call.ownerId, ownerMap) : null;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="h-0.5 w-full bg-gradient-to-r from-blue-500 to-indigo-500" />
      <div className="p-4">
        {/* Title row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`flex-shrink-0 ${dirCfg?.colour || "text-muted-foreground"}`}>
              <DirIcon className="w-4 h-4" />
            </div>
            <p className="text-sm font-bold text-foreground truncate">{cleanHubSpotText(call.title)}</p>
          </div>
          {call.outcome && (
            <span className={`flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${outColour}`}>
              {call.outcome}
            </span>
          )}
        </div>

        {/* Body */}
        {cleanBody && (
          <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap mb-3 pl-6">{cleanBody}</p>
        )}

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-foreground pl-6">
          {call.callDatetime && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDateTime(call.callDatetime)}
            </span>
          )}
          {call.direction && dirCfg && (
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {dirCfg.label}
            </span>
          )}
          {ownerName && (
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              Owner: {ownerName}
            </span>
          )}
          {call.url && (
            <a
              href={call.url}
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

// ─── Log Call Form ────────────────────────────────────────────────────────────

function LogCallForm({ company, contacts, portalId, onSaved, onCancel }) {
  const [contactId,       setContactId]       = useState("");
  const [direction,       setDirection]       = useState("OUTBOUND");
  const [outcome,         setOutcome]         = useState("CONNECTED");
  const [subject,         setSubject]         = useState("Sales call");
  const [body,            setBody]            = useState("");
  const [callDatetime,    setCallDatetime]    = useState(localDatetimeNow());
  const [followUp,        setFollowUp]        = useState(false);
  const [followUpDate,    setFollowUpDate]    = useState("");
  const [saving,          setSaving]          = useState(false);
  const [error,           setError]           = useState(null);
  const [success,         setSuccess]         = useState(null);

  const validate = () => {
    if (body.trim().length < 5) { setError("Call notes must be at least 5 characters."); return false; }
    if (followUp && !followUpDate) { setError("Please select a follow-up date."); return false; }
    return true;
  };

  const handleSave = async () => {
    setError(null);
    if (!validate()) return;
    setSaving(true);
    try {
      const res = await base44.functions.invoke("createHubSpotCall", {
        companyId: company.id,
        contactId: contactId || null,
        direction,
        outcome,
        subject: subject.trim() || "Sales call",
        body: body.trim(),
        callDatetime: callDatetime ? new Date(callDatetime).toISOString() : null,
        followUpRequired: followUp,
        followUpDate: followUp ? followUpDate : null,
      });
      const d = res.data || {};
      if (d.error) {
        setError(d.error);
      } else {
        setSuccess(d);
        setTimeout(() => {
          setSuccess(null);
          onSaved(d);
        }, 2500);
      }
    } catch (e) {
      const msg = e?.response?.data?.error || e?.response?.data?.detail || e?.message || "Failed to log call. Please try again.";
      setError(msg);
    }
    setSaving(false);
  };

  const fieldCls = "w-full text-sm rounded-lg border border-border bg-background text-foreground px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/50";
  const labelCls = "block text-xs font-semibold text-foreground mb-1";

  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden">
      <div className="h-0.5 w-full bg-gradient-to-r from-blue-500 to-indigo-500" />
      <div className="p-4 space-y-3">

        {/* Contact */}
        {contacts && contacts.length > 0 && (
          <div>
            <label className={labelCls}>
              Contact <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <select value={contactId} onChange={e => setContactId(e.target.value)} className={fieldCls}>
              <option value="">— No contact —</option>
              {contacts.map(c => {
                const cp = c.properties || {};
                const name = [cp.firstname, cp.lastname].filter(Boolean).join(" ") || `Contact ${c.id}`;
                return <option key={c.id} value={c.id}>{name}</option>;
              })}
            </select>
          </div>
        )}

        {/* Direction + Outcome row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Direction</label>
            <select value={direction} onChange={e => setDirection(e.target.value)} className={fieldCls}>
              <option value="OUTBOUND">Outbound</option>
              <option value="INBOUND">Inbound</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Outcome</label>
            <select value={outcome} onChange={e => setOutcome(e.target.value)} className={fieldCls}>
              {OUTCOMES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className={labelCls}>Subject</label>
          <input
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="Sales call"
            className={fieldCls}
          />
        </div>

        {/* Call date/time */}
        <div>
          <label className={labelCls}>Call Date &amp; Time</label>
          <input
            type="datetime-local"
            value={callDatetime}
            onChange={e => setCallDatetime(e.target.value)}
            className={fieldCls}
          />
        </div>

        {/* Notes */}
        <div>
          <label className={labelCls}>Notes</label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="What was discussed…"
            rows={3}
            className={`${fieldCls} resize-none`}
          />
          <p className={`text-[11px] mt-0.5 ${body.trim().length > 0 && body.trim().length < 5 ? "text-destructive" : "text-foreground/70"}`}>
            {body.trim().length} / 5 min characters
          </p>
        </div>

        {/* Follow-up toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => { setFollowUp(v => !v); setFollowUpDate(""); }}
            className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${followUp ? "bg-primary" : "bg-muted border border-border"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${followUp ? "translate-x-4" : ""}`} />
          </button>
          <span className="text-xs font-semibold text-foreground">Follow-up required</span>
        </div>

        {/* Follow-up date */}
        {followUp && (
          <div>
            <label className={labelCls}>
              Follow-up Date <span className="text-destructive">*</span>
            </label>
            <input
              type="date"
              value={followUpDate}
              onChange={e => setFollowUpDate(e.target.value)}
              min={formatDateInput(new Date().toISOString())}
              className={fieldCls}
            />
          </div>
        )}

        {error && (
          <p className="text-xs text-destructive flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {error}
          </p>
        )}

        {success && (
          <div className="space-y-1">
            <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1.5 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
              Call logged{success.taskCreated ? " · Follow-up task created" : ""}
            </p>
            {success.ownerName && (
              <p className="text-xs text-foreground pl-5">
                Logged as: <span className="font-medium">{success.ownerName}</span>
                {success.ownerEmail ? ` (${success.ownerEmail})` : ""}
              </p>
            )}
            {success.ownerWarning && (
              <p className="text-xs text-amber-600 dark:text-amber-400 pl-5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                {success.ownerWarning}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleSave}
            disabled={saving || body.trim().length < 5}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {saving ? "Saving…" : "Save Call"}
          </button>
          <button
            onClick={onCancel}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-muted text-foreground hover:bg-muted/80 disabled:opacity-50 transition-colors border border-border"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────

export default function CallsTab({ company, portalId, contacts, initialShowForm = false, onProfileLinked }) {
  const [calls, setCalls]       = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [showForm, setShowForm] = useState(initialShowForm);
  const ownerMap                = useHubSpotOwners();

  const loadCalls = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("getHubSpotCompanyCalls", {
        companyId: company.id,
        portalId,
      });
      const d = res.data || {};
      if (d.error) setError(d.error);
      else setCalls(d.calls || []);
    } catch (e) {
      setError("Failed to load calls.");
    }
    setLoading(false);
  }, [company.id, portalId]);

  useEffect(() => { loadCalls(); }, [loadCalls]);

  const handleSaved = (result) => {
    setShowForm(false);
    loadCalls();
    if (result?.profileAutoLinked && onProfileLinked) {
      onProfileLinked(result);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Log Call button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 w-full py-2.5 px-4 rounded-xl border border-dashed border-border text-sm font-semibold text-foreground hover:border-primary/40 hover:bg-muted/40 transition-all"
        >
          <Plus className="w-4 h-4" />
          Log Call
        </button>
      )}

      {/* Form */}
      {showForm && (
        <LogCallForm
          company={company}
          contacts={contacts}
          portalId={portalId}
          onSaved={handleSaved}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Calls list */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm text-foreground">Loading calls…</span>
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <AlertCircle className="w-7 h-7 text-destructive" />
          <p className="text-sm font-semibold text-destructive">{error}</p>
        </div>
      )}

      {!loading && !error && calls && calls.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Inbox className="w-10 h-10 text-muted-foreground/40" />
          <p className="text-sm font-semibold text-foreground">No calls logged yet</p>
          <p className="text-xs text-foreground/70">Log the first call for this company</p>
        </div>
      )}

      {!loading && !error && calls && calls.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
            {calls.length} Call{calls.length !== 1 ? "s" : ""}
          </p>
          {calls.map(call => <CallCard key={call.id} call={call} ownerMap={ownerMap} />)}
        </div>
      )}
    </div>
  );
}
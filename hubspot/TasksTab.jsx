import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import {
  Loader2, AlertCircle, Inbox, Plus, ExternalLink, RefreshCw,
  Clock, User, CheckCircle2, Circle, Flag, AlarmClock
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

function isOverdue(dueDate) {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date() ;
}

const STATUS_CONFIG = {
  NOT_STARTED:  { label: "To Do",       colour: "bg-muted text-muted-foreground border-border" },
  IN_PROGRESS:  { label: "In Progress", colour: "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800" },
  WAITING:      { label: "Waiting",     colour: "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800" },
  DEFERRED:     { label: "Deferred",    colour: "bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800" },
  COMPLETED:    { label: "Completed",   colour: "bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800" },
};

const PRIORITY_COLOUR = {
  High:   "text-red-500",
  Medium: "text-amber-500",
  Low:    "text-blue-400",
  None:   "text-muted-foreground",
};

// ─── Task Card ────────────────────────────────────────────────────────────────

function TaskCard({ task, onComplete, ownerMap }) {
  const [completing, setCompleting] = useState(false);
  const isComplete = task.status === "COMPLETED";
  const statusCfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.NOT_STARTED;
  const overdue = !isComplete && isOverdue(task.dueDate);
  const cleanBody = cleanHubSpotText(task.body);
  const ownerName = task.ownerId ? resolveOwner(task.ownerId, ownerMap) : null;

  const handleComplete = async () => {
    setCompleting(true);
    await onComplete(task.id);
    setCompleting(false);
  };

  return (
    <div className={`rounded-xl border bg-card overflow-hidden ${isComplete ? "opacity-60" : ""} ${overdue ? "border-red-300 dark:border-red-800" : "border-border"}`}>
      <div className={`h-0.5 w-full ${isComplete ? "bg-gradient-to-r from-green-400 to-emerald-400" : overdue ? "bg-gradient-to-r from-red-400 to-orange-400" : "bg-gradient-to-r from-violet-500 to-purple-500"}`} />
      <div className="p-4">
        {/* Title row */}
        <div className="flex items-start gap-2 mb-2">
          <button
            onClick={!isComplete ? handleComplete : undefined}
            disabled={isComplete || completing}
            className={`flex-shrink-0 mt-0.5 ${isComplete ? "cursor-default" : "hover:scale-110 transition-transform"}`}
            title={isComplete ? "Completed" : "Mark as complete"}
          >
            {completing
              ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              : isComplete
                ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                : <Circle className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
            }
          </button>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-bold text-foreground leading-snug ${isComplete ? "line-through" : ""}`}>
              {task.title}
            </p>
          </div>
          <span className={`flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusCfg.colour}`}>
            {statusCfg.label}
          </span>
        </div>

        {/* Body */}
        {cleanBody && (
          <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap mb-2 pl-6">{cleanBody}</p>
        )}

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-foreground pl-6">
          {task.dueDate && (
            <span className={`flex items-center gap-1 ${overdue ? "text-red-500 font-semibold" : ""}`}>
              <AlarmClock className="w-3 h-3" />
              {overdue ? "Overdue · " : ""}{formatDate(task.dueDate)}
            </span>
          )}
          {task.priority && task.priority !== "None" && (
            <span className={`flex items-center gap-1 ${PRIORITY_COLOUR[task.priority] || ""}`}>
              <Flag className="w-3 h-3" />
              {task.priority}
            </span>
          )}
          {ownerName && (
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              Owner: {ownerName}
            </span>
          )}
          {task.url && (
            <a
              href={task.url}
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

// ─── Create Task Form ─────────────────────────────────────────────────────────

function CreateTaskForm({ company, contacts, onSaved, onCancel }) {
  const [title,     setTitle]     = useState("");
  const [body,      setBody]      = useState("");
  const [dueDate,   setDueDate]   = useState("");
  const [priority,  setPriority]  = useState("None");
  const [contactId, setContactId] = useState("");
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState(null);
  const [success,   setSuccess]   = useState(null);

  const today = new Date().toISOString().slice(0, 10);

  const handleSave = async () => {
    setError(null);
    if (!title.trim() || title.trim().length < 2) { setError("Task title must be at least 2 characters."); return; }
    if (!dueDate) { setError("Please select a due date."); return; }
    setSaving(true);
    try {
      const res = await base44.functions.invoke("createHubSpotTask", {
        companyId: company.id,
        contactId: contactId || null,
        title: title.trim(),
        body: body.trim(),
        dueDate,
        priority,
      });
      const d = res.data || {};
      if (d.ownerMissing || d.error) {
        setError(d.error);
      } else {
        setSuccess(d);
        setTimeout(() => { setSuccess(null); onSaved(); }, 2000);
      }
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Failed to create task.");
    }
    setSaving(false);
  };

  const fieldCls = "w-full text-sm rounded-lg border border-border bg-background text-foreground px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/50";
  const labelCls = "block text-xs font-semibold text-foreground mb-1";

  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden">
      <div className="h-0.5 w-full bg-gradient-to-r from-violet-500 to-purple-500" />
      <div className="p-4 space-y-3">

        {/* Contact */}
        {contacts && contacts.length > 0 && (
          <div>
            <label className={labelCls}>Contact <span className="text-muted-foreground font-normal">(optional)</span></label>
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

        {/* Title */}
        <div>
          <label className={labelCls}>Task Title <span className="text-destructive">*</span></label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Follow up on proposal"
            className={fieldCls}
          />
        </div>

        {/* Notes */}
        <div>
          <label className={labelCls}>Notes <span className="text-muted-foreground font-normal">(optional)</span></label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Additional context…"
            rows={3}
            className={`${fieldCls} resize-none`}
          />
        </div>

        {/* Due date + Priority row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Due Date <span className="text-destructive">*</span></label>
            <input
              type="date"
              value={dueDate}
              min={today}
              onChange={e => setDueDate(e.target.value)}
              className={fieldCls}
            />
          </div>
          <div>
            <label className={labelCls}>Priority</label>
            <select value={priority} onChange={e => setPriority(e.target.value)} className={fieldCls}>
              <option value="None">None</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>

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
              Task created in HubSpot
            </p>
            {success.ownerName && (
              <p className="text-xs text-foreground pl-5">
                Assigned to: <span className="font-medium">{success.ownerName}</span>
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

        <div className="flex gap-2 pt-1">
          <button
            onClick={handleSave}
            disabled={saving || !title.trim() || !dueDate}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {saving ? "Creating…" : "Create Task"}
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

export default function TasksTab({ company, portalId, contacts, initialShowForm = false }) {
  const [tasks,        setTasks]        = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);
  const [showForm,     setShowForm]     = useState(initialShowForm);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [completeError, setCompleteError] = useState(null);
  const ownerMap                         = useHubSpotOwners();

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    setCompleteError(null);
    try {
      const res = await base44.functions.invoke("getHubSpotCompanyTasks", {
        companyId: company.id,
        portalId,
      });
      const d = res.data || {};
      if (d.error) setError(d.error);
      else { setTasks(d.tasks || []); setLastRefreshed(new Date()); }
    } catch (e) {
      setError("Failed to load tasks.");
    }
    setLoading(false);
  }, [company.id, portalId]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const handleComplete = async (taskId) => {
    setCompleteError(null);
    try {
      const res = await base44.functions.invoke("completeHubSpotTask", { taskId });
      const d = res.data || {};
      if (d.error) {
        setCompleteError(d.error);
      } else {
        // Optimistically mark it completed locally then reload
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: "COMPLETED" } : t));
      }
    } catch (e) {
      setCompleteError("Failed to mark task as complete.");
    }
  };

  const handleSaved = () => { setShowForm(false); loadTasks(); };

  const openTasks = (tasks || []).filter(t => t.status !== "COMPLETED");
  const completedTasks = (tasks || []).filter(t => t.status === "COMPLETED");

  return (
    <div className="p-4 space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2">
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 py-2 px-3 rounded-xl border border-dashed border-border text-xs font-semibold text-foreground hover:border-primary/40 hover:bg-muted/40 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Task
          </button>
        )}
        {showForm && <div />}
        <div className="flex items-center gap-2">
          {lastRefreshed && (
            <span className="text-[11px] text-foreground hidden sm:block">
              Refreshed {formatTime(lastRefreshed)}
            </span>
          )}
          <button
            onClick={loadTasks}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Create form */}
      {showForm && (
        <CreateTaskForm
          company={company}
          contacts={contacts}
          onSaved={handleSaved}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Complete error */}
      {completeError && (
        <p className="text-xs text-destructive flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {completeError}
        </p>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm text-foreground">Loading tasks…</span>
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
      {!loading && !error && tasks && tasks.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Inbox className="w-10 h-10 text-muted-foreground/40" />
          <p className="text-sm font-semibold text-foreground">No tasks yet</p>
          <p className="text-xs text-foreground/70">Create the first task for this company</p>
        </div>
      )}

      {/* Open tasks */}
      {!loading && !error && openTasks.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
            {openTasks.length} Open Task{openTasks.length !== 1 ? "s" : ""}
          </p>
          {openTasks.map(task => (
            <TaskCard key={task.id} task={task} onComplete={handleComplete} ownerMap={ownerMap} />
          ))}
        </div>
      )}

      {/* Completed tasks */}
      {!loading && !error && completedTasks.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
            {completedTasks.length} Completed
          </p>
          {completedTasks.map(task => (
            <TaskCard key={task.id} task={task} onComplete={handleComplete} ownerMap={ownerMap} />
          ))}
        </div>
      )}
    </div>
  );
}
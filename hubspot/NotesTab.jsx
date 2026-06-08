import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, AlertCircle, Inbox, Plus, X, ExternalLink, Clock, User, CheckCircle2 } from "lucide-react";
import { cleanHubSpotText, useHubSpotOwners, resolveOwner } from "@/lib/hubspotUtils";

function formatDateTime(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function NoteCard({ note, ownerMap }) {
  const cleanBody = cleanHubSpotText(note.body);
  const ownerName = note.ownerId ? resolveOwner(note.ownerId, ownerMap) : null;
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="h-0.5 w-full bg-gradient-to-r from-amber-400 to-orange-400" />
      <div className="p-4">
        {cleanBody && (
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap mb-3">{cleanBody}</p>
        )}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-foreground">
          {note.timestamp && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDateTime(note.timestamp)}
            </span>
          )}
          {ownerName && (
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              Owner: {ownerName}
            </span>
          )}
          {note.url && (
            <a
              href={note.url}
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

function AddNoteForm({ company, contacts, portalId, onSaved, onCancel }) {
  const [body, setBody]           = useState("");
  const [contactId, setContactId] = useState("");
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState(null);
  const [success, setSuccess]     = useState(false);

  const handleSave = async () => {
    const trimmed = body.trim();
    if (trimmed.length < 5) {
      setError("Note must be at least 5 characters.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("createHubSpotNote", {
        companyId: company.id,
        contactId: contactId || null,
        body: trimmed,
      });
      const d = res.data || {};
      if (d.error) {
        setError(d.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setBody("");
          setContactId("");
          onSaved(d);
        }, 1200);
      }
    } catch (e) {
      setError("Failed to save note. Please try again.");
    }
    setSaving(false);
  };

  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden">
      <div className="h-0.5 w-full bg-gradient-to-r from-primary to-purple-500" />
      <div className="p-4 space-y-3">
        {/* Contact dropdown */}
        {contacts && contacts.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Associate Contact <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <select
              value={contactId}
              onChange={e => setContactId(e.target.value)}
              className="w-full text-sm rounded-lg border border-border bg-background text-foreground px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/50"
            >
              <option value="">— No contact —</option>
              {contacts.map(c => {
                const cp = c.properties || {};
                const name = [cp.firstname, cp.lastname].filter(Boolean).join(" ") || `Contact ${c.id}`;
                return <option key={c.id} value={c.id}>{name}</option>;
              })}
            </select>
          </div>
        )}

        {/* Note body */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">Note</label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Write your note here…"
            rows={4}
            className="w-full text-sm rounded-lg border border-border bg-background text-foreground px-3 py-2 placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/50"
          />
          <p className={`text-[11px] mt-0.5 ${body.trim().length > 0 && body.trim().length < 5 ? "text-destructive" : "text-foreground/70"}`}>
            {body.trim().length} / 5 min characters
          </p>
        </div>

        {error && (
          <p className="text-xs text-destructive flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {error}
          </p>
        )}

        {success && (
          <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1.5 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
            Note added to HubSpot
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleSave}
            disabled={saving || body.trim().length < 5}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            {saving ? "Saving…" : "Save Note"}
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

export default function NotesTab({ company, portalId, contacts, initialShowForm = false, onFormOpenChange, onProfileLinked }) {
  const [notes, setNotes]         = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [showForm, setShowForm]   = useState(initialShowForm);
  const ownerMap                  = useHubSpotOwners();

  const loadNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("getHubSpotCompanyNotes", {
        companyId: company.id,
        portalId,
      });
      const d = res.data || {};
      if (d.error) setError(d.error);
      else setNotes(d.notes || []);
    } catch (e) {
      setError("Failed to load notes.");
    }
    setLoading(false);
  }, [company.id, portalId]);

  useEffect(() => { loadNotes(); }, [loadNotes]);

  const handleSaved = (result) => {
    setShowForm(false);
    loadNotes();
    if (result?.profileAutoLinked && onProfileLinked) {
      onProfileLinked(result);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Add note button (when form not open) */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 w-full py-2.5 px-4 rounded-xl border border-dashed border-border text-sm font-semibold text-foreground hover:border-primary/40 hover:bg-muted/40 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Note
        </button>
      )}

      {/* Form */}
      {showForm && (
        <AddNoteForm
          company={company}
          contacts={contacts}
          portalId={portalId}
          onSaved={handleSaved}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Notes list */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm text-foreground">Loading notes…</span>
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <AlertCircle className="w-7 h-7 text-destructive" />
          <p className="text-sm font-semibold text-destructive">{error}</p>
        </div>
      )}

      {!loading && !error && notes && notes.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Inbox className="w-10 h-10 text-muted-foreground/40" />
          <p className="text-sm font-semibold text-foreground">No notes yet</p>
          <p className="text-xs text-foreground/70">Add the first note for this company</p>
        </div>
      )}

      {!loading && !error && notes && notes.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
            {notes.length} Note{notes.length !== 1 ? "s" : ""}
          </p>
          {notes.map(note => <NoteCard key={note.id} note={note} ownerMap={ownerMap} />)}
        </div>
      )}
    </div>
  );
}
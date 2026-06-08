import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Building2, Globe, Phone, MapPin, Tag, Layers, Clock, User,
  ExternalLink, Hash, Loader2, AlertCircle, Inbox, Mail, Briefcase, Plus
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import NotesTab from "./NotesTab";
import CallsTab from "./CallsTab";
import TasksTab from "./TasksTab";
import TicketsTab from "./TicketsTab";
import TimelineTab from "./TimelineTab";
import AccountSummaryPanel from "./AccountSummaryPanel";
import EmailsTab from "./EmailsTab";
import AccountKPICards from "./AccountKPICards";
import Account360Overview from "./Account360Overview";
import { useHubSpotOwners, resolveOwner } from "@/lib/hubspotUtils";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function DrawerRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 px-5 py-3 border-b border-border last:border-0">
      <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-foreground break-words">{value}</p>
      </div>
    </div>
  );
}

// ─── Tab: Overview ────────────────────────────────────────────────────────────

function OverviewTab({ company, ownerMap }) {
  const p = company.properties || {};
  const ownerName = p.hubspot_owner_id ? resolveOwner(p.hubspot_owner_id, ownerMap) : null;
  return (
    <div className="py-2">
      <DrawerRow icon={Hash}     label="HubSpot ID"      value={company.id} />
      <DrawerRow icon={Globe}    label="Domain"          value={p.domain} />
      <DrawerRow icon={Phone}    label="Phone"           value={p.phone} />
      <DrawerRow icon={MapPin}   label="City"            value={p.city} />
      <DrawerRow icon={Tag}      label="Industry"        value={p.industry} />
      <DrawerRow icon={Layers}   label="Lifecycle Stage" value={p.lifecyclestage} />
      <DrawerRow icon={User}     label="Owner"           value={ownerName} />
      <DrawerRow icon={Clock}    label="Last Modified"   value={formatDate(p.hs_lastmodifieddate)} />
      <DrawerRow icon={Clock}    label="Created"         value={formatDate(p.createdate)} />
    </div>
  );
}

// ─── Contact Card ─────────────────────────────────────────────────────────────

function ContactCard({ contact }) {
  const p = contact.properties || {};
  const fullName = [p.firstname, p.lastname].filter(Boolean).join(" ") || "Unknown Contact";
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card hover:shadow-sm transition-all">
      <div className="h-0.5 w-full bg-gradient-to-r from-purple-500 to-cyan-500" />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{fullName}</p>
              {p.jobtitle && <p className="text-xs text-muted-foreground truncate">{p.jobtitle}</p>}
            </div>
          </div>
          {p.lifecyclestage && (
            <span className="flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 capitalize">
              {p.lifecyclestage}
            </span>
          )}
        </div>
        <div className="space-y-1 mb-3">
          {p.email && (
            <div className="flex items-center gap-1.5 text-xs text-foreground">
              <Mail className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{p.email}</span>
            </div>
          )}
          {p.phone && (
            <div className="flex items-center gap-1.5 text-xs text-foreground">
              <Phone className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              <span>{p.phone}</span>
            </div>
          )}
          {p.hs_lastmodifieddate && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="w-3 h-3 flex-shrink-0" />
              <span>Updated {formatDate(p.hs_lastmodifieddate)}</span>
            </div>
          )}
        </div>
        {contact.url && (
          <a
            href={contact.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Open in HubSpot
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Tab: Contacts ────────────────────────────────────────────────────────────

function ContactsTab({ company, portalId, contacts, loading, error }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading contacts…</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <AlertCircle className="w-7 h-7 text-destructive" />
        <p className="text-sm font-semibold text-destructive">{error}</p>
      </div>
    );
  }
  if (contacts && contacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Inbox className="w-10 h-10 text-muted-foreground/40" />
        <p className="text-sm font-semibold text-foreground">No contacts found</p>
        <p className="text-xs text-foreground/70">This company has no associated contacts in HubSpot</p>
      </div>
    );
  }
  return (
    <div className="p-4 space-y-3">
      {contacts !== null && (
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {contacts.length} Contact{contacts.length !== 1 ? "s" : ""}
        </p>
      )}
      {(contacts || []).map(c => <ContactCard key={c.id} contact={c} />)}
    </div>
  );
}

// ─── Coming Soon tab ─────────────────────────────────────────────────────────

function ComingSoonTab({ label }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
      <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
        <Briefcase className="w-6 h-6 opacity-30" />
      </div>
      <p className="text-sm font-semibold">{label} — Coming Next</p>
      <p className="text-xs opacity-60">This section is being built</p>
    </div>
  );
}

// ─── Tab bar ─────────────────────────────────────────────────────────────────

const TABS = [
  { key: "overview",  label: "Overview" },
  { key: "timeline",  label: "Timeline" },
  { key: "contacts",  label: "Contacts" },
  { key: "notes",     label: "Notes" },
  { key: "calls",     label: "Calls" },
  { key: "tasks",     label: "Tasks" },
  { key: "tickets",   label: "Tickets" },
  { key: "emails",    label: "Emails" },
];

// ─── Main Drawer ──────────────────────────────────────────────────────────────

export default function CompanyDetailDrawer({ company, portalId, onClose, onProfileLinked }) {
  const [activeTab, setActiveTab]         = useState("overview");
  const [contacts, setContacts]           = useState(null);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsError, setContactsError] = useState(null);
  // Controls forms being opened via header buttons
  const [openNoteForm, setOpenNoteForm]   = useState(false);
  const [openCallForm, setOpenCallForm]   = useState(false);
  const ownerMap                          = useHubSpotOwners();

  // Load contacts once when drawer opens (shared between Contacts and Notes tabs)
  useEffect(() => {
    if (!company) return;
    let cancelled = false;
    const load = async () => {
      setContactsLoading(true);
      setContactsError(null);
      const res = await base44.functions.invoke("getHubSpotCompanyContacts", {
        companyId: company.id,
        portalId,
      });
      if (cancelled) return;
      const d = res.data || {};
      if (d.error) setContactsError(d.error);
      else setContacts(d.contacts || []);
      setContactsLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [company?.id]);

  if (!company) return null;
  const p = company.properties || {};

  const handleAddNote = () => {
    setOpenNoteForm(true);
    setActiveTab("notes");
  };

  const handleLogCall = () => {
    setOpenCallForm(true);
    setActiveTab("calls");
  };

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/30 dark:bg-black/50"
      />
      <motion.div
        key="drawer"
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="fixed right-0 top-0 bottom-0 z-50 flex flex-col bg-background border-l border-border shadow-2xl"
        style={{ width: "min(960px, 95vw)" }}
      >
        {/* Header */}
        <div className="flex items-start gap-3 px-5 py-4 border-b border-border flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-950/50 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-foreground leading-snug">{p.name || "Unknown Company"}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              <span className="font-mono">ID: {company.id}</span>
            </p>
          </div>
          {/* Header action buttons */}
          <button
            onClick={handleLogCall}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex-shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Log Call
          </button>
          <button
            onClick={handleAddNote}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors flex-shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Note
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-border bg-muted/30 flex-shrink-0 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 px-4 py-3 text-xs font-semibold transition-colors border-b-2 ${
                activeTab === tab.key
                  ? "border-primary text-foreground"
                  : "border-transparent text-foreground/60 hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "timeline" && (
            <TimelineTab company={company} portalId={portalId} />
          )}
          {activeTab === "overview" && (
            <div className="px-4">
              <Account360Overview
                company={company}
                portalId={portalId}
                contacts={contacts}
                onAction={(key) => {
                  if (key === "call") { setOpenCallForm(true); setActiveTab("calls"); }
                  else if (key === "note") { setOpenNoteForm(true); setActiveTab("notes"); }
                  else if (key === "task") { setActiveTab("tasks"); }
                }}
              />
            </div>
          )}
          {activeTab === "contacts" && (
            <ContactsTab
              company={company}
              portalId={portalId}
              contacts={contacts}
              loading={contactsLoading}
              error={contactsError}
            />
          )}
          {activeTab === "notes" && (
            <NotesTab
              company={company}
              portalId={portalId}
              contacts={contacts}
              initialShowForm={openNoteForm}
              onFormOpenChange={setOpenNoteForm}
              onProfileLinked={onProfileLinked}
            />
          )}
          {activeTab === "calls" && (
            <CallsTab
              company={company}
              portalId={portalId}
              contacts={contacts}
              initialShowForm={openCallForm}
              onProfileLinked={onProfileLinked}
            />
          )}
          {activeTab === "tickets" && (
            <TicketsTab company={company} portalId={portalId} />
          )}
          {activeTab === "emails" && (
            <EmailsTab company={company} portalId={portalId} />
          )}
          {activeTab === "tasks" && (
            <TasksTab
              company={company}
              portalId={portalId}
              contacts={contacts}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border flex-shrink-0">
          {company.url ? (
            <a
              href={company.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Open Company in HubSpot
            </a>
          ) : (
            <p className="text-xs text-center text-muted-foreground">HubSpot URL unavailable</p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
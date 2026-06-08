import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, User, Building2, UserCircle, Tag, Calendar, Clock, Hash, Layers, Copy, CheckCheck, Mail, MessageSquare, Globe } from "lucide-react";
import { useState } from "react";
import { classifyStage, daysOpen, STATUS_CONFIG } from "@/pages/HubSpotTickets";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
  });
}

function formatDateShort(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

const PRIORITY_BADGE = {
  HIGH:   "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800",
  MEDIUM: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800",
  LOW:    "text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700",
};

// ─── Drawer building blocks ───────────────────────────────────────────────────

function DrawerSection({ title, children }) {
  return (
    <div className="mb-1">
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3 border-b border-border bg-muted/30">
        {title}
      </p>
      <div className="divide-y divide-border">
        {children}
      </div>
    </div>
  );
}

function DrawerRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 px-5 py-3">
      <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground font-medium leading-snug break-words">{value}</p>
      </div>
    </div>
  );
}

function CopyButton({ value, label }) {
  const [copied, setCopied] = useState(false);
  if (!value) return null;
  const handle = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button
      onClick={handle}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-muted border border-border text-muted-foreground hover:text-foreground transition-colors"
    >
      {copied ? <CheckCheck className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied" : label}
    </button>
  );
}

function Timeline({ created, modified, stageLabel }) {
  const events = [];
  if (created)  events.push({ date: formatDateShort(created),  label: "Ticket Created" });
  if (stageLabel) events.push({ date: null,                    label: `Stage: ${stageLabel}` });
  if (modified && modified !== created)
    events.push({ date: formatDateShort(modified), label: "Last Updated" });

  if (!events.length) return null;

  return (
    <DrawerSection title="Timeline">
      <div className="px-5 py-4 space-y-4">
        {events.map((e, i) => (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-2 h-2 rounded-full bg-primary mt-1 flex-shrink-0" />
              {i < events.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
            </div>
            <div className="pb-2">
              {e.date && <p className="text-xs text-muted-foreground mb-0.5">{e.date}</p>}
              <p className="text-sm text-foreground font-medium">{e.label}</p>
            </div>
          </div>
        ))}
      </div>
    </DrawerSection>
  );
}

// ─── Main Drawer ──────────────────────────────────────────────────────────────

export default function TicketDrawer({ ticket, pipeline, portalId, onClose }) {
  if (!ticket) return null;

  const p           = ticket.properties || {};
  const subject     = p.subject || p.content || "Untitled";
  const stageId     = p.hs_pipeline_stage || "";
  const stageLabel  = p.hs_pipeline_stage_label || stageId || "—";
  const status      = classifyStage(stageId);
  const statusCfg   = STATUS_CONFIG[status] || STATUS_CONFIG.in_progress;
  const priority    = p.hs_ticket_priority?.toUpperCase() || null;
  const category    = p.hs_ticket_category || null;
  const source      = p.source_type || null;
  const owner       = p.owner_name || null;
  const company     = p.company_name || null;
  const candidate   = [p.candidate_firstname, p.candidate_lastname].filter(Boolean).join(" ") || null;
  const created     = formatDateTime(p.createdate);
  const modified    = formatDateTime(p.hs_lastmodifieddate);
  const days        = daysOpen(p.createdate);
  const description = p.content && p.content !== p.subject ? p.content : null;

  const hsUrl = ticket.url || (portalId
    ? `https://app.hubspot.com/contacts/${portalId}/ticket/${ticket.id}`
    : `https://app.hubspot.com/contacts/tickets/${ticket.id}`);

  const ageClasses = days === null ? ""
    : days >= 15 ? "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
    : days >= 8  ? "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
    : "bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800";

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/30 dark:bg-black/50"
      />

      <motion.div
        key="drawer"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="fixed right-0 top-0 bottom-0 z-50 flex flex-col bg-background border-l border-border shadow-2xl"
        style={{ width: "min(550px, 95vw)" }}
      >
        {/* Header */}
        <div className="flex items-start gap-3 px-5 py-4 border-b border-border flex-shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: statusCfg.accent }} />
              <span className="text-xs text-muted-foreground font-medium">{pipeline?.label}</span>
              <span className="text-muted-foreground/40">·</span>
              <span className="text-xs text-muted-foreground font-mono">#{ticket.id}</span>
            </div>
            <h2 className="text-base font-bold text-foreground leading-snug">{subject}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status chips row */}
        <div className="flex flex-wrap gap-2 px-5 py-3 border-b border-border flex-shrink-0 bg-muted/20">
          {/* Internal status */}
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
            {statusCfg.label}
          </span>
          {/* Stage label */}
          <span className="text-xs px-2.5 py-1 rounded-md bg-muted text-muted-foreground border border-border">
            {stageLabel}
          </span>
          {priority && (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${PRIORITY_BADGE[priority] || ""}`}>
              {priority.charAt(0) + priority.slice(1).toLowerCase()} Priority
            </span>
          )}
          {days !== null && (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ml-auto ${ageClasses}`}>
              {days}d open
            </span>
          )}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">

          <DrawerSection title="Ticket Information">
            <DrawerRow icon={Hash}   label="Ticket ID"       value={ticket.id} />
            <DrawerRow icon={Layers} label="Pipeline"        value={pipeline?.label} />
            <DrawerRow icon={Tag}    label="Stage"           value={stageLabel} />
            <DrawerRow icon={Layers} label="Internal Status" value={statusCfg.label} />
            <DrawerRow icon={Tag}    label="Category"        value={category} />
            <DrawerRow icon={Layers} label="Source"          value={source} />
          </DrawerSection>

          {/* Support-specific fields — shown for Client / Applicant Raised Tickets */}
          {pipeline?.id === "3353771245" && (
            <DrawerSection title="Support Request Details">
              <DrawerRow icon={Globe}        label="Ticket Source"    value={source} />
              <DrawerRow icon={User}         label="Submitted By"     value={candidate || company} />
              <DrawerRow icon={Mail}         label="Email Address"    value={p.email || p.hs_email_first_send_date ? undefined : (p.from_email || p.hs_contact_email || null)} />
              {p.content && p.content !== p.subject && (
                <div className="flex items-start gap-3 px-5 py-3">
                  <MessageSquare className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-muted-foreground mb-1">Original Message</p>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{p.content}</p>
                  </div>
                </div>
              )}
            </DrawerSection>
          )}

          <DrawerSection title="People">
            {pipeline?.id !== "3353771245" && <DrawerRow icon={User}      label="Candidate" value={candidate} />}
            <DrawerRow icon={Building2}  label="Company"   value={company} />
            <DrawerRow icon={UserCircle} label="Owner"     value={owner} />
          </DrawerSection>

          <DrawerSection title="Activity">
            <DrawerRow icon={Calendar} label="Created"      value={created} />
            <DrawerRow icon={Clock}    label="Last Updated" value={modified} />
            {days !== null && (
              <DrawerRow icon={Clock} label="Days Open" value={`${days} day${days !== 1 ? "s" : ""}`} />
            )}
          </DrawerSection>

          {description && (
            <DrawerSection title="Description">
              <div className="px-5 py-4">
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{description}</p>
              </div>
            </DrawerSection>
          )}

          <Timeline created={p.createdate} modified={p.hs_lastmodifieddate} stageLabel={stageLabel} />

          {/* Quick Actions */}
          <div className="px-5 py-4 border-t border-border">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</p>
            <div className="flex flex-wrap gap-2">
              <CopyButton value={ticket.id} label="Copy Ticket ID" />
              <CopyButton value={candidate} label="Copy Candidate" />
              <CopyButton value={company}   label="Copy Company" />
            </div>
          </div>

        </div>

        {/* Sticky footer */}
        <div className="px-5 py-4 border-t border-border flex-shrink-0">
          <a
            href={hsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Open in HubSpot
          </a>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
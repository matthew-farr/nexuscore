import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import {
  ChevronDown, ChevronUp, Building2, User, MapPin, DollarSign,
  Activity, Zap, Phone, Mail, Globe, Hash, CheckSquare, Ticket,
  FileText, Clock, ExternalLink, Calendar, AlertTriangle, Loader2,
  BarChart2, Tag, Briefcase, ShieldCheck
} from "lucide-react";
import AccountSummaryPanel from "./AccountSummaryPanel";
import { useHubSpotOwners, resolveOwner } from "@/lib/hubspotUtils";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(str) {
  if (!str) return null;
  const d = new Date(Number(str) || str);
  if (isNaN(d)) return null;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function daysSince(str) {
  if (!str) return null;
  const d = new Date(Number(str) || str);
  if (isNaN(d)) return null;
  return Math.floor((Date.now() - d) / 86400000);
}

function urgencyColour(days) {
  if (days === null || days === undefined) return "#6b7280";
  if (days <= 7)  return "#10b981";
  if (days <= 30) return "#f59e0b";
  return "#ef4444";
}

// ── Primitives ────────────────────────────────────────────────────────────────

function Field({ label, value, mono, href, colour }) {
  if (!value && value !== 0) return null;
  const text = String(value);
  return (
    <div className="py-2 border-b last:border-0"
      style={{ borderColor: "rgba(128,128,128,0.12)" }}>
      <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5"
        style={{ color: "rgba(128,128,128,0.70)" }}>
        {label}
      </p>
      {href ? (
        <a href={href} target="_blank" rel="noreferrer"
          className="text-sm font-semibold flex items-center gap-1 hover:underline"
          style={{ color: colour || "#06b6d4" }}>
          {text}
          <ExternalLink className="w-3 h-3 flex-shrink-0" />
        </a>
      ) : (
        <p className="text-sm font-semibold" style={{ color: colour || "inherit", fontFamily: mono ? "monospace" : undefined }}>
          {text}
        </p>
      )}
    </div>
  );
}

function MiniKPI({ icon: Icon, label, value, colour, loading }) {
  return (
    <div className="flex-1 min-w-0 rounded-xl border p-3 flex flex-col gap-1"
      style={{ border: "1px solid rgba(128,128,128,0.14)", background: `${colour}0d` }}>
      <div className="flex items-center justify-between">
        <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: colour }} />
        {loading ? (
          <Loader2 className="w-3 h-3 animate-spin" style={{ color: colour }} />
        ) : (
          <span className="text-xl font-extrabold" style={{ color: colour }}>{value ?? "—"}</span>
        )}
      </div>
      <p className="text-[11px] font-semibold leading-tight">{label}</p>
    </div>
  );
}

// ── Collapsible Section ───────────────────────────────────────────────────────

function Section({ title, icon: Icon, colour, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border overflow-hidden"
      style={{ border: "1px solid rgba(128,128,128,0.14)" }}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 transition-opacity hover:opacity-80"
        style={{ background: `${colour}10` }}>
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 flex-shrink-0" style={{ color: colour }} />
          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: colour }}>
            {title}
          </span>
        </div>
        {open ? <ChevronUp className="w-4 h-4" style={{ color: colour }} /> : <ChevronDown className="w-4 h-4" style={{ color: colour }} />}
      </button>
      {open && <div className="px-4 py-2">{children}</div>}
    </div>
  );
}

// ── Quick Actions ─────────────────────────────────────────────────────────────

function QuickActions({ company, portalId, onAction, cdsPortalId }) {
  const id = company.id;
  const ACTIONS = [
    { key: "call",    label: "Log Call",      colour: "#06b6d4",  onClick: () => onAction("call") },
    { key: "note",    label: "Add Note",      colour: "#f59e0b",  onClick: () => onAction("note") },
    { key: "task",    label: "Create Task",   colour: "#8b5cf6",  onClick: () => onAction("task") },
    { key: "hubspot", label: "Open HubSpot",  colour: "#ec2ca3",
      href: portalId ? `https://app.hubspot.com/contacts/${portalId}/company/${id}` : "https://app-eu1.hubspot.com/" },
    ...(cdsPortalId ? [{
      key: "cds", label: "Open CDS Portal", colour: "#10b981",
      href: `https://portal.checksdirect.co.uk/admin/view-company.php?id=${cdsPortalId}`
    }] : []),
  ];

  return (
    <div className="flex flex-wrap gap-2 py-1">
      {ACTIONS.map(a => (
        a.href ? (
          <a key={a.key} href={a.href} target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all hover:opacity-80"
            style={{ background: `${a.colour}15`, border: `1px solid ${a.colour}35`, color: a.colour }}>
            <ExternalLink className="w-3.5 h-3.5" />
            {a.label}
          </a>
        ) : (
          <button key={a.key} onClick={a.onClick}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all hover:opacity-80 active:scale-95"
            style={{ background: `${a.colour}15`, border: `1px solid ${a.colour}35`, color: a.colour }}>
            {a.label}
          </button>
        )
      ))}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function Account360Overview({ company, portalId, contacts, onAction }) {
  const p = company.properties || {};
  const ownerMap = useHubSpotOwners();

  // KPI data (reuse AccountKPICards logic inline for full control)
  const [kpis, setKpis] = useState(null);
  const [kpisLoading, setKpisLoading] = useState(true);

  const loadKpis = useCallback(async () => {
    setKpisLoading(true);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const start30 = new Date(Date.now() - 30 * 86400000).toISOString();

    const [tasksRes, ticketsRes, callsRes, notesRes] = await Promise.allSettled([
      base44.functions.invoke("getHubSpotCompanyTasks",   { companyId: company.id, portalId }),
      base44.functions.invoke("getHubSpotCompanyTickets", { companyId: company.id, portalId }),
      base44.functions.invoke("getHubSpotCompanyCalls",   { companyId: company.id, portalId }),
      base44.functions.invoke("getHubSpotCompanyNotes",   { companyId: company.id, portalId }),
    ]);

    const tasks   = tasksRes.status   === "fulfilled" ? (tasksRes.value.data?.tasks    || []) : [];
    const tickets = ticketsRes.status === "fulfilled" ? (ticketsRes.value.data?.tickets || []) : [];
    const calls   = callsRes.status   === "fulfilled" ? (callsRes.value.data?.calls    || []) : [];
    const notes   = notesRes.status   === "fulfilled" ? (notesRes.value.data?.notes    || []) : [];

    const openTasks   = tasks.filter(t => t.status !== "COMPLETED").length;
    const openTickets = tickets.filter(t => t.isOpen !== false && t.status?.toLowerCase() !== "closed").length;
    const callsMonth  = calls.filter(c => c.callDatetime && c.callDatetime >= startOfMonth).length;
    const notesMonth  = notes.filter(n => n.timestamp  && n.timestamp  >= startOfMonth).length;
    const calls30     = calls.filter(c => c.callDatetime && c.callDatetime >= start30).length;
    const notes30     = notes.filter(n => n.timestamp  && n.timestamp  >= start30).length;
    const tasks30     = tasks.filter(t => t.dueDate    && t.dueDate    >= start30).length;

    const sortedCalls = calls.filter(c => c.callDatetime).sort((a, b) => new Date(b.callDatetime) - new Date(a.callDatetime));
    const lastCallDate = sortedCalls[0]?.callDatetime || null;

    setKpis({ openTasks, openTickets, callsMonth, notesMonth, calls30, notes30, tasks30, lastCallDate });
    setKpisLoading(false);
  }, [company.id, portalId]);

  useEffect(() => { loadKpis(); }, [loadKpis]);

  // Derived values
  const ownerName    = p.hubspot_owner_id ? resolveOwner(p.hubspot_owner_id, ownerMap) : null;
  const lastModDays  = daysSince(p.hs_lastmodifieddate);
  const lastCallDays = kpis?.lastCallDate ? daysSince(kpis.lastCallDate) : null;
  const cdsPortalId  = p.cd_portal_id || p.cds_portal_id || p.hs_object_id_cds || null;

  // Primary contact (first contact from prop)
  const primaryContact = contacts?.[0];
  const cp = primaryContact?.properties || {};

  return (
    <div className="space-y-3 py-3">

      {/* ── Section 1: Account Snapshot KPIs ── */}
      <div className="px-0">
        <div className="grid grid-cols-3 gap-2 mb-2">
          <MiniKPI icon={CheckSquare} label="Open Tasks"       colour="#8b5cf6" value={kpis?.openTasks}   loading={kpisLoading} />
          <MiniKPI icon={Ticket}      label="Open Tickets"     colour="#ef4444" value={kpis?.openTickets} loading={kpisLoading} />
          <MiniKPI icon={Phone}       label="Calls This Month" colour="#06b6d4" value={kpis?.callsMonth}  loading={kpisLoading} />
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <MiniKPI icon={FileText}    label="Notes This Month" colour="#f59e0b" value={kpis?.notesMonth}  loading={kpisLoading} />
          <MiniKPI icon={Clock}       label="Days Since Call"  colour={urgencyColour(lastCallDays)}
            value={lastCallDays !== null ? `${lastCallDays}d` : "—"} loading={kpisLoading} />
          <MiniKPI icon={Activity}    label="Last Modified"    colour="#10b981"
            value={lastModDays !== null ? `${lastModDays}d ago` : "—"} loading={false} />
        </div>

        {/* AI Account Summary */}
        <AccountSummaryPanel company={company} portalId={portalId} />
      </div>

      {/* ── Section 2: Company Overview ── */}
      <Section title="Company Overview" icon={Building2} colour="#06b6d4">
        <Field label="Company Name"        value={p.name} />
        <Field label="Company Type"        value={p.type} />
        <Field label="Lifecycle Stage"     value={p.lifecyclestage} />
        <Field label="Company Status"      value={p.company_status || p.status} />
        <Field label="Owner"               value={ownerName} />
        <Field label="CD Industry"         value={p.cd_industry || p.industry} />
        <Field label="Website"             value={p.website} href={p.website} />
        <Field label="Main Phone"          value={p.phone} />
        <Field label="Main Email"          value={p.email} />
        <Field label="Company Value"       value={p.company_value || p.account_band} />
        <Field label="Payment Terms"       value={p.payment_terms} />
        <Field label="Checks Portal URL"   value={p.checks_portal_url} href={p.checks_portal_url} colour="#10b981" />
        {cdsPortalId ? (
          <div className="py-2 border-b last:border-0" style={{ borderColor: "rgba(128,128,128,0.12)" }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1"
              style={{ color: "rgba(128,128,128,0.70)" }}>CD Portal ID</p>
            <a href={`https://portal.checksdirect.co.uk/admin/view-company.php?id=${cdsPortalId}`}
              target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold hover:opacity-80 transition-opacity"
              style={{ background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.40)", color: "#06b6d4" }}>
              <Hash className="w-3.5 h-3.5 flex-shrink-0" />
              {cdsPortalId}
              <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
            </a>
          </div>
        ) : null}
        <Field label="Registered Company Number" value={p.company_number || p.registration_number} mono />
        <Field label="Created Date"        value={fmtDate(p.createdate)} />
      </Section>

      {/* ── Section 3: Primary Contact ── */}
      <Section title="Primary Contact" icon={User} colour="#10b981">
        {primaryContact ? (
          <>
            <Field label="Contact Name"       value={[cp.firstname, cp.lastname].filter(Boolean).join(" ")} />
            <Field label="Job Title"          value={cp.jobtitle} />
            <Field label="Email"              value={cp.email} href={cp.email ? `mailto:${cp.email}` : null} />
            <Field label="Phone"              value={cp.phone} />
            <Field label="Mobile"             value={cp.mobilephone} />
            <Field label="Last Activity Date" value={fmtDate(cp.hs_lastmodifieddate)} />
            {primaryContact.url && (
              <div className="pt-2">
                <a href={primaryContact.url} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.30)" }}>
                  <ExternalLink className="w-3 h-3" />
                  View Contact in HubSpot
                </a>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm py-2" style={{ color: "rgba(128,128,128,0.70)" }}>No contacts associated</p>
        )}
      </Section>

      {/* ── Section 4: Address ── */}
      <Section title="Address" icon={MapPin} colour="#f59e0b" defaultOpen={false}>
        <Field label="Address Line 1" value={p.address} />
        <Field label="Address Line 2" value={p.address2} />
        <Field label="City"           value={p.city} />
        <Field label="County / State" value={p.state} />
        <Field label="Postcode"       value={p.zip} />
        <Field label="Country"        value={p.country} />
      </Section>

      {/* ── Section 5: Sales & Finance ── */}
      <Section title="Sales & Finance" icon={DollarSign} colour="#8b5cf6" defaultOpen={false}>
        <Field label="Payment Terms"              value={p.payment_terms} />
        <Field label="Credit Limit"               value={p.credit_limit} />
        <Field label="Current FY GP"              value={p.current_fy_gp} />
        <Field label="Previous FY GP"             value={p.previous_fy_gp} />
        <Field label="Last Order Date"            value={fmtDate(p.last_order_date)} />
        <Field label="Last Invoice Date"          value={fmtDate(p.last_invoice_date)} />
        <Field label="Total Checks Last 12 Months" value={p.total_checks_12m} />
        <Field label="Current Products"           value={p.current_products || p.products_used} />
        {!p.payment_terms && !p.credit_limit && !p.current_fy_gp && !p.last_order_date && (
          <p className="text-xs py-2" style={{ color: "rgba(128,128,128,0.60)" }}>
            No financial data available in HubSpot for this account.
          </p>
        )}
      </Section>

      {/* ── Section 6: Activity Intelligence ── */}
      <Section title="Activity Intelligence" icon={Activity} colour="#ec2ca3" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <MiniKPI icon={Phone}    label="Calls (30d)"  colour="#06b6d4" value={kpis?.calls30}  loading={kpisLoading} />
          <MiniKPI icon={Mail}     label="Emails (30d)" colour="#10b981" value={"—"}            loading={false} />
          <MiniKPI icon={CheckSquare} label="Tasks (30d)"  colour="#8b5cf6" value={kpis?.tasks30}  loading={kpisLoading} />
          <MiniKPI icon={FileText} label="Notes (30d)"  colour="#f59e0b" value={kpis?.notes30}  loading={kpisLoading} />
        </div>
        <Field label="Last Call Date"          value={kpis?.lastCallDate ? fmtDate(kpis.lastCallDate) : null} />
        <Field label="Days Since Last Call"
          value={lastCallDays !== null ? `${lastCallDays} days` : null}
          colour={urgencyColour(lastCallDays)} />
        <Field label="Last Modified Date"      value={fmtDate(p.hs_lastmodifieddate)} />
        <Field label="Created Date"            value={fmtDate(p.createdate)} />
        {lastCallDays !== null && lastCallDays > 30 && (
          <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg"
            style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.25)" }}>
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#ef4444" }} />
            <p className="text-xs font-semibold" style={{ color: "#ef4444" }}>
              No call logged in {lastCallDays} days — this account may need attention.
            </p>
          </div>
        )}
      </Section>

      {/* ── Section 7: Quick Actions ── */}
      <Section title="Quick Actions" icon={Zap} colour="#f59e0b">
        <QuickActions company={company} portalId={portalId} onAction={onAction} cdsPortalId={cdsPortalId} />
      </Section>

      {/* ── Section 8: Checks Direct Intelligence ── */}
      <Section title="Checks Direct Intelligence" icon={ShieldCheck} colour="#06b6d4" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-3 mb-3">
          {[
            { label: "Total Checks This Month", value: null },
            { label: "Total Checks This Year",  value: null },
            { label: "Avg Monthly Spend",        value: null },
            { label: "Account Band",             value: p.account_band || null },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg px-3 py-2.5 border"
              style={{ border: "1px solid rgba(6,182,212,0.20)", background: "rgba(6,182,212,0.06)" }}>
              <p className="text-[10px] font-semibold uppercase tracking-wide mb-0.5"
                style={{ color: "rgba(6,182,212,0.70)" }}>{label}</p>
              <p className="text-sm font-bold" style={{ color: value ? "inherit" : "rgba(128,128,128,0.50)" }}>
                {value ?? "—"}
              </p>
            </div>
          ))}
        </div>
        <Field label="Last Check Processed" value={p.last_check_processed ? fmtDate(p.last_check_processed) : null} />
        <Field label="Assigned ACM"          value={ownerName} />
        <Field label="Customer Since"        value={fmtDate(p.customer_since || p.createdate)} />
        <div className="mt-2 px-3 py-2 rounded-lg text-xs"
          style={{ background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.15)", color: "rgba(128,128,128,0.60)" }}>
          Checks Direct portal data integration coming soon. Structure is ready to receive live data.
        </div>
      </Section>

    </div>
  );
}
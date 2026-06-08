import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { CheckSquare, Ticket, Phone, FileText, Clock, Loader2 } from "lucide-react";

function KPICard({ icon: Icon, label, value, colour, subLabel }) {
  return (
    <div className="flex-1 min-w-0 rounded-xl border border-border bg-card p-3 flex flex-col gap-1">
      <div className="flex items-center justify-between gap-1">
        <Icon className={`w-3.5 h-3.5 ${colour} flex-shrink-0`} />
        {value === null ? (
          <Loader2 className="w-3 h-3 text-muted-foreground animate-spin" />
        ) : (
          <span className={`text-lg font-extrabold ${colour}`}>{value}</span>
        )}
      </div>
      <p className="text-[11px] font-semibold text-foreground leading-tight">{label}</p>
      {subLabel && <p className="text-[10px] text-muted-foreground leading-tight">{subLabel}</p>}
    </div>
  );
}

function LastCalledBadge({ lastCallDate }) {
  if (!lastCallDate) return null;

  const date = new Date(lastCallDate);
  const now = new Date();
  const diffDays = Math.floor((now - date) / 86400000);

  let label, colour;
  if (diffDays === 0) { label = "Called today"; colour = "bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"; }
  else if (diffDays <= 7) { label = `Called ${diffDays}d ago`; colour = "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"; }
  else if (diffDays <= 30) { label = `Called ${diffDays}d ago`; colour = "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"; }
  else { label = `Last called ${diffDays}d ago`; colour = "bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"; }

  return (
    <div className="flex items-center gap-1.5">
      <Clock className="w-3 h-3 text-muted-foreground" />
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${colour}`}>
        {label}
      </span>
      <span className="text-[10px] text-muted-foreground">
        {date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
      </span>
    </div>
  );
}

export default function AccountKPICards({ company, portalId }) {
  const [kpis, setKpis] = useState(null);

  const load = useCallback(async () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Fetch all in parallel
    const [tasksRes, ticketsRes, callsRes, notesRes] = await Promise.allSettled([
      base44.functions.invoke("getHubSpotCompanyTasks",   { companyId: company.id, portalId }),
      base44.functions.invoke("getHubSpotCompanyTickets", { companyId: company.id, portalId }),
      base44.functions.invoke("getHubSpotCompanyCalls",   { companyId: company.id, portalId }),
      base44.functions.invoke("getHubSpotCompanyNotes",   { companyId: company.id, portalId }),
    ]);

    const tasks   = tasksRes.status   === "fulfilled" ? (tasksRes.value.data?.tasks     || []) : [];
    const tickets = ticketsRes.status === "fulfilled" ? (ticketsRes.value.data?.tickets  || []) : [];
    const calls   = callsRes.status   === "fulfilled" ? (callsRes.value.data?.calls      || []) : [];
    const notes   = notesRes.status   === "fulfilled" ? (notesRes.value.data?.notes      || []) : [];

    const openTasks   = tasks.filter(t => t.status !== "COMPLETED").length;
    const openTickets = tickets.filter(t => t.isOpen !== false && t.status?.toLowerCase() !== "closed").length;
    const callsMonth  = calls.filter(c => c.callDatetime && c.callDatetime >= startOfMonth).length;
    const notesMonth  = notes.filter(n => n.timestamp && n.timestamp >= startOfMonth).length;

    // Last call date
    const sortedCalls = calls
      .filter(c => c.callDatetime)
      .sort((a, b) => new Date(b.callDatetime) - new Date(a.callDatetime));
    const lastCallDate = sortedCalls[0]?.callDatetime || null;

    setKpis({ openTasks, openTickets, callsMonth, notesMonth, lastCallDate });
  }, [company.id, portalId]);

  useEffect(() => { load(); }, [load]);

  const o = kpis;

  return (
    <div className="space-y-2">
      {/* KPI row */}
      <div className="flex gap-2">
        <KPICard icon={CheckSquare} label="Open Tasks"        colour="text-violet-600 dark:text-violet-400" value={o ? o.openTasks   : null} />
        <KPICard icon={Ticket}      label="Open Tickets"      colour="text-rose-600 dark:text-rose-400"     value={o ? o.openTickets : null} />
        <KPICard icon={Phone}       label="Calls This Month"  colour="text-blue-600 dark:text-blue-400"     value={o ? o.callsMonth  : null} />
        <KPICard icon={FileText}    label="Notes This Month"  colour="text-amber-600 dark:text-amber-400"   value={o ? o.notesMonth  : null} />
      </div>
      {/* Last called badge */}
      {o && <LastCalledBadge lastCallDate={o.lastCallDate} />}
    </div>
  );
}
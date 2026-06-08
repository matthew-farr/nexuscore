import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { AlertTriangle, MessageSquare, Wrench, FileSearch, Ticket, ClipboardList, TrendingUp, TrendingDown, Minus } from "lucide-react";

const KPI_CONFIG = [
  {
    key: "escalations",
    label: "60 Day Escalations",
    icon: AlertTriangle,
    colour: "#ec2ca3",
    route: "/operations/60-day-dbs-escalations",
    // Records awaiting to be escalated
    fetch: () => base44.entities.DBSEscalation.filter({ status: "DUE TO BE ESCALATED" }, "", 500),
    description: "Awaiting escalation",
  },
  {
    key: "cjsm",
    label: "CJSM to be Chased",
    icon: MessageSquare,
    colour: "#7c3aed",
    route: "/dbs-tracker",
    // Waiting on Client 10+ days — same filter as the tracker's "Waiting on Client 10+ days" checkbox
    fetch: () => base44.entities.DBSQueryTracker.list("-date_received", 1000).then(data =>
      (data || []).filter(q => {
        if (q.stage !== "Waiting on Client") return false;
        if (!q.date_sent_to_client) return false;
        const days = Math.floor((new Date() - new Date(q.date_sent_to_client)) / (1000 * 60 * 60 * 24));
        return days >= 10;
      })
    ),
    description: "Waiting on client 10+ days",
  },
  {
    key: "issues",
    label: "Open Operational Issues",
    icon: Wrench,
    colour: "#f59e0b",
    route: "/operations/issue-log",
    // Not archived, not resolved
    fetch: () => base44.entities.OperationsIssue.filter({ is_archived: false }, "", 500).then(data =>
      (data || []).filter(d => d.status !== "Resolved")
    ),
    description: "Active incidents & issues",
  },
  {
    key: "queries",
    label: "Helpdesk Triage Tickets",
    icon: FileSearch,
    colour: "#22d3ee",
    route: "/jira-issues",
    fetch: () => base44.entities.JiraIssue.filter({ issue_type: "Triage", is_active: true }, "", 500),
    description: "Tickets awaiting triage",
  },
  {
    key: "hs_admin",
    label: "Admin Tickets",
    icon: Ticket,
    colour: "#f97316",
    route: "/hubspot-tickets?pipeline=admin",
    // TODO: set pipelineId and stageIds once provided
    fetch: () => base44.functions.invoke("getHubSpotTickets", { pipelineId: "0" }).then(res => ({ length: res.data?.count ?? 0 })),
    description: "Open HubSpot admin tickets",
  },
  {
    key: "hs_bespoke",
    label: "Bespoke Checks",
    icon: ClipboardList,
    colour: "#a78bfa",
    route: "/hubspot-tickets?pipeline=bespoke",
    fetch: () => base44.functions.invoke("getHubSpotTickets", { pipelineId: "3233773772" }).then(res => ({ length: res.data?.count ?? 0 })),
    description: "Open bespoke check tickets",
  },
];

function TrendIcon({ count }) {
  if (count === null) return <Minus className="w-3 h-3 opacity-40" />;
  if (count > 10) return <TrendingUp className="w-3 h-3 text-red-400" />;
  if (count > 5) return <TrendingUp className="w-3 h-3 text-amber-400" />;
  return <TrendingDown className="w-3 h-3 text-emerald-400" />;
}

function statusColour(count) {
  if (count === null) return "rgba(255,255,255,0.2)";
  if (count > 10) return "#ef4444";
  if (count > 5) return "#f59e0b";
  return "#10b981";
}

export default function OpsKPIRow() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const results = {};
      await Promise.allSettled(
        KPI_CONFIG.map(async (k) => {
          try {
            const data = await k.fetch();
            results[k.key] = Array.isArray(data) ? data.length : (typeof data?.length === "number" ? data.length : 0);
          } catch {
            results[k.key] = null;
          }
        })
      );

      setCounts(results);
      setLoading(false);
    };
    fetchAll();
  }, []);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
      {KPI_CONFIG.map((kpi, i) => {
        const Icon = kpi.icon;
        const count = counts[kpi.key] ?? null;
        const sColour = statusColour(count);

        return (
          <motion.button
            key={kpi.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.07 }}
            onClick={() => navigate(kpi.route)}
            className="text-left relative overflow-hidden rounded-2xl p-4 transition-all duration-200 group"
            style={{
              background: "linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
              border: `1px solid rgba(255,255,255,0.08)`,
              backdropFilter: "blur(20px)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.30)",
              cursor: "pointer",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.border = `1px solid ${kpi.colour}40`;
              e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.40), 0 0 20px ${kpi.colour}20`;
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)";
              e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.30)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {/* Status dot top-right */}
            <div className="absolute top-3 right-3 w-2 h-2 rounded-full" style={{ background: sColour, boxShadow: `0 0 6px ${sColour}` }} />

            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${kpi.colour}20`, border: `1px solid ${kpi.colour}35` }}>
                <Icon className="w-4 h-4" style={{ color: kpi.colour }} />
              </div>
            </div>

            <div className="flex items-end gap-2 mb-1">
              <span className="text-3xl font-black leading-none" style={{ color: "#ffffff" }}>
                {loading ? "—" : count === null ? "?" : count}
              </span>
              <TrendIcon count={count} />
            </div>

            <p className="text-xs font-semibold text-white/80 leading-tight mb-0.5">{kpi.label}</p>
            <p className="text-[10px] text-white/35">{kpi.description}</p>
          </motion.button>
        );
      })}
    </div>
  );
}
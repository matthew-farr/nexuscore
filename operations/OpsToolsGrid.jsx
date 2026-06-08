import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, FileSearch, AlertTriangle, MessageSquare, Wrench, Building2, Shield, Factory, BookOpen, Library } from "lucide-react";

const TOOLS = [
  {
    icon: FileSearch,
    colour: "#22d3ee",
    title: "DBS Query Tracker",
    description: "Track, manage and respond to DBS queries from applicants and employers.",
    route: "/dbs-tracker",
    internal: true,
  },
  {
    icon: AlertTriangle,
    colour: "#ec2ca3",
    title: "60 Day Escalation Tracker",
    description: "Manage DBS applications that have exceeded the 60-day processing threshold.",
    route: "/operations/60-day-dbs-escalations",
    internal: true,
  },
  {
    icon: MessageSquare,
    colour: "#7c3aed",
    title: "CJSM Tracker",
    description: "Manage DBS escalation communications via the Criminal Justice Secure Mail service.",
    route: "/operations/60-day-dbs-escalations",
    internal: true,
  },
  {
    icon: Wrench,
    colour: "#f59e0b",
    title: "Operational Issue Log",
    description: "Track incidents, service disruptions and operational issues as they arise.",
    route: "/operations/issue-log",
    internal: true,
  },
  {
    icon: Building2,
    colour: "#10b981",
    title: "Supplier Register",
    description: "Manage supplier relationships, contracts and provider information.",
    route: "/operations/supplier-register",
    internal: true,
  },
  {
    icon: Shield,
    colour: "#0ea5e9",
    title: "DBS Eligibility Guide",
    description: "Decision support tool for determining DBS check eligibility by role and sector.",
    route: "/operations/dbs-eligibility-guide",
    internal: true,
  },
  {
    icon: Factory,
    colour: "#a78bfa",
    title: "Industry Assignment Manager",
    description: "Manage industry ownership, allocations and team assignments.",
    route: null,
    modal: "industry",
  },
  {
    icon: BookOpen,
    colour: "#fb923c",
    title: "Knowledge Gap Register",
    description: "Track missing guidance, undocumented processes and knowledge gaps.",
    route: "/knowledge",
    internal: true,
  },
  {
    icon: Library,
    colour: "#34d399",
    title: "Operational Decision Library",
    description: "Reference library for operational decisions, precedents and escalation outcomes.",
    route: "/knowledge",
    internal: true,
  },
];

export default function OpsToolsGrid({ onOpenIndustryModal }) {
  const navigate = useNavigate();

  const handleClick = (tool) => {
    if (tool.modal === "industry") {
      onOpenIndustryModal?.();
    } else if (tool.route) {
      navigate(tool.route);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-white">Operations Tools</h2>
          <p className="text-xs text-white/40 mt-0.5">Select a tool to get started</p>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-white/25">{TOOLS.length} Tools</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {TOOLS.map((tool, i) => {
          const Icon = tool.icon;
          return (
            <motion.button
              key={tool.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 + i * 0.04 }}
              onClick={() => handleClick(tool)}
              className="text-left relative overflow-hidden rounded-2xl p-5 transition-all duration-200 group"
              style={{
                background: "linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.025) 100%)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.30)",
                cursor: "pointer",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = `linear-gradient(145deg, ${tool.colour}14 0%, ${tool.colour}06 100%)`;
                e.currentTarget.style.border = `1px solid ${tool.colour}35`;
                e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.40), 0 0 24px ${tool.colour}18`;
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.025) 100%)";
                e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)";
                e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.30)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${tool.colour}20`, border: `1.5px solid ${tool.colour}35`, boxShadow: `0 0 14px ${tool.colour}20` }}>
                  <Icon className="w-5 h-5" style={{ color: tool.colour }} />
                </div>
                <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0 mt-1" />
              </div>

              <h3 className="text-sm font-bold text-white mb-1.5 leading-snug">{tool.title}</h3>
              <p className="text-xs text-white/50 leading-relaxed">{tool.description}</p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
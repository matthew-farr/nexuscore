import { useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import {
  Sparkles, RefreshCw, Loader2, AlertCircle, ChevronDown, ChevronUp,
  MessageSquare, ListChecks, ShieldAlert, TrendingUp, Users
} from "lucide-react";

const SECTION_CONFIG = [
  { key: "relationship",  label: "Relationship Summary",  icon: Users,         colour: "text-cyan-600 dark:text-cyan-400" },
  { key: "topics",        label: "Key Discussion Topics", icon: MessageSquare, colour: "text-blue-600 dark:text-blue-400" },
  { key: "outstanding",   label: "Outstanding Actions",   icon: ListChecks,    colour: "text-amber-600 dark:text-amber-400" },
  { key: "risks",         label: "Risks",                 icon: ShieldAlert,   colour: "text-rose-600 dark:text-rose-400" },
  { key: "opportunities", label: "Opportunities",         icon: TrendingUp,    colour: "text-green-600 dark:text-green-400" },
];

function buildPrompt(companyName, companyProps, activities) {
  const p = companyProps || {};
  const companyContext = [
    p.domain && `Domain: ${p.domain}`,
    p.industry && `Industry: ${p.industry}`,
    p.lifecyclestage && `Lifecycle Stage: ${p.lifecyclestage}`,
    p.city && `City: ${p.city}`,
    p.phone && `Phone: ${p.phone}`,
  ].filter(Boolean).join(" | ");

  const snippets = activities.slice(0, 80).map(a => {
    const d = a.date ? new Date(a.date).toLocaleDateString("en-GB") : "unknown date";
    return `[${a.activityType.toUpperCase()} – ${d}] ${a.title}${a.description ? ": " + a.description.slice(0, 300) : ""}`;
  }).join("\n");

  return `You are an expert sales analyst. Based on the full HubSpot CRM account data for "${companyName}", generate a concise account intelligence briefing.

COMPANY PROFILE:
${companyContext || "No profile data available."}

FULL ACTIVITY HISTORY (${activities.length} items):
${snippets || "No activity recorded."}

Return a JSON object with exactly these keys:
- relationship: (string) 2–4 sentence overview of current relationship health, engagement frequency, and overall account status
- topics: (array of strings) up to 6 key discussion topics or recurring themes from recent interactions
- outstanding: (array of strings) up to 6 outstanding actions, open tasks or follow-ups that need attention
- risks: (array of strings) up to 5 potential risks, concerns or warning signals identified from the account data
- opportunities: (array of strings) up to 5 commercial, upsell or relationship growth opportunities identified

Be specific and actionable. Ground every point in the actual data provided. If data is insufficient for a section, say so briefly.`;
}

export default function AccountSummaryPanel({ company, portalId }) {
  const [summary,     setSummary]     = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);
  const [collapsed,   setCollapsed]   = useState(false);
  const [generatedAt, setGeneratedAt] = useState(null);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch the full timeline from HubSpot to get all activity
      const timelineRes = await base44.functions.invoke("getHubSpotCompanyTimeline", {
        companyId: company.id,
        portalId,
      });
      const activities = timelineRes.data?.activities || [];

      const prompt = buildPrompt(
        company.properties?.name || company.id,
        company.properties,
        activities
      );

      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            relationship:  { type: "string" },
            topics:        { type: "array", items: { type: "string" } },
            outstanding:   { type: "array", items: { type: "string" } },
            risks:         { type: "array", items: { type: "string" } },
            opportunities: { type: "array", items: { type: "string" } },
          },
        },
      });

      setSummary(res);
      setGeneratedAt(new Date());
      setCollapsed(false);
    } catch (e) {
      setError("Failed to generate summary. Please try again.");
    }
    setLoading(false);
  }, [company, portalId]);

  // ── Not yet generated ─────────────────────────────────────────────────────
  if (!summary && !loading && !error) {
    return (
      <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-foreground">AI Account Summary</p>
            <p className="text-[11px] text-muted-foreground">
              Fetch all notes, calls, tasks &amp; tickets to generate an account intelligence briefing
            </p>
          </div>
        </div>
        <button
          onClick={generate}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex-shrink-0"
        >
          <Sparkles className="w-3 h-3" />
          Generate
        </button>
      </div>
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center gap-3">
        <Loader2 className="w-4 h-4 text-primary animate-spin flex-shrink-0" />
        <div>
          <p className="text-xs font-bold text-foreground">Generating AI Summary…</p>
          <p className="text-[11px] text-muted-foreground">Fetching &amp; analysing full account history</p>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
          <p className="text-xs text-destructive">{error}</p>
        </div>
        <button onClick={generate} className="text-xs font-semibold text-primary hover:underline flex-shrink-0">Retry</button>
      </div>
    );
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  return (
    <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-primary/10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-bold text-foreground">AI Account Summary</span>
          {generatedAt && (
            <span className="text-[10px] text-muted-foreground">
              · {generatedAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={generate}
            disabled={loading}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
          <button
            onClick={() => setCollapsed(v => !v)}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Body */}
      {!collapsed && (
        <div className="p-4 space-y-4">
          {SECTION_CONFIG.map(({ key, label, icon: Icon, colour }) => {
            const value = summary[key];
            if (!value || (Array.isArray(value) && value.length === 0)) return null;
            return (
              <div key={key}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Icon className={`w-3.5 h-3.5 ${colour} flex-shrink-0`} />
                  <span className="text-[11px] font-bold text-foreground uppercase tracking-wide">{label}</span>
                </div>
                {typeof value === "string" ? (
                  <p className="text-xs text-foreground leading-relaxed pl-5">{value}</p>
                ) : (
                  <ul className="space-y-1 pl-5">
                    {value.map((item, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-foreground">
                        <span className="flex-shrink-0 mt-1.5 w-1 h-1 rounded-full bg-muted-foreground/50" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
/**
 * Sales-specific widgets:
 * Leaderboard, Target Tracker, Forecast, Pipeline, Top Opportunities, Proposals
 */
import { TrendingUp, Target, Star, Trophy, FileText, Award } from "lucide-react";

function WidgetShell({ title, icon: Icon, theme, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {Icon && (
          <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: theme.iconBg, border: `1px solid ${theme.iconBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon style={{ width: "13px", height: "13px", color: theme.primary }} />
          </div>
        )}
        <span style={{ fontSize: "13px", fontWeight: 700, color: theme.text, opacity: 0.85 }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function ComingSoon({ theme }) {
  return <p style={{ fontSize: "12px", color: theme.textSubtle, textAlign: "center", padding: "16px 0" }}>Coming soon — connect your CRM</p>;
}

// ─────────────────────────────────────────
// TARGET TRACKER
// ─────────────────────────────────────────
export function TargetTrackerWidget({ config, theme }) {
  const { target = 100000, current = 64200, period = "Monthly", unit = "£" } = config || {};
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const fmt = (v) => unit === "£" ? `£${Number(v).toLocaleString()}` : `${v}${unit}`;

  return (
    <WidgetShell title="Target Tracker" icon={Target} theme={theme}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: "22px", fontWeight: 800, color: theme.text, letterSpacing: "-0.5px" }}>{fmt(current)}</div>
          <div style={{ fontSize: "11px", color: theme.textMuted }}>of {fmt(target)} {period} Target</div>
        </div>
        <div style={{ fontSize: "22px", fontWeight: 800, color: theme.primary }}>{pct.toFixed(0)}%</div>
      </div>
      <div style={{ height: "8px", borderRadius: "4px", background: theme.surface, overflow: "hidden", border: `1px solid ${theme.border}` }}>
        <div style={{ height: "100%", width: `${pct}%`, borderRadius: "4px", background: `linear-gradient(90deg, ${theme.primary}, ${theme.primary}bb)`, transition: "width 0.5s ease", boxShadow: theme.glow }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: "10px", color: theme.textSubtle }}>0</span>
        <span style={{ fontSize: "10px", color: theme.textSubtle }}>{fmt(target)}</span>
      </div>
    </WidgetShell>
  );
}

// ─────────────────────────────────────────
// LEADERBOARD
// ─────────────────────────────────────────
const DEMO_LEADERS = [
  { name: "Sarah K.", value: "£48,200", rank: 1 },
  { name: "James P.", value: "£41,900", rank: 2 },
  { name: "Rachel M.", value: "£38,100", rank: 3 },
  { name: "Tom B.", value: "£29,400", rank: 4 },
  { name: "Anna C.", value: "£24,000", rank: 5 },
];

export function LeaderboardWidget({ config, theme }) {
  const { maxItems = 5 } = config || {};
  const rankColors = ["#f59e0b", "#94a3b8", "#b45309"];

  return (
    <WidgetShell title="Leaderboard" icon={Trophy} theme={theme}>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {DEMO_LEADERS.slice(0, maxItems).map((leader) => (
          <div key={leader.rank} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "7px 10px", borderRadius: "8px", background: theme.surface, border: `1px solid ${theme.border}` }}>
            <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: rankColors[leader.rank - 1] || theme.surface, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 800, color: leader.rank <= 3 ? "#000" : theme.textMuted, flexShrink: 0 }}>
              {leader.rank <= 3 ? "🏆 🥈 🥉"[((leader.rank - 1) * 2)] : leader.rank}
            </div>
            <div style={{ fontSize: "12px", fontWeight: 600, color: theme.text, flex: 1 }}>{leader.name}</div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: theme.primary }}>{leader.value}</div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: "10px", color: theme.textSubtle, textAlign: "center" }}>Demo data — connect your CRM for live figures</p>
    </WidgetShell>
  );
}

// ─────────────────────────────────────────
// FORECAST WIDGET
// ─────────────────────────────────────────
export function ForecastWidget({ config, theme }) {
  const { period = "Monthly" } = config || {};
  const bars = [
    { label: "Closed Won", value: 64, colour: "#10b981" },
    { label: "Committed", value: 23, colour: theme.primary },
    { label: "Best Case", value: 13, colour: `${theme.primary}60` },
  ];

  return (
    <WidgetShell title={`${period} Forecast`} icon={TrendingUp} theme={theme}>
      <div style={{ fontSize: "22px", fontWeight: 800, color: theme.text, letterSpacing: "-0.5px" }}>£127,400</div>
      <div style={{ fontSize: "11px", color: theme.textMuted, marginTop: "-6px" }}>vs £110,000 target</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
        {bars.map(b => (
          <div key={b.label}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
              <span style={{ fontSize: "11px", color: theme.textMuted }}>{b.label}</span>
              <span style={{ fontSize: "11px", fontWeight: 600, color: theme.text }}>{b.value}%</span>
            </div>
            <div style={{ height: "5px", borderRadius: "3px", background: theme.surface }}>
              <div style={{ height: "100%", width: `${b.value}%`, borderRadius: "3px", background: b.colour, transition: "width 0.4s ease" }} />
            </div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: "10px", color: theme.textSubtle, textAlign: "center" }}>Demo — connect your CRM for live data</p>
    </WidgetShell>
  );
}

// ─────────────────────────────────────────
// SALES PIPELINE WIDGET
// ─────────────────────────────────────────
export function SalesPipelineWidget({ config, theme }) {
  const stages = [
    { label: "Prospecting", count: 12, value: "£84k" },
    { label: "Qualified", count: 8, value: "£62k" },
    { label: "Proposal", count: 5, value: "£41k" },
    { label: "Negotiation", count: 3, value: "£28k" },
    { label: "Closed Won", count: 7, value: "£55k" },
  ];

  return (
    <WidgetShell title="Sales Pipeline" icon={TrendingUp} theme={theme}>
      <div style={{ display: "flex", gap: "6px" }}>
        {stages.map((s, i) => (
          <div key={s.label} style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ height: `${40 + (stages.length - i) * 12}px`, borderRadius: "6px 6px 0 0", background: `${theme.primary}${Math.round(40 + (stages.length - i) * 15).toString(16)}`, border: `1px solid ${theme.border}`, position: "relative" }}>
              <span style={{ position: "absolute", bottom: "4px", left: "50%", transform: "translateX(-50%)", fontSize: "10px", fontWeight: 800, color: "#fff" }}>{s.count}</span>
            </div>
            <div style={{ fontSize: "9px", color: theme.textSubtle, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.label}</div>
            <div style={{ fontSize: "10px", fontWeight: 600, color: theme.primary, textAlign: "center" }}>{s.value}</div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: "10px", color: theme.textSubtle, textAlign: "center" }}>Demo — connect your CRM for live pipeline</p>
    </WidgetShell>
  );
}

// ─────────────────────────────────────────
// TOP OPPORTUNITIES WIDGET
// ─────────────────────────────────────────
export function TopOpportunitiesWidget({ config, theme }) {
  const opps = [
    { name: "TechCorp Enterprise", value: "£24,000", stage: "Proposal" },
    { name: "GlobalBank Ltd", value: "£18,500", stage: "Negotiation" },
    { name: "HealthPlus Group", value: "£15,200", stage: "Qualified" },
  ];
  const { maxItems = 5 } = config || {};

  return (
    <WidgetShell title="Top Opportunities" icon={Star} theme={theme}>
      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
        {opps.slice(0, maxItems).map((o, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", borderRadius: "8px", background: theme.surface, border: `1px solid ${theme.border}` }}>
            <Star style={{ width: "12px", height: "12px", color: theme.primary, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "12px", fontWeight: 600, color: theme.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.name}</div>
              <div style={{ fontSize: "10px", color: theme.textMuted }}>{o.stage}</div>
            </div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: theme.primary, flexShrink: 0 }}>{o.value}</div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: "10px", color: theme.textSubtle, textAlign: "center" }}>Demo data — connect your CRM</p>
    </WidgetShell>
  );
}

// ─────────────────────────────────────────
// PROPOSALS WIDGET
// ─────────────────────────────────────────
export function ProposalWidget({ config, theme }) {
  return (
    <WidgetShell title="Proposals" icon={FileText} theme={theme}>
      <ComingSoon theme={theme} />
    </WidgetShell>
  );
}
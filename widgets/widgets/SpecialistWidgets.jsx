/**
 * Specialist widgets for Compliance, Operations, Learning, and AI hubs
 */
import { ShieldCheck, AlertTriangle, ClipboardCheck, ListChecks, AlertOctagon, Activity, GitBranch, BarChart2, GraduationCap, ClipboardList, Award, AlarmClock, Sparkles, Wand2, Search } from "lucide-react";
import { useState } from "react";

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

function PlaceholderMsg({ text, theme }) {
  return <p style={{ fontSize: "12px", color: theme.textSubtle, textAlign: "center", padding: "16px 0" }}>{text}</p>;
}

// ─── COMPLIANCE ───────────────────────────────────────────────────
export function ComplianceStatusWidget({ config, theme }) {
  const items = [
    { label: "DBS Checks", status: "Compliant", colour: "#10b981" },
    { label: "RTW Verifications", status: "Compliant", colour: "#10b981" },
    { label: "AML Reviews", status: "2 Pending", colour: "#f59e0b" },
    { label: "Data Audits", status: "Overdue", colour: "#ef4444" },
  ];
  return (
    <WidgetShell title="Compliance Status" icon={ShieldCheck} theme={theme}>
      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", borderRadius: "8px", background: theme.surface, border: `1px solid ${theme.border}` }}>
            <span style={{ fontSize: "12px", color: theme.text }}>{item.label}</span>
            <span style={{ fontSize: "11px", fontWeight: 700, color: item.colour, background: `${item.colour}15`, padding: "2px 8px", borderRadius: "4px" }}>{item.status}</span>
          </div>
        ))}
      </div>
      <p style={{ fontSize: "10px", color: theme.textSubtle, textAlign: "center" }}>Demo data — connect your compliance system</p>
    </WidgetShell>
  );
}

export function ExpiringCertsWidget({ config, theme }) {
  const { daysAhead = 60 } = config || {};
  return (
    <WidgetShell title="Expiring Certifications" icon={AlertTriangle} theme={theme}>
      <div style={{ padding: "12px", borderRadius: "8px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", textAlign: "center" }}>
        <AlertTriangle style={{ width: "20px", height: "20px", color: "#f59e0b", margin: "0 auto 6px" }} />
        <div style={{ fontSize: "12px", color: theme.text }}>3 certifications expiring in {daysAhead} days</div>
        <div style={{ fontSize: "11px", color: theme.textSubtle, marginTop: "3px" }}>Connect your compliance system</div>
      </div>
    </WidgetShell>
  );
}

export function PolicyAcknowledgementWidget({ config, theme }) {
  return (
    <WidgetShell title="Policy Acknowledgements" icon={ClipboardCheck} theme={theme}>
      <PlaceholderMsg text="No pending policy acknowledgements" theme={theme} />
    </WidgetShell>
  );
}

export function AuditActionsWidget({ config, theme }) {
  return (
    <WidgetShell title="Audit Actions" icon={ListChecks} theme={theme}>
      <PlaceholderMsg text="No open audit actions — connect your audit system" theme={theme} />
    </WidgetShell>
  );
}

// ─── OPERATIONS ───────────────────────────────────────────────────
export function OperationalAlertsWidget({ config, theme }) {
  const alerts = [
    { text: "High volume of DBS submissions today", type: "warning" },
    { text: "3 supplier invoices pending approval", type: "info" },
    { text: "System maintenance window tonight 22:00–23:00", type: "info" },
  ];
  const { maxItems = 5 } = config || {};
  return (
    <WidgetShell title="Operational Alerts" icon={AlertOctagon} theme={theme}>
      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
        {alerts.slice(0, maxItems).map((a, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "8px 10px", borderRadius: "8px", background: a.type === "warning" ? "rgba(245,158,11,0.08)" : theme.surface, border: `1px solid ${a.type === "warning" ? "rgba(245,158,11,0.25)" : theme.border}` }}>
            <AlertOctagon style={{ width: "12px", height: "12px", color: a.type === "warning" ? "#f59e0b" : theme.primary, flexShrink: 0, marginTop: "1px" }} />
            <span style={{ fontSize: "12px", color: theme.text }}>{a.text}</span>
          </div>
        ))}
      </div>
    </WidgetShell>
  );
}

export function ServiceStatusWidget({ config, theme }) {
  const services = [
    { name: "CERTN API", status: "Online" },
    { name: "Companies House", status: "Online" },
    { name: "DBS Portal", status: "Online" },
    { name: "Docusign", status: "Degraded" },
  ];
  const statusColour = { Online: "#10b981", Degraded: "#f59e0b", Offline: "#ef4444" };
  return (
    <WidgetShell title="Service Status" icon={Activity} theme={theme}>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {services.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 10px", borderRadius: "7px", background: theme.surface }}>
            <span style={{ fontSize: "12px", color: theme.text }}>{s.name}</span>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: statusColour[s.status] || theme.primary }} />
              <span style={{ fontSize: "11px", fontWeight: 600, color: statusColour[s.status] || theme.primary }}>{s.status}</span>
            </div>
          </div>
        ))}
      </div>
    </WidgetShell>
  );
}

export function WorkflowQueueWidget({ config, theme }) {
  return (
    <WidgetShell title="Workflow Queue" icon={GitBranch} theme={theme}>
      <PlaceholderMsg text="No items in queue — connect your workflow system" theme={theme} />
    </WidgetShell>
  );
}

export function ProcessingVolumesWidget({ config, theme }) {
  const { period = "Daily" } = config || {};
  const bars = [
    { label: "Mon", value: 45 }, { label: "Tue", value: 62 }, { label: "Wed", value: 38 },
    { label: "Thu", value: 71 }, { label: "Fri", value: 55 }, { label: "Sat", value: 12 }, { label: "Sun", value: 8 },
  ];
  const max = Math.max(...bars.map(b => b.value));
  return (
    <WidgetShell title={`${period} Processing`} icon={BarChart2} theme={theme}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: "60px" }}>
        {bars.map(b => (
          <div key={b.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
            <div style={{ width: "100%", height: `${(b.value / max) * 48}px`, borderRadius: "3px 3px 0 0", background: `${theme.primary}80`, transition: "height 0.4s" }} />
            <span style={{ fontSize: "9px", color: theme.textSubtle }}>{b.label}</span>
          </div>
        ))}
      </div>
    </WidgetShell>
  );
}

// ─── LEARNING ────────────────────────────────────────────────────
export function MyLearningWidget({ config, theme }) {
  const courses = [
    { name: "Data Protection Essentials", progress: 75 },
    { name: "DBS Process Refresher", progress: 40 },
    { name: "Sales Fundamentals", progress: 20 },
  ];
  return (
    <WidgetShell title="My Learning" icon={GraduationCap} theme={theme}>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {courses.map((c, i) => (
          <div key={i} style={{ padding: "8px 10px", borderRadius: "8px", background: theme.surface, border: `1px solid ${theme.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: theme.text }}>{c.name}</span>
              <span style={{ fontSize: "11px", fontWeight: 700, color: theme.primary }}>{c.progress}%</span>
            </div>
            <div style={{ height: "4px", borderRadius: "2px", background: theme.border }}>
              <div style={{ height: "100%", width: `${c.progress}%`, borderRadius: "2px", background: theme.primary, transition: "width 0.4s" }} />
            </div>
          </div>
        ))}
      </div>
    </WidgetShell>
  );
}

export function AssignedTrainingWidget({ config, theme }) {
  return (
    <WidgetShell title="Assigned Training" icon={ClipboardList} theme={theme}>
      <PlaceholderMsg text="No assigned training — connect your LMS" theme={theme} />
    </WidgetShell>
  );
}

export function CertificatesWidget({ config, theme }) {
  return (
    <WidgetShell title="Certificates & Badges" icon={Award} theme={theme}>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {["Data Protection", "Sales Excellence", "Compliance Pro"].map((cert, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "6px 10px", borderRadius: "6px", background: theme.surface, border: `1px solid ${theme.border}` }}>
            <Award style={{ width: "12px", height: "12px", color: theme.primary }} />
            <span style={{ fontSize: "11px", fontWeight: 600, color: theme.text }}>{cert}</span>
          </div>
        ))}
      </div>
    </WidgetShell>
  );
}

export function TrainingDueWidget({ config, theme }) {
  const { daysAhead = 30 } = config || {};
  return (
    <WidgetShell title="Training Due Soon" icon={AlarmClock} theme={theme}>
      <div style={{ padding: "10px 12px", borderRadius: "8px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}>
        <div style={{ fontSize: "12px", fontWeight: 600, color: "#ef4444" }}>1 training due in {daysAhead} days</div>
        <div style={{ fontSize: "11px", color: theme.textSubtle, marginTop: "2px" }}>GDPR Refresher — due soon</div>
      </div>
    </WidgetShell>
  );
}

// ─── AI ────────────────────────────────────────────────────────────
export function AiRecommendedWidget({ config, theme }) {
  const items = ["DBS Enhanced Process Guide", "Overseas Check Pricing Update", "Q2 Sales Playbook", "New Client Onboarding Template"];
  const { maxItems = 4 } = config || {};
  return (
    <WidgetShell title="AI Recommended" icon={Sparkles} theme={theme}>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {items.slice(0, maxItems).map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 10px", borderRadius: "7px", background: theme.surface, border: `1px solid ${theme.border}`, cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.background = theme.surfaceHover}
            onMouseLeave={e => e.currentTarget.style.background = theme.surface}
          >
            <Sparkles style={{ width: "11px", height: "11px", color: theme.primary, flexShrink: 0 }} />
            <span style={{ fontSize: "12px", color: theme.text }}>{item}</span>
          </div>
        ))}
      </div>
    </WidgetShell>
  );
}

export function AiSuggestedActionsWidget({ config, theme }) {
  const actions = ["Follow up with TechCorp — proposal sent 3 days ago", "Review 2 expiring DBS checks", "Prepare Q2 forecast for team meeting"];
  return (
    <WidgetShell title="AI Suggested Actions" icon={Wand2} theme={theme}>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {actions.map((a, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "8px 10px", borderRadius: "7px", background: theme.surface, border: `1px solid ${theme.border}` }}>
            <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: theme.primary, flexShrink: 0, marginTop: "5px" }} />
            <span style={{ fontSize: "12px", color: theme.text }}>{a}</span>
          </div>
        ))}
      </div>
    </WidgetShell>
  );
}

export function AiKnowledgeSearchWidget({ config, theme }) {
  const [query, setQuery] = useState("");
  const { placeholder = "Ask anything about Checks Direct…" } = config || {};
  return (
    <WidgetShell title="AI Knowledge Search" icon={Search} theme={theme}>
      <div style={{ display: "flex", gap: "6px" }}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={placeholder}
          style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", background: theme.surface, border: `1px solid ${theme.border}`, color: theme.text, fontSize: "12px", outline: "none", fontFamily: "inherit" }}
        />
        <button style={{ padding: "8px 12px", borderRadius: "8px", background: theme.buttonBg, color: "#fff", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
          Ask
        </button>
      </div>
    </WidgetShell>
  );
}
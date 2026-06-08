/**
 * WidgetRenderer — maps widget_type → component and renders it inside a styled card.
 * Used on live hub tab pages.
 */
import { useTheme } from "../ThemeProvider";
import { buildHubTheme } from "@/lib/hubTheme";
import { motion } from "framer-motion";
import { Settings, EyeOff } from "lucide-react";

// Core
import {
  CalendarWidget, QuickLinksWidget, AnnouncementsWidget, NotificationsWidget,
  ActivityFeedWidget, KpiWidget, ResourceLibraryWidget, EmbedWidget,
  AiAssistantWidget, TasksWidget,
} from "./widgets/CoreWidgets";

// Sales
import {
  TargetTrackerWidget, LeaderboardWidget, ForecastWidget, SalesPipelineWidget,
  TopOpportunitiesWidget, ProposalWidget,
} from "./widgets/SalesWidgets";

// Specialist
import {
  ComplianceStatusWidget, ExpiringCertsWidget, PolicyAcknowledgementWidget, AuditActionsWidget,
  OperationalAlertsWidget, ServiceStatusWidget, WorkflowQueueWidget, ProcessingVolumesWidget,
  MyLearningWidget, AssignedTrainingWidget, CertificatesWidget, TrainingDueWidget,
  AiRecommendedWidget, AiSuggestedActionsWidget, AiKnowledgeSearchWidget,
} from "./widgets/SpecialistWidgets";

const WIDGET_MAP = {
  // Core
  calendar: CalendarWidget,
  quick_links: QuickLinksWidget,
  announcements: AnnouncementsWidget,
  notifications: NotificationsWidget,
  activity_feed: ActivityFeedWidget,
  kpi: KpiWidget,
  resource_library: ResourceLibraryWidget,
  powerbi_embed: (props) => <EmbedWidget {...props} type="powerbi_embed" />,
  dashboard_embed: (props) => <EmbedWidget {...props} type="dashboard_embed" />,
  external_launcher: QuickLinksWidget,
  tasks: TasksWidget,
  ai_assistant: AiAssistantWidget,
  // Sales
  target_tracker: TargetTrackerWidget,
  leaderboard: LeaderboardWidget,
  forecast: ForecastWidget,
  sales_pipeline: SalesPipelineWidget,
  top_opportunities: TopOpportunitiesWidget,
  proposal_widget: ProposalWidget,
  // Compliance
  compliance_status: ComplianceStatusWidget,
  expiring_certs: ExpiringCertsWidget,
  policy_acknowledgement: PolicyAcknowledgementWidget,
  audit_actions: AuditActionsWidget,
  // Operations
  operational_alerts: OperationalAlertsWidget,
  service_status: ServiceStatusWidget,
  workflow_queue: WorkflowQueueWidget,
  processing_volumes: ProcessingVolumesWidget,
  // Learning
  my_learning: MyLearningWidget,
  assigned_training: AssignedTrainingWidget,
  certificates: CertificatesWidget,
  training_due: TrainingDueWidget,
  // AI
  ai_recommended: AiRecommendedWidget,
  ai_suggested_actions: AiSuggestedActionsWidget,
  ai_knowledge_search: AiKnowledgeSearchWidget,
};

/**
 * WidgetCard — outer shell with glass card styling
 */
function WidgetCard({ theme, children, size, delay = 0 }) {
  const isKpi = size === "kpi";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay }}
      style={{
        background: theme.card,
        border: `1px solid ${theme.borderSubtle}`,
        borderRadius: "14px",
        padding: isKpi ? "16px 18px" : "16px 18px",
        backdropFilter: "blur(8px)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        minHeight: "80px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * WidgetRenderer — renders a single widget record.
 * @param {object} widget  — HubContentItem record with widget_type in config_json
 * @param {string} accentColour — hub accent colour
 * @param {number} delay
 */
export default function WidgetRenderer({ widget, accentColour = "#ec2ca3", delay = 0 }) {
  const { theme: themeMode } = useTheme();
  const isDark = themeMode === "dark";
  const theme = buildHubTheme(accentColour, isDark);

  const widgetType = widget?.widget_type || widget?.config_json?.widget_type || "announcements";
  const config = widget?.config_json || {};
  const hubKey = widget?.hub_key || "sales";

  const Component = WIDGET_MAP[widgetType];

  if (!Component) {
    return (
      <WidgetCard theme={theme} delay={delay}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: theme.textSubtle, fontSize: "12px" }}>
          <Settings style={{ width: "14px", height: "14px" }} />
          Unknown widget type: {widgetType}
        </div>
      </WidgetCard>
    );
  }

  // Inject hub_key into config so widgets can scope their queries
  const enrichedConfig = { ...config, hub_key: config.hub_key || hubKey };

  return (
    <WidgetCard theme={theme} size={widgetType === "kpi" ? "kpi" : null} delay={delay}>
      <Component config={enrichedConfig} theme={theme} hubKey={hubKey} />
    </WidgetCard>
  );
}
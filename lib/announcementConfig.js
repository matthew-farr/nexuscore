import {
  Building2,
  Settings,
  TrendingUp,
  BookOpen,
  ShieldAlert,
  AlertTriangle,
  Lightbulb,
  Users,
} from "lucide-react";

export const categoryConfig = {
  company_update: {
    label: "Company Update",
    colour: "#22d3ee",
    icon: Building2,
    description: "General company announcements",
  },
  operations: {
    label: "Operations",
    colour: "#06b6d4",
    icon: Settings,
    description: "Operations-related updates",
  },
  sales: {
    label: "Sales",
    colour: "#10b981",
    icon: TrendingUp,
    description: "Sales and business updates",
  },
  training: {
    label: "Training",
    colour: "#f59e0b",
    icon: BookOpen,
    description: "Training and learning materials",
  },
  compliance: {
    label: "Compliance",
    colour: "#a855f7",
    icon: ShieldAlert,
    description: "Compliance and regulatory updates",
  },
  system: {
    label: "System",
    colour: "#8b5cf6",
    icon: AlertTriangle,
    description: "System maintenance and alerts",
  },
  product: {
    label: "Product",
    colour: "#ec2ca3",
    icon: Lightbulb,
    description: "Product updates and features",
  },
  people: {
    label: "People",
    colour: "#3b82f6",
    icon: Users,
    description: "Team and people updates",
  },
};

export function getCategoryConfig(category) {
  return categoryConfig[category] || categoryConfig.company_update;
}
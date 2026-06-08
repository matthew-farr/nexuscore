import {
  Building2,
  BookOpen,
  Users,
  Cake,
  Gift,
  Clock,
  Bell,
  ShieldAlert,
  Cog,
} from "lucide-react";

export const eventTypeConfig = {
  company_event: {
    label: "Company Event",
    colour: "#22d3ee",
    icon: Building2,
    description: "Company-wide event or announcement",
  },
  training: {
    label: "Training",
    colour: "#f59e0b",
    icon: BookOpen,
    description: "Training or learning session",
  },
  meeting: {
    label: "Meeting",
    colour: "#8b5cf6",
    icon: Users,
    description: "Team or group meeting",
  },
  birthday: {
    label: "Birthday",
    colour: "#ec2ca3",
    icon: Cake,
    description: "Team member birthday",
  },
  anniversary: {
    label: "Anniversary",
    colour: "#10b981",
    icon: Gift,
    description: "Work anniversary",
  },
  deadline: {
    label: "Deadline",
    colour: "#ef4444",
    icon: Clock,
    description: "Project or submission deadline",
  },
  announcement: {
    label: "Announcement",
    colour: "#06b6d4",
    icon: Bell,
    description: "Important announcement",
  },
  compliance: {
    label: "Compliance",
    colour: "#a855f7",
    icon: ShieldAlert,
    description: "Compliance or audit event",
  },
  system: {
    label: "System",
    colour: "#6b7280",
    icon: Cog,
    description: "System maintenance or downtime",
  },
};

export function getEventTypeConfig(eventType) {
  return eventTypeConfig[eventType] || eventTypeConfig.system;
}
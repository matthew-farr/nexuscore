import { Phone, FileText, ListTodo, ExternalLink } from "lucide-react";
import { useTheme } from "../../ThemeProvider";

const ACTIONS = [
  { key: "call",    label: "Log Call",    icon: Phone,       colour: "#06b6d4" },
  { key: "note",    label: "Add Note",    icon: FileText,    colour: "#f59e0b" },
  { key: "task",    label: "Create Task", icon: ListTodo,    colour: "#8b5cf6" },
  { key: "hubspot", label: "HubSpot",     icon: ExternalLink,colour: "#ec2ca3",
    href: "https://app-eu1.hubspot.com/" },
];

export default function CRMQuickActions({ selectedCompany, onAction, isDark }) {
  const handleClick = (action) => {
    if (action.href) {
      window.open(action.href, "_blank");
      return;
    }
    onAction(action.key);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {ACTIONS.map(action => {
        const Icon = action.icon;
        return (
          <button
            key={action.key}
            onClick={() => handleClick(action)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all hover:opacity-80 active:scale-95"
            style={{
              background: `${action.colour}15`,
              border: `1px solid ${action.colour}30`,
              color: action.colour,
            }}
          >
            <Icon className="w-3.5 h-3.5" />
            {action.label}
          </button>
        );
      })}
    </div>
  );
}
import { cn } from "@/lib/utils";

export default function SectionHeader({ title, action, actionLabel = "View all", className }) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      <h3 className="text-sm font-bold text-foreground tracking-tight">{title}</h3>
      {action && (
        <button
          onClick={action}
          className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
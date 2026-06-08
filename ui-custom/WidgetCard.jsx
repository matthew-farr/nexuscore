import GlassCard from "./GlassCard";
import SectionHeader from "./SectionHeader";
import { cn } from "@/lib/utils";

export default function WidgetCard({ title, action, actionLabel, children, className, delay = 0 }) {
  return (
    <GlassCard delay={delay} className={cn("", className)}>
      <SectionHeader title={title} action={action} actionLabel={actionLabel} />
      {children}
    </GlassCard>
  );
}
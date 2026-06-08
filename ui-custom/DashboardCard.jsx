import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function DashboardCard({ title, value, subtitle, icon: Icon, trend, delay = 0, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn("glass rounded-2xl p-5 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300", className)}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        )}
      </div>
      {trend && (
        <p className={cn("text-xs mt-3 font-medium", trend > 0 ? "text-emerald-500" : "text-red-400")}>
          {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}% vs last month
        </p>
      )}
    </motion.div>
  );
}
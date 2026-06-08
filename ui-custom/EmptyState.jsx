import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function EmptyState({ icon: Icon, message, className }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("flex flex-col items-center justify-center py-8 text-muted-foreground", className)}
    >
      {Icon && <Icon className="w-8 h-8 mb-2 opacity-40" />}
      <p className="text-xs">{message}</p>
    </motion.div>
  );
}
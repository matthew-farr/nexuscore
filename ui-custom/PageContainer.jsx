import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function PageContainer({ children, className }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={cn("p-6 max-w-[1400px] mx-auto", className)}
    >
      {children}
    </motion.div>
  );
}
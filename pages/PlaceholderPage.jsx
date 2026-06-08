import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import PageContainer from "../components/ui-custom/PageContainer";
import { Construction } from "lucide-react";

export default function PlaceholderPage() {
  const location = useLocation();
  const pageName = location.pathname
    .replace("/", "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase()) || "Page";

  return (
    <PageContainer className="flex items-center justify-center min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass rounded-2xl p-12 text-center max-w-md"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-glow-pink/20 to-glow-purple/20 flex items-center justify-center mx-auto mb-5"
        >
          <Construction className="w-7 h-7 text-primary" />
        </motion.div>
        <h2 className="text-xl font-bold text-foreground mb-2">{pageName}</h2>
        <p className="text-sm text-muted-foreground">
          This section is coming soon. We're building something amazing.
        </p>
        <div className="mt-6 flex justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              className="w-2 h-2 rounded-full bg-primary"
            />
          ))}
        </div>
      </motion.div>
    </PageContainer>
  );
}
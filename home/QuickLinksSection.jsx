import { motion } from "framer-motion";
import GlassCard from "../ui-custom/GlassCard";
import SectionHeader from "../ui-custom/SectionHeader";
import EmptyState from "../ui-custom/EmptyState";
import { Skeleton } from "../ui/skeleton";
import { Link as LucideLink } from "lucide-react";
import { ICON_MAP } from "../../hooks/useHomepageData";
import { useTheme } from "../ThemeProvider";

export default function QuickLinksSection({ quickLinks, loading }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (loading) {
    return (
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Quick Links</h3>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </GlassCard>
    );
  }

  if (!quickLinks || quickLinks.length === 0) {
    return (
      <GlassCard>
        <SectionHeader title="Quick Links" />
        <EmptyState
          icon={LucideLink}
          title="No quick links"
          description="Admin will add quick links here"
        />
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Quick Links</h3>
        <a href="#" className="text-xs text-primary hover:underline">View all</a>
      </div>
      <motion.div
        className="grid grid-cols-5 gap-3"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.05,
            },
          },
        }}
      >
        {quickLinks.slice(0, 10).map((link) => {
          const Icon = ICON_MAP[link.icon];
          return (
            <motion.a
              key={link.id}
              href={link.url}
              target={link.open_in_new_tab ? "_blank" : "_self"}
              rel="noreferrer"
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              whileHover={{ scale: 1.06, y: -4 }}
              className="flex flex-col items-center gap-2.5 p-4 rounded-xl transition-all text-center cursor-pointer"
              style={{
                background: isDark
                  ? "linear-gradient(145deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.04) 100%)"
                  : "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(245,243,255,0.85) 100%)",
                border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.09)",
                boxShadow: isDark ? "0 4px 12px rgba(0,0,0,0.3)" : "0 4px 12px rgba(0,0,0,0.07)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 6px 24px ${link.accent_colour || "#ec2ca3"}55`;
                e.currentTarget.style.borderColor = `${link.accent_colour || "#ec2ca3"}60`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = isDark ? "0 4px 12px rgba(0,0,0,0.3)" : "0 4px 12px rgba(0,0,0,0.07)";
                e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.09)";
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden"
                style={{
                  background: link.accent_colour || "#ec2ca3",
                  boxShadow: `0 4px 12px ${link.accent_colour || "#ec2ca3"}60`,
                }}
              >
                {link.icon_url
                  ? <img src={link.icon_url} alt={link.title} className="w-8 h-8 object-contain rounded-md" />
                  : Icon ? <Icon className="w-6 h-6 text-white" /> : null
                }
              </div>
              <span className="text-xs font-semibold leading-tight" style={{ color: isDark ? "rgba(255,255,255,0.85)" : "hsl(230 25% 12%)" }}>
                {link.title}
              </span>
            </motion.a>
          );
        })}
      </motion.div>
    </GlassCard>
  );
}
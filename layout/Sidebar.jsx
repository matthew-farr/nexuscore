import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "../ThemeProvider";
import {
  Home, ListChecks, Settings2, TrendingUp, ShoppingCart, Megaphone,
  GraduationCap, Lightbulb, BookOpen, Newspaper, FolderOpen, Users2,
  FileText, Shield, ChevronDown, Sparkles, ExternalLink, UserCircle2, LayoutGrid,
  HeadphonesIcon, Gauge, Rocket
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import AppVersionBadge from "./AppVersionBadge";

const navSections = [
  {
    label: "MAIN",
    items: [
      { icon: Home, label: "Home", path: "/", adminOnly: true },
      { icon: ListChecks, label: "My Work", path: "/my-work", adminOnly: true },
      { icon: UserCircle2, label: "My Profile", path: "/my-profile" },
    ]
  },
  {
    label: "HUBS",
    adminOnly: true,
    items: [
      { icon: Settings2, label: "Operations Hub", path: "/operations" },
      { icon: ShoppingCart, label: "Sales Hub", path: "/sales" },
      { icon: GraduationCap, label: "Learning Hub", path: "/learning" },
      { icon: Lightbulb, label: "Innovation Hub", path: "/innovation" },
      { icon: Gauge, label: "Management Hub", path: "/management" },
    ]
  },
  {
    label: "BUSINESS",
    items: [
      { icon: Newspaper, label: "News & Updates", path: "/news", adminOnly: true },
      { icon: HeadphonesIcon, label: "Help Desk", path: "/jira-issues" },
      { icon: Rocket, label: "Feature Releases", path: "/feature-releases" },
    ]
  },
  {
  label: "RESOURCES",
  items: [
    { icon: BookOpen, label: "Knowledge Base", path: "/knowledge" },
    { icon: FileText, label: "Templates & Tools", path: "/templates" },
  ]
  },
  {
    label: "PEOPLE",
    adminOnly: true,
    items: [
      { icon: Users2, label: "People Directory", path: "/people" },
    ]
  },
  {
    label: "ADMIN",
    adminOnly: true,
    items: [
      { icon: Shield, label: "Admin Hub", path: "/admin" },
    ]
  },
];

function NavSection({ section, collapsedSections, toggleSection, user }) {
  const location = useLocation();
  const isCollapsed = collapsedSections[section.label];

  return (
    <div className="mb-1">
      <button
        onClick={() => toggleSection(section.label)}
        className="flex items-center justify-between w-full px-3 py-1.5 text-[10px] font-semibold tracking-wider transition-colors"
        style={{ color: "currentColor" }}
      >
        <span>{section.label}</span>
        <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", isCollapsed && "-rotate-90")} />
      </button>
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {section.items.map((item) => {
              const isActive = item.path === "/admin"
                ? location.pathname.startsWith("/admin")
                : location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 mx-2 rounded-xl text-sm transition-all duration-200 group relative",
                    !isActive && "hover:bg-foreground/[0.05]"
                  )}
                  style={{ color: "currentColor" }}
                  style={isActive ? {
                    background: "linear-gradient(135deg, rgba(236,44,163,0.20) 0%, rgba(124,58,237,0.15) 100%)",
                    boxShadow: "inset 0 0 0 1px rgba(236,44,163,0.25), 0 2px 12px rgba(236,44,163,0.12)",
                  } : {}}
                >
                  {isActive && (
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                      style={{ background: "linear-gradient(180deg, #ec2ca3, #7c3aed)" }}
                    />
                  )}
                  <Icon className={cn("w-4 h-4 flex-shrink-0", isActive && "drop-shadow-sm")}
                    style={isActive ? { color: "#ec2ca3" } : {}} />
                  <span className="font-medium text-[13px] truncate">{item.label}</span>
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GlowingOrb() {
  return (
    <div className="relative w-9 h-9 flex-shrink-0">
      {/* Outer glow ring */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(236,44,163,0.4) 0%, transparent 70%)",
          filter: "blur(4px)",
        }}
      />
      {/* Core orb */}
      <div
        className="absolute inset-1 rounded-full flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #ec2ca3, #7c3aed)",
          boxShadow: "0 0 14px rgba(236,44,163,0.7), 0 0 4px rgba(124,58,237,0.5)",
        }}
      >
        <Sparkles className="w-3.5 h-3.5 text-white" />
      </div>
      {/* Cyan accent dot */}
      <motion.div
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
        style={{ background: "#22d3ee", boxShadow: "0 0 6px #22d3ee" }}
      />
    </div>
  );
}

export default function Sidebar() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { user } = useAuth();
  const isAdmin = useIsAdmin();
  const [collapsedSections, setCollapsedSections] = useState({});

  const toggleSection = (label) => {
    setCollapsedSections(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <motion.aside
      initial={{ x: -280, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed top-0 left-0 z-40 h-screen w-[240px] flex flex-col border-r border-border/40 bg-background/95 backdrop-blur-xl"
      style={{
        boxShadow: "4px 0 24px rgba(0,0,0,0.08)"
      }}
    >
      {/* Top edge glow line */}
      <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent pointer-events-none" />

      {/* Logo */}
      <div className="flex items-center px-5 py-4 border-b border-border/30">
        <img 
          src="https://media.base44.com/images/public/6a16abdb83b84eec69c55112/57e77072d_checks-direct-logo.png"
          alt="Checks Direct"
          className="h-8 object-contain"
          style={{ filter: isDark ? "brightness(1.2) invert(1)" : "none" }}
        />
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-3 px-1 space-y-1">
        {navSections.map((section) => {
            // Hide entire section from non-admins if section is adminOnly
            if (section.adminOnly && !isAdmin) return null;
            // Also hide sections where all items would be hidden
            const visibleItems = section.items.filter(item => !item.adminOnly || isAdmin);
            if (visibleItems.length === 0) return null;
            return (
              <NavSection
                key={section.label}
                section={{ ...section, items: visibleItems }}
                collapsedSections={collapsedSections}
                toggleSection={toggleSection}
                user={user}
              />
            );
          })}
      </div>

      {/* AI Assistant Panel */}
      <div className="p-3 border-t border-border/30">
        <div
          className="relative overflow-hidden rounded-2xl p-4"
          style={{
            background: "linear-gradient(135deg, #12082a 0%, #1a0e3a 50%, #0d1a3a 100%)",
            border: "1px solid rgba(124,58,237,0.30)",
            boxShadow: "0 8px 32px rgba(124,58,237,0.20), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          {/* Animated glow blob */}
          <motion.div
            animate={{ opacity: [0.5, 0.9, 0.5], scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-0 right-0 w-24 h-24 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(124,58,237,0.55) 0%, rgba(236,44,163,0.25) 50%, transparent 70%)",
              filter: "blur(16px)",
              transform: "translate(30%, 30%)",
            }}
          />
          {/* Top shimmer */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-400/40 to-transparent" />

          {/* Header badge */}
          <div className="flex items-center gap-1.5 mb-3 relative z-10">
            <GlowingOrb />
            <span className="text-[10px] font-bold uppercase tracking-widest text-purple-300">AI Assistant</span>
          </div>

          {/* Text */}
          <div className="relative z-10 mb-4">
            <p className="text-sm font-bold text-white leading-snug mb-1">Need answers fast?</p>
            <p className="text-[11px] text-white/55 leading-relaxed">Ask AI anything about<br />Checks Direct</p>
          </div>

          {/* CTA Button */}
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 8px 28px rgba(236,44,163,0.50)" }}
            whileTap={{ scale: 0.97 }}
            className="relative z-10 flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-semibold w-full justify-center"
            style={{
              background: "linear-gradient(135deg, #ec2ca3, #7c3aed)",
              boxShadow: "0 4px 18px rgba(236,44,163,0.35)",
              border: "none",
              cursor: "pointer",
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Ask AI
          </motion.button>
        </div>
      </div>

      {/* Deployment Version Badge */}
      <div className="p-3 flex justify-center">
        <AppVersionBadge />
      </div>
    </motion.aside>
  );
}
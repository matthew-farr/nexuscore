import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useActivityTracking } from "@/hooks/useActivityTracking";
import { useAuth } from "@/lib/AuthContext";
import { useTheme } from "../components/ThemeProvider";
import { Settings2, Sparkles, Search } from "lucide-react";
import PageContainer from "@/components/ui-custom/PageContainer";

import OpsKPIRow from "../components/operations/OpsKPIRow";
import OpsToolsGrid from "../components/operations/OpsToolsGrid";
import HubQuickLaunchSection from "../components/hub/HubQuickLaunchSection";
import OpsKnowledgeFeed from "../components/operations/OpsKnowledgeFeed";
import OpsSidebar from "../components/operations/OpsSidebar";
import IndustryAssignmentQuickView from "../components/industry/IndustryAssignmentQuickView";
import KBDocumentDrawer from "../components/knowledge/KBDocumentDrawer";

const ACCENT = "#06b6d4";
const ACCENT2 = "#ec2ca3";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function OperationsHub() {
  useActivityTracking({ entity_type: "hub", entity_id: "operations", title: "Operations Hub", route: "/operations", icon: "Settings2" });

  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [searchFocused, setSearchFocused] = useState(false);
  const [industryModalOpen, setIndustryModalOpen] = useState(false);
  const [kbDrawerDoc, setKbDrawerDoc] = useState(null);

  const firstName = user?.full_name?.split(" ")[0] || "there";

  // Ensure tools on first load
  useEffect(() => {
    const runOnce = async () => {
      try {
        const tools = await base44.entities.HubContentItem.filter(
          { hub_key: "operations", content_type: "tool", title: "60 Day DBS Escalations" }, "", 1
        );
        if (!tools || tools.length === 0) {
          await base44.functions.invoke("ensureOperationsHubTools", {});
        }
      } catch { /* silent */ }
    };
    runOnce();
  }, []);

  return (
    <PageContainer>
      {/* ── ROW 1: Hero Banner ── */}
      <div className="relative overflow-hidden mb-5"
        style={{
          borderRadius: "24px",
          border: `1px solid ${ACCENT}30`,
          boxShadow: `0 0 40px ${ACCENT}18, 0 24px 64px rgba(0,0,0,0.50), 0 8px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)`,
        }}
      >
        {/* Background */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0a1128 0%, #07081a 55%, #050e1f 100%)" }} />

        {/* Ambient glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-10 -right-10 w-72 h-72 rounded-full blur-3xl opacity-25" style={{ background: ACCENT }} />
          <div className="absolute -bottom-14 right-40 w-52 h-52 rounded-full blur-3xl opacity-15" style={{ background: ACCENT2 }} />
          <div className="absolute top-8 right-72 w-36 h-36 rounded-full blur-3xl opacity-10" style={{ background: "#7c3aed" }} />
        </div>

        {/* Text-safe overlay */}
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(90deg, rgba(5,8,22,0.99) 0%, rgba(5,10,28,0.95) 35%, rgba(10,15,35,0.65) 60%, transparent 100%)" }} />

        <div className="relative px-7 py-6 flex flex-col md:flex-row md:items-center gap-5" style={{ zIndex: 2 }}>
          {/* LEFT */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${ACCENT}28`, border: `1px solid ${ACCENT}40`, boxShadow: `0 0 16px ${ACCENT}25` }}>
                <Settings2 className="w-5 h-5" style={{ color: ACCENT }} />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-white/35">Operations Hub</span>
            </div>

            <motion.h1
              initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
              className="font-extrabold mb-1"
              style={{ fontSize: "clamp(20px, 2.6vw, 28px)", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.5px" }}
            >
              {getGreeting()}, {firstName}.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="text-sm mb-4 max-w-md"
              style={{ color: "rgba(255,255,255,0.50)" }}
            >
              Your operations command centre. Track workload, launch tools and manage daily operations.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.18 }}
              className="w-full md:w-[360px]">
              <div className="relative flex items-center gap-2 px-3 rounded-xl transition-all duration-200"
                style={{
                  height: "42px",
                  background: searchFocused ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.88)",
                  border: `1px solid ${searchFocused ? "rgba(255,255,255,0.80)" : "rgba(255,255,255,0.60)"}`,
                  backdropFilter: "blur(24px)",
                }}>
                <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: searchFocused ? "#1a1a2e" : "#6a6a9a" }} />
                <input type="text" placeholder="Search Operations Hub…"
                  onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
                  className="flex-1 bg-transparent focus:outline-none text-xs font-medium"
                  style={{ color: "#0f0f2e", caretColor: ACCENT }}
                />
              </div>
            </motion.div>
          </div>

          {/* RIGHT: AI Assistant card */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.18 }}
            className="md:w-[280px] flex-shrink-0"
            style={{
              borderRadius: "16px",
              background: `linear-gradient(135deg, ${ACCENT}22 0%, ${ACCENT}10 100%)`,
              border: `1.5px solid ${ACCENT}35`,
              boxShadow: `0 16px 40px ${ACCENT}25, 0 0 0 1px rgba(255,255,255,0.12) inset`,
              padding: "20px",
              display: "flex", flexDirection: "column", gap: "14px",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}bb)`, border: `1.5px solid ${ACCENT}80`, boxShadow: `0 6px 20px ${ACCENT}35` }}>
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-white">AI Assistant</p>
            </div>
            <div>
              <p className="text-sm font-bold text-white mb-1">Need answers fast?</p>
              <p className="text-xs text-white/55">Ask AI anything about operations, DBS, suppliers or processes.</p>
            </div>
            <button type="button"
              className="w-full flex items-center justify-center gap-2 font-bold text-white text-xs py-2.5 px-4 transition-all duration-200"
              style={{ borderRadius: "12px", background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}bb)`, border: `1.5px solid ${ACCENT}80`, boxShadow: `0 8px 24px ${ACCENT}40`, cursor: "pointer" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <Sparkles className="w-3.5 h-3.5" /> Ask AI
            </button>
          </motion.div>
        </div>
      </div>

      {/* ── Main layout: left content + right sidebar ── */}
      <div className="flex flex-col xl:flex-row gap-5 items-start">

        {/* ── LEFT COLUMN ── */}
        <div className="flex-1 min-w-0">

          {/* ROW 2: KPI Dashboard */}
          <OpsKPIRow />

          {/* ROW 3: Operations Tools */}
          <OpsToolsGrid onOpenIndustryModal={() => setIndustryModalOpen(true)} />

          {/* ROW 4: Quick Links */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-white">Quick Links</h2>
            </div>
            <HubQuickLaunchSection hubKey="operations" accentColour={ACCENT} />
          </div>

          {/* ROW 5: Knowledge Centre Feed */}
          <OpsKnowledgeFeed onOpenDoc={setKbDrawerDoc} />
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div className="w-full xl:w-72 flex-shrink-0">
          <OpsSidebar />
        </div>
      </div>

      {/* Industry Assignment Modal */}
      {industryModalOpen && (
        <IndustryAssignmentQuickView
          isOpen={industryModalOpen}
          onClose={() => setIndustryModalOpen(false)}
        />
      )}

      {/* KB Document Drawer */}
      <KBDocumentDrawer
        doc={kbDrawerDoc}
        isOpen={!!kbDrawerDoc}
        onClose={() => setKbDrawerDoc(null)}
        isBookmarked={false}
        onToggleBookmark={() => {}}
        isAdmin={user?.role === "admin"}
        onEdit={() => {}}
        onArchived={() => {}}
      />
    </PageContainer>
  );
}
/**
 * HubQuickLinksGrid — premium launch card grid for any hub.
 * Features: category grouping (collapsible), search, favourites, logo support.
 * Used by Operations Hub and reusable across all hubs.
 */
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../ThemeProvider";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import {
  Search, Star, ExternalLink, ChevronDown, ChevronRight,
  Shield, Users, Globe, BookOpen, Building2, CreditCard,
  GraduationCap, Fingerprint, ShieldCheck, X, Settings, Zap,
  FileText, ClipboardCheck, AlertTriangle, BarChart2, Database,
  Mail, Calendar, Home, DollarSign, TrendingUp, Calculator,
} from "lucide-react";

const COLOUR_MAP = {
  cyan:    "#06b6d4",
  purple:  "#8b5cf6",
  pink:    "#ec2ca3",
  green:   "#10b981",
  amber:   "#f59e0b",
  red:     "#ef4444",
  blue:    "#0ea5e9",
  orange:  "#f97316",
  yellow:  "#ca8a04",
  emerald: "#059669",
};

const ICON_MAP = {
  Shield, Users, Globe, BookOpen, Building2, CreditCard,
  GraduationCap, Fingerprint, ShieldCheck, ExternalLink,
  Settings, Zap, FileText, ClipboardCheck, AlertTriangle,
  BarChart2, Database, Mail, Calendar, Home, DollarSign,
  TrendingUp, Calculator,
};

/** Resolve which logo/icon to show for a link */
function LinkLogo({ item, color, isDark, size = 40 }) {
  const logoUrl = isDark
    ? (item.logo_dark_url || item.logo_url)
    : (item.logo_light_url || item.logo_url);

  if (item.use_logo && logoUrl) {
    return (
      <div
        className="rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
        style={{
          width: size, height: size,
          background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)"}`,
          padding: 6,
        }}
      >
        <img src={logoUrl} alt="" className="w-full h-full object-contain" />
      </div>
    );
  }

  const Icon = ICON_MAP[item.icon] || Shield;
  return (
    <div
      className="rounded-xl flex items-center justify-center flex-shrink-0"
      style={{
        width: size, height: size,
        background: `linear-gradient(135deg, ${color}28, ${color}12)`,
        border: `1.5px solid ${color}40`,
        boxShadow: `0 0 14px ${color}20`,
      }}
    >
      <Icon style={{ width: size * 0.45, height: size * 0.45, color }} />
    </div>
  );
}

/** Single premium launch card */
function QuickLinkCard({ item, isFav, onToggleFav, isDark }) {
  const color = COLOUR_MAP[item.colour_theme] || "#06b6d4";

  const handleClick = () => {
    if (item.url) window.open(item.url, item.open_in_new_tab !== false ? "_blank" : "_self");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl p-4 flex flex-col gap-3 cursor-pointer group transition-all duration-200"
      style={{
        background: isDark
          ? "linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)"
          : "linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(248,246,255,0.90) 100%)",
        border: isDark ? "1px solid rgba(255,255,255,0.09)" : "1px solid rgba(0,0,0,0.09)",
        backdropFilter: "blur(20px)",
        boxShadow: isDark
          ? "0 4px 20px rgba(0,0,0,0.30)"
          : "0 6px 24px rgba(0,0,0,0.08), inset 0 0.5px 0 rgba(255,255,255,0.80)",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = `${color}55`;
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = isDark
          ? `0 0 28px ${color}25, 0 12px 36px rgba(0,0,0,0.40)`
          : `0 12px 40px ${color}22, 0 4px 12px rgba(0,0,0,0.10)`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.09)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = isDark
          ? "0 4px 20px rgba(0,0,0,0.30)"
          : "0 6px 24px rgba(0,0,0,0.08), inset 0 0.5px 0 rgba(255,255,255,0.80)";
      }}
      onClick={handleClick}
    >
      {/* Top: logo + fav + external */}
      <div className="flex items-start justify-between gap-2">
        <LinkLogo item={item} color={color} isDark={isDark} size={44} />

        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Fav button — always visible when pinned, visible on hover otherwise */}
          <button
            onClick={e => { e.stopPropagation(); onToggleFav(item); }}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${isFav ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
            style={{
              background: isFav ? `${color}25` : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"),
              border: isFav ? `1px solid ${color}50` : "1px solid transparent",
            }}
            title={isFav ? "Remove from favourites" : "Add to favourites"}
          >
            <Star
              className="w-3.5 h-3.5 transition-all"
              style={{ color: isFav ? color : (isDark ? "rgba(255,255,255,0.40)" : "rgba(0,0,0,0.35)"), fill: isFav ? color : "none" }}
            />
          </button>

          <ExternalLink className="w-3.5 h-3.5 opacity-30 group-hover:opacity-60 transition-opacity" style={{ color: isDark ? "#fff" : "#000" }} />
        </div>
      </div>

      {/* Title + badge */}
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-sm font-semibold leading-tight" style={{ color: isDark ? "rgba(255,255,255,0.92)" : "hsl(230 25% 12%)" }}>
            {item.title}
          </h3>
          {item.badge_text && (
            <span
              className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full flex-shrink-0"
              style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
            >
              {item.badge_text}
            </span>
          )}
        </div>
        <p className="text-xs mt-1.5 leading-relaxed line-clamp-2" style={{ color: isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.50)" }}>
          {item.description}
        </p>
      </div>

      {/* Bottom accent bar */}
      <div
        className="absolute bottom-0 left-4 right-4 h-px rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: `linear-gradient(to right, transparent, ${color}60, transparent)` }}
      />
    </motion.div>
  );
}

/** Collapsible category section */
function CategorySection({ category, items, favIds, onToggleFav, isDark, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-6">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 mb-3 group w-full text-left"
      >
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.40)" }}>
          {category}
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", color: isDark ? "rgba(255,255,255,0.40)" : "rgba(0,0,0,0.40)" }}>
          {items.length}
        </span>
        <div className="flex-1 h-px" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)" }} />
        {open
          ? <ChevronDown className="w-3.5 h-3.5 flex-shrink-0 transition-transform" style={{ color: isDark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.30)" }} />
          : <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 transition-transform" style={{ color: isDark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.30)" }} />
        }
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {items.map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <QuickLinkCard
                    item={item}
                    isFav={favIds.has(item.id)}
                    onToggleFav={onToggleFav}
                    isDark={isDark}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Main HubQuickLinksGrid component.
 * Props: hubKey, accentColour, title (optional, defaults to "Quick Links")
 */
export default function HubQuickLinksGrid({ hubKey, accentColour, title = "Quick Links" }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === "dark";
  const ACCENT = accentColour || "#06b6d4";

  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favRecords, setFavRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showFavsOnly, setShowFavsOnly] = useState(false);

  // Load links
  useEffect(() => {
    if (!hubKey) return;
    base44.entities.HubContentItem
      .filter({ hub_key: hubKey, content_type: "quick_link", is_active: true }, "sort_order", 100)
      .then(data => setLinks(data || []))
      .catch(() => setLinks([]))
      .finally(() => setLoading(false));
  }, [hubKey]);

  // Load favourites
  useEffect(() => {
    if (!user?.id) return;
    base44.entities.HubQuickLinkFavourite
      .filter({ user_id: user.id, hub_key: hubKey })
      .then(data => setFavRecords(data || []))
      .catch(() => setFavRecords([]));
  }, [user?.id, hubKey]);

  const favIds = useMemo(() => new Set(favRecords.map(f => f.item_id)), [favRecords]);

  const handleToggleFav = async (item) => {
    if (!user?.id) return;
    if (favIds.has(item.id)) {
      const rec = favRecords.find(f => f.item_id === item.id);
      if (rec) {
        await base44.entities.HubQuickLinkFavourite.delete(rec.id);
        setFavRecords(prev => prev.filter(f => f.item_id !== item.id));
      }
    } else {
      const created = await base44.entities.HubQuickLinkFavourite.create({ user_id: user.id, item_id: item.id, hub_key: hubKey });
      setFavRecords(prev => [...prev, created]);
    }
  };

  // All categories
  const categories = useMemo(() => {
    const cats = [...new Set(links.map(l => l.category).filter(Boolean))];
    return cats.sort();
  }, [links]);

  // Filtered links
  const filtered = useMemo(() => {
    let result = [...links];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(l =>
        l.title?.toLowerCase().includes(q) ||
        l.description?.toLowerCase().includes(q) ||
        l.category?.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== "all") result = result.filter(l => l.category === categoryFilter);
    if (showFavsOnly) result = result.filter(l => favIds.has(l.id));
    return result;
  }, [links, search, categoryFilter, showFavsOnly, favIds]);

  // Favourites (pinned at top)
  const pinnedLinks = useMemo(() => filtered.filter(l => favIds.has(l.id)), [filtered, favIds]);

  // Grouped by category (excluding pinned when showing fav-section)
  const grouped = useMemo(() => {
    const map = {};
    const toGroup = showFavsOnly ? filtered : filtered;
    toGroup.forEach(l => {
      const cat = l.category || "Other";
      if (!map[cat]) map[cat] = [];
      map[cat].push(l);
    });
    return map;
  }, [filtered, showFavsOnly]);

  if (loading) {
    return (
      <div className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-36 rounded-2xl animate-pulse" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)" }} />
          ))}
        </div>
      </div>
    );
  }

  if (links.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mb-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="flex-1">
          <h2 className="text-lg font-semibold" style={{ color: isDark ? "rgba(255,255,255,0.88)" : "hsl(230 25% 15%)" }}>
            {title}
          </h2>
          <p className="text-xs mt-0.5" style={{ color: isDark ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.40)" }}>
            {links.length} systems · {categories.length} categories
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: isDark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.30)" }} />
            <input
              type="text"
              placeholder="Search systems…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-8 pl-8 pr-3 rounded-lg text-xs outline-none transition-all w-44"
              style={{
                background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.04)",
                border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.10)",
                color: isDark ? "#fff" : "#0f172a",
              }}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2">
                <X className="w-3 h-3" style={{ color: isDark ? "rgba(255,255,255,0.40)" : "rgba(0,0,0,0.40)" }} />
              </button>
            )}
          </div>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="h-8 px-2.5 rounded-lg text-xs outline-none transition-all"
            style={{
              background: isDark ? "rgba(255,255,255,0.07)" : "white",
              border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.12)",
              color: isDark ? "rgba(255,255,255,0.80)" : "#374151",
              colorScheme: isDark ? "dark" : "light",
            }}
          >
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Favourites toggle */}
          <button
            onClick={() => setShowFavsOnly(v => !v)}
            className="h-8 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
            style={showFavsOnly ? {
              background: `${ACCENT}25`,
              border: `1px solid ${ACCENT}50`,
              color: ACCENT,
            } : {
              background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.04)",
              border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.10)",
              color: isDark ? "rgba(255,255,255,0.60)" : "rgba(0,0,0,0.55)",
            }}
          >
            <Star className="w-3 h-3" style={{ fill: showFavsOnly ? ACCENT : "none", color: showFavsOnly ? ACCENT : "currentColor" }} />
            Favourites
            {favIds.size > 0 && (
              <span className="text-[9px] font-bold px-1 rounded-full" style={{ background: showFavsOnly ? ACCENT : `${ACCENT}30`, color: showFavsOnly ? "white" : ACCENT }}>
                {favIds.size}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Pinned favourites strip (when not in fav-only mode) */}
      {!showFavsOnly && pinnedLinks.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2.5">
            <Star className="w-3.5 h-3.5" style={{ color: ACCENT, fill: ACCENT }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: ACCENT }}>Pinned</span>
            <div className="flex-1 h-px" style={{ background: `${ACCENT}30` }} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {pinnedLinks.map((item, i) => (
              <motion.div key={`pin-${item.id}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <QuickLinkCard item={item} isFav={true} onToggleFav={handleToggleFav} isDark={isDark} />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Category groups */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 rounded-2xl" style={{ background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", border: isDark ? "1px dashed rgba(255,255,255,0.08)" : "1px dashed rgba(0,0,0,0.09)" }}>
          <Search className="w-8 h-8 mx-auto mb-2 opacity-20" />
          <p className="text-sm font-medium" style={{ color: isDark ? "rgba(255,255,255,0.40)" : "rgba(0,0,0,0.40)" }}>No results found</p>
          <button onClick={() => { setSearch(""); setCategoryFilter("all"); setShowFavsOnly(false); }} className="text-xs mt-1.5 underline underline-offset-2" style={{ color: ACCENT }}>Clear filters</button>
        </div>
      ) : (
        Object.entries(grouped)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([cat, items]) => (
            <CategorySection
              key={cat}
              category={cat}
              items={items}
              favIds={favIds}
              onToggleFav={handleToggleFav}
              isDark={isDark}
              defaultOpen={true}
            />
          ))
      )}
    </motion.div>
  );
}
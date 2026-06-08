import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { BookOpen, Bookmark, Clock, Star, ChevronRight } from "lucide-react";

const PINNED_DOCS = [
  "DBS Application Process",
  "DBS Eligibility Guide",
  "CJSM Process",
  "Supplier Onboarding",
  "Compliance Procedures",
];

function DocRow({ doc, onOpen, accent = "#22d3ee" }) {
  return (
    <button
      onClick={() => onOpen?.(doc)}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left group"
      style={{ background: "transparent" }}
      onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
    >
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}>
        <BookOpen className="w-3.5 h-3.5" style={{ color: accent }} />
      </div>
      <span className="flex-1 text-xs font-medium text-white/80 group-hover:text-white transition-colors leading-tight line-clamp-1">
        {doc.title || doc}
      </span>
      <ChevronRight className="w-3 h-3 text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0" />
    </button>
  );
}

export default function OpsKnowledgeFeed({ onOpenDoc }) {
  const { user } = useAuth();
  const [recentDocs, setRecentDocs] = useState([]);
  const [bookmarkedDocs, setBookmarkedDocs] = useState([]);
  const [pinnedDocs, setPinnedDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allDocs, bookmarks] = await Promise.all([
          base44.entities.KnowledgeDocument.filter({ status: "Published" }, "-updated_date", 50),
          user?.id ? base44.entities.KnowledgeBookmark.filter({ user_id: user.id }) : Promise.resolve([]),
        ]);

        // Recent
        setRecentDocs((allDocs || []).slice(0, 6));

        // Pinned — match by title substring
        const pinned = (allDocs || []).filter(d =>
          PINNED_DOCS.some(p => d.title?.toLowerCase().includes(p.toLowerCase()))
        ).slice(0, 5);
        // Fill missing with placeholder objects
        const pinnedResult = PINNED_DOCS.map(p => {
          const found = (allDocs || []).find(d => d.title?.toLowerCase().includes(p.toLowerCase()));
          return found || { title: p, id: null };
        });
        setPinnedDocs(pinnedResult);

        // Bookmarks
        const bIds = new Set((bookmarks || []).map(b => b.document_id));
        setBookmarkedDocs((allDocs || []).filter(d => bIds.has(d.id)));
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id]);

  const handleOpen = (doc) => {
    if (doc?.id) onOpenDoc?.(doc);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-white">Knowledge Centre</h2>
        <a href="/knowledge" className="text-xs font-semibold text-white/40 hover:text-white/70 transition-colors">View all →</a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Frequently Used */}
        <div className="rounded-2xl p-4"
          style={{ background: "linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-bold text-white/70 uppercase tracking-wider">Frequently Used</span>
          </div>
          {loading ? (
            <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="h-9 rounded-xl bg-white/5 animate-pulse" />)}</div>
          ) : (
            <div>{pinnedDocs.map((doc, i) => <DocRow key={i} doc={doc} onOpen={handleOpen} accent="#f59e0b" />)}</div>
          )}
        </div>

        {/* Recently Published */}
        <div className="rounded-2xl p-4"
          style={{ background: "linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-bold text-white/70 uppercase tracking-wider">Recently Published</span>
          </div>
          {loading ? (
            <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="h-9 rounded-xl bg-white/5 animate-pulse" />)}</div>
          ) : recentDocs.length === 0 ? (
            <p className="text-xs text-white/30 p-3">No published documents yet.</p>
          ) : (
            <div>{recentDocs.map((doc, i) => <DocRow key={doc.id || i} doc={doc} onOpen={handleOpen} accent="#22d3ee" />)}</div>
          )}
        </div>

        {/* My Bookmarks */}
        <div className="rounded-2xl p-4"
          style={{ background: "linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-2 mb-3">
            <Bookmark className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs font-bold text-white/70 uppercase tracking-wider">My Bookmarks</span>
          </div>
          {loading ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-9 rounded-xl bg-white/5 animate-pulse" />)}</div>
          ) : bookmarkedDocs.length === 0 ? (
            <div className="text-center py-6">
              <Bookmark className="w-6 h-6 text-white/15 mx-auto mb-2" />
              <p className="text-xs text-white/30">No bookmarks yet.</p>
              <a href="/knowledge" className="text-xs text-purple-400/70 hover:text-purple-400 mt-1 inline-block">Browse Knowledge Centre</a>
            </div>
          ) : (
            <div>{bookmarkedDocs.map((doc, i) => <DocRow key={doc.id || i} doc={doc} onOpen={handleOpen} accent="#a78bfa" />)}</div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
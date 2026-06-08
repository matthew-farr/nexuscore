import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useTheme } from "../../ThemeProvider";
import { useAuth } from "../../../lib/AuthContext";
import { Presentation, Plus, Archive } from "lucide-react";
import SalesKickoffPresentation from "./SalesKickoffPresentation";
import SalesKickoffEditor from "./SalesKickoffEditor";

const ACCENT = "#8b5cf6";

export default function SalesKickoffTab({ showDrafts = false }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { user } = useAuth();
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [editingDeck, setEditingDeck] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // list, viewing, editing

  const isAdmin = user?.role === "admin" || user?.role === "Admin";

  const { data: decks = [], refetch } = useQuery({
    queryKey: ["salesKickoffDecks"],
    queryFn: () => base44.entities.SalesKickoffDeck.filter({ is_archived: false }, "-published_date", 100),
  });

  const publishedDecks = showDrafts ? decks : decks.filter(d => d.status === "published");

  const cardBg = isDark
    ? "linear-gradient(145deg, rgba(15,23,42,0.68) 0%, rgba(15,23,42,0.50) 100%)"
    : "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,246,255,0.85) 100%)";
  const cardBorder = isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.07)";
  const cardShadow = isDark ? "0 8px 24px rgba(0,0,0,0.30)" : "0 4px 16px rgba(0,0,0,0.08)";

  if (viewMode === "viewing" && selectedDeck) {
    return (
      <SalesKickoffPresentation
        deck={selectedDeck}
        onClose={() => {
          setSelectedDeck(null);
          setViewMode("list");
        }}
      />
    );
  }

  if (viewMode === "editing" && editingDeck && isAdmin) {
    return (
      <SalesKickoffEditor
        deck={editingDeck}
        onClose={() => {
          setEditingDeck(null);
          setViewMode("list");
          refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl p-5 flex items-center justify-between"
        style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${ACCENT}18`, border: `1px solid ${ACCENT}30`, boxShadow: `0 0 14px ${ACCENT}22` }}>
            <Presentation className="w-5 h-5" style={{ color: ACCENT }} />
          </div>
          <div>
            <h2 className="text-base font-bold" style={{ color: isDark ? "#ffffff" : "#000000" }}>Sales Kickoff</h2>
            <p className="text-xs mt-0.5" style={{ color: isDark ? "#ffffff" : "#000000" }}>Interactive presentations for the team</p>
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={() => {
              setEditingDeck({ title: "", description: "", status: "draft", audience_roles: [], audience_departments: [] });
              setViewMode("editing");
            }}
            className="px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all"
            style={{
              background: `${ACCENT}20`,
              border: `1px solid ${ACCENT}40`,
              color: ACCENT,
              cursor: "pointer",
            }}>
            <Plus className="w-4 h-4" /> New Deck
          </button>
        )}
      </div>

      {/* Published Decks */}
      <div className="rounded-2xl p-5" style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
        <h3 className="text-sm font-bold mb-4" style={{ color: isDark ? "#ffffff" : "#000000" }}>Available Presentations</h3>
        {publishedDecks.length === 0 ? (
          <p className="text-xs text-center py-8" style={{ color: isDark ? "#ffffff" : "#000000" }}>
            No presentations available yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {publishedDecks.map((deck) => (
              <button
                key={deck.id}
                onClick={() => {
                  setSelectedDeck(deck);
                  setViewMode("viewing");
                }}
                className="p-4 rounded-xl text-left transition-all hover:scale-[1.02]"
                style={{
                  background: isDark ? "rgba(139,92,246,0.08)" : "rgba(139,92,246,0.05)",
                  border: `1px solid ${ACCENT}30`,
                  cursor: "pointer",
                }}>
                <h4 className="text-sm font-bold" style={{ color: isDark ? "#ffffff" : "#000000" }}>{deck.title}</h4>
                <p className="text-xs mt-1" style={{ color: isDark ? "#ffffff" : "#000000" }}>{deck.description}</p>
                {isAdmin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingDeck(deck);
                      setViewMode("editing");
                    }}
                    className="text-xs font-semibold mt-3"
                    style={{ color: ACCENT }}>
                    Edit Deck →
                  </button>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Draft Decks (Admin Only) */}
      {isAdmin && showDrafts && (
        <div className="rounded-2xl p-5" style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
          <h3 className="text-sm font-bold mb-4" style={{ color: isDark ? "#ffffff" : "#000000" }}>Drafts</h3>
          {decks.filter(d => d.status === "draft").length === 0 ? (
            <p className="text-xs text-center py-8" style={{ color: isDark ? "#ffffff" : "#000000" }}>
              No drafts.
            </p>
          ) : (
            <div className="space-y-3">
              {decks.filter(d => d.status === "draft").map((deck) => (
                <div key={deck.id} className="flex items-center justify-between p-3 rounded-lg"
                  style={{ background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" }}>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: isDark ? "#ffffff" : "#000000" }}>{deck.title}</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingDeck(deck);
                      setViewMode("editing");
                    }}
                    className="text-xs font-semibold"
                    style={{ color: ACCENT }}>
                    Edit
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
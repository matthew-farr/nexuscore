import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useTheme } from "../../ThemeProvider";
import { Save, X, Plus, Trash2, Copy, ChevronUp, ChevronDown, Eye, Maximize2, Send } from "lucide-react";
import SalesKickoffSlideRenderer from "./SalesKickoffSlideRenderer";

const ACCENT = "#8b5cf6";

const DEFAULT_SLIDES = [
  { title: "Opening Vision", layout_type: "hero", accent_colour: "pink", slide_order: 1 },
  { title: "Why We Are Changing", layout_type: "hero", accent_colour: "purple", slide_order: 2 },
  { title: "KPI Expectations", layout_type: "kpi_grid", accent_colour: "cyan", slide_order: 3 },
  { title: "HubSpot Rules", layout_type: "timeline", accent_colour: "pink", slide_order: 4 },
  { title: "Team Structure", layout_type: "resource_cards", accent_colour: "purple", slide_order: 5 },
  { title: "Support Available", layout_type: "resource_cards", accent_colour: "cyan", slide_order: 6 },
  { title: "Final Commitment", layout_type: "acknowledgement", accent_colour: "pink", slide_order: 7 },
];

export default function SalesKickoffEditor({ deck, onClose }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [formData, setFormData] = useState(deck);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [savedDeckId, setSavedDeckId] = useState(deck.id || null);
  const [mode, setMode] = useState(deck.id ? "builder" : "form");
  const saveInProgress = useRef(false);

  const { data: slides = [] } = useQuery({
    queryKey: ["salesKickoffSlides", savedDeckId],
    queryFn: () => savedDeckId ? base44.entities.SalesKickoffSlide.filter({ deck_id: savedDeckId }, "slide_order", 100) : Promise.resolve([]),
    enabled: !!savedDeckId,
  });

  const [selectedSlideId, setSelectedSlideId] = useState(null);
  const [editingSlide, setEditingSlide] = useState(null);

  const selectedSlide = slides.find(s => s.id === selectedSlideId) || slides[0];

  const handleDeckFormSave = async () => {
    setError(null);
    if (!formData.title?.trim()) {
      setError("Presentation title is required");
      return;
    }

    if (saveInProgress.current) return;
    saveInProgress.current = true;
    setSaving(true);

    try {
      const payload = { title: formData.title, status: formData.status };
      console.log("[SalesKickoffEditor] Save deck payload:", payload);

      let newDeckId;
      if (deck.id) {
        console.log("[SalesKickoffEditor] Updating existing deck:", deck.id);
        await base44.entities.SalesKickoffDeck.update(deck.id, payload);
        newDeckId = deck.id;
      } else {
        console.log("[SalesKickoffEditor] Creating new deck");
        const response = await base44.entities.SalesKickoffDeck.create(payload);
        console.log("[SalesKickoffEditor] Deck created:", response);
        newDeckId = response.id;
        setSavedDeckId(newDeckId);
      }

      // Create default slides if new deck
      if (!deck.id && newDeckId) {
        console.log("[SalesKickoffEditor] Creating default slides for deck:", newDeckId);
        for (const defaultSlide of DEFAULT_SLIDES) {
          await base44.entities.SalesKickoffSlide.create({
            ...defaultSlide,
            deck_id: newDeckId,
            subtitle: `Slide ${defaultSlide.slide_order}`,
            content_html: "",
          });
        }
        console.log("[SalesKickoffEditor] Default slides created successfully");
      }

      console.log("[SalesKickoffEditor] Save complete, entering builder mode");
      setSavedDeckId(newDeckId);
      setMode("builder");
    } catch (err) {
      console.error("[SalesKickoffEditor] Save error:", err);
      setError(err.message || "Failed to save presentation");
    } finally {
      setSaving(false);
      saveInProgress.current = false;
    }
  };

  const handleSlideUpdate = async (slideId, updates) => {
    try {
      await base44.entities.SalesKickoffSlide.update(slideId, updates);
      setEditingSlide(null);
    } catch (err) {
      console.error("Slide update error:", err);
      setError("Failed to update slide");
    }
  };

  const handleAddSlide = async () => {
    const newOrder = Math.max(...slides.map(s => s.slide_order || 0), 0) + 1;
    try {
      const newSlide = await base44.entities.SalesKickoffSlide.create({
        deck_id: savedDeckId,
        slide_order: newOrder,
        title: `New Slide`,
        layout_type: "hero",
        accent_colour: "pink",
      });
      setSelectedSlideId(newSlide.id);
    } catch (err) {
      setError("Failed to add slide");
    }
  };

  const handleDeleteSlide = async (slideId) => {
    if (confirm("Delete this slide?")) {
      try {
        await base44.entities.SalesKickoffSlide.delete(slideId);
        if (selectedSlideId === slideId) setSelectedSlideId(null);
      } catch (err) {
        setError("Failed to delete slide");
      }
    }
  };

  const handleDuplicateSlide = async (slide) => {
    const newOrder = Math.max(...slides.map(s => s.slide_order || 0), 0) + 1;
    try {
      await base44.entities.SalesKickoffSlide.create({
        ...slide,
        id: undefined,
        deck_id: savedDeckId,
        slide_order: newOrder,
        title: `${slide.title} (Copy)`,
      });
    } catch (err) {
      setError("Failed to duplicate slide");
    }
  };

  const handleReorderSlide = async (slideId, direction) => {
    const currentIndex = slides.findIndex(s => s.id === slideId);
    if ((direction === "up" && currentIndex === 0) || (direction === "down" && currentIndex === slides.length - 1)) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const currentSlide = slides[currentIndex];
    const targetSlide = slides[targetIndex];

    try {
      await Promise.all([
        base44.entities.SalesKickoffSlide.update(currentSlide.id, { slide_order: targetSlide.slide_order }),
        base44.entities.SalesKickoffSlide.update(targetSlide.id, { slide_order: currentSlide.slide_order }),
      ]);
    } catch (err) {
      setError("Failed to reorder slides");
    }
  };

  const cardBg = isDark
    ? "linear-gradient(145deg, rgba(15,23,42,0.68) 0%, rgba(15,23,42,0.50) 100%)"
    : "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,246,255,0.85) 100%)";
  const cardBorder = isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.07)";

  // Form Mode
  if (mode === "form") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between p-5 rounded-2xl" style={{ background: cardBg, border: cardBorder }}>
          <h2 className="text-lg font-bold" style={{ color: isDark ? "#ffffff" : "#000000" }}>
            {deck.id ? "Edit Presentation" : "New Presentation"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg" style={{ background: `${ACCENT}20`, color: ACCENT, cursor: "pointer" }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="rounded-2xl p-5 space-y-4" style={{ background: cardBg, border: cardBorder }}>
          {error && (
            <div className="p-3 rounded-lg" style={{ background: "#ef444420", border: "1px solid #ef444440", color: "#ef4444" }}>
              <p className="text-xs font-semibold">{error}</p>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold block mb-2" style={{ color: isDark ? "#ffffff" : "#000000" }}>
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Q2 2026 Kickoff"
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{
                background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.07)",
                color: isDark ? "#ffffff" : "#000000",
              }}
            />
          </div>

          <div>
            <label className="text-xs font-semibold block mb-2" style={{ color: isDark ? "#ffffff" : "#000000" }}>
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{
                background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.07)",
                color: isDark ? "#ffffff" : "#000000",
              }}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleDeckFormSave}
              disabled={saving}
              className="flex-1 px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 text-white"
              style={{ background: ACCENT, opacity: saving ? 0.5 : 1, cursor: saving ? "not-allowed" : "pointer" }}>
              <Save className="w-4 h-4" /> {saving ? "Creating..." : "Save & Create Slides"}
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg font-semibold"
              style={{ background: `${ACCENT}20`, color: ACCENT, cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Builder Mode
  return (
    <div className="space-y-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-5 rounded-2xl" style={{ background: cardBg, border: cardBorder }}>
        <div>
          <h2 className="text-lg font-bold" style={{ color: isDark ? "#ffffff" : "#000000" }}>{formData.title}</h2>
          <p className="text-xs mt-1" style={{ color: isDark ? "rgba(255,255,255,0.60)" : "rgba(0,0,0,0.60)" }}>Deck Builder</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="p-2 rounded-lg" style={{ background: `${ACCENT}20`, color: ACCENT, cursor: "pointer" }}>
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-12 gap-4 flex-1 min-h-0">
        {/* Left Sidebar - Slide List */}
        <div className="col-span-3 rounded-2xl p-4 overflow-hidden flex flex-col" style={{ background: cardBg, border: cardBorder }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold" style={{ color: isDark ? "#ffffff" : "#000000" }}>Slides ({slides.length})</h3>
            <button onClick={handleAddSlide} className="p-1.5 rounded-lg" style={{ background: `${ACCENT}20`, color: ACCENT }}>
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {slides.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-xs text-center" style={{ color: isDark ? "rgba(255,255,255,0.40)" : "rgba(0,0,0,0.40)" }}>
                Add your first slide
              </p>
            </div>
          ) : (
            <div className="space-y-2 overflow-y-auto flex-1">
              {slides.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => setSelectedSlideId(slide.id)}
                  className="w-full text-left p-2 rounded-lg text-xs transition-all"
                  style={{
                    background: selectedSlideId === slide.id ? `${ACCENT}30` : isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                    border: selectedSlideId === slide.id ? `1px solid ${ACCENT}` : "1px solid transparent",
                    color: isDark ? "#ffffff" : "#000000",
                  }}>
                  <p className="font-semibold truncate">{idx + 1}. {slide.title}</p>
                  <p style={{ color: isDark ? "rgba(255,255,255,0.40)" : "rgba(0,0,0,0.40)" }}>{slide.layout_type}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Center - Preview */}
        <div className="col-span-6 rounded-2xl p-6 overflow-y-auto flex items-center justify-center" style={{ background: cardBg, border: cardBorder, minHeight: "400px" }}>
          {selectedSlide ? (
            <SalesKickoffSlideRenderer slide={selectedSlide} isDark={isDark} isManager={true} />
          ) : (
            <p style={{ color: isDark ? "rgba(255,255,255,0.40)" : "rgba(0,0,0,0.40)" }}>Select a slide</p>
          )}
        </div>

        {/* Right - Slide Editor */}
        <div className="col-span-3 rounded-2xl p-4 overflow-y-auto flex flex-col" style={{ background: cardBg, border: cardBorder }}>
          {selectedSlide ? (
            <>
              <h3 className="text-sm font-bold mb-4" style={{ color: isDark ? "#ffffff" : "#000000" }}>Edit Slide</h3>

              <div className="space-y-3 flex-1">
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: isDark ? "#ffffff" : "#000000" }}>Title</label>
                  <input
                    type="text"
                    value={editingSlide?.title ?? selectedSlide.title}
                    onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                    className="w-full px-2 py-1 rounded text-xs"
                    style={{
                      background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                      border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.07)",
                      color: isDark ? "#ffffff" : "#000000",
                    }}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: isDark ? "#ffffff" : "#000000" }}>Layout</label>
                  <select
                    value={editingSlide?.layout_type ?? selectedSlide.layout_type}
                    onChange={(e) => setEditingSlide({ ...editingSlide, layout_type: e.target.value })}
                    className="w-full px-2 py-1 rounded text-xs"
                    style={{
                      background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                      border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.07)",
                      color: isDark ? "#ffffff" : "#000000",
                    }}>
                    <option value="hero">Hero</option>
                    <option value="kpi_grid">KPI Grid</option>
                    <option value="timeline">Timeline</option>
                    <option value="resource_cards">Resources</option>
                    <option value="acknowledgement">Acknowledgement</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: isDark ? "#ffffff" : "#000000" }}>Accent</label>
                  <select
                    value={editingSlide?.accent_colour ?? selectedSlide.accent_colour}
                    onChange={(e) => setEditingSlide({ ...editingSlide, accent_colour: e.target.value })}
                    className="w-full px-2 py-1 rounded text-xs"
                    style={{
                      background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                      border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.07)",
                      color: isDark ? "#ffffff" : "#000000",
                    }}>
                    <option value="pink">Pink</option>
                    <option value="purple">Purple</option>
                    <option value="cyan">Cyan</option>
                  </select>
                </div>
              </div>

              {editingSlide && (
                <button
                  onClick={() => handleSlideUpdate(selectedSlide.id, editingSlide)}
                  className="w-full px-3 py-2 rounded-lg text-xs font-semibold text-white mt-4"
                  style={{ background: ACCENT }}>
                  Save Changes
                </button>
              )}

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleReorderSlide(selectedSlide.id, "up")}
                  className="flex-1 px-2 py-1.5 rounded text-xs"
                  style={{ background: `${ACCENT}20`, color: ACCENT }}>
                  <ChevronUp className="w-3 h-3 mx-auto" />
                </button>
                <button
                  onClick={() => handleReorderSlide(selectedSlide.id, "down")}
                  className="flex-1 px-2 py-1.5 rounded text-xs"
                  style={{ background: `${ACCENT}20`, color: ACCENT }}>
                  <ChevronDown className="w-3 h-3 mx-auto" />
                </button>
                <button
                  onClick={() => handleDuplicateSlide(selectedSlide)}
                  className="flex-1 px-2 py-1.5 rounded text-xs"
                  style={{ background: `${ACCENT}20`, color: ACCENT }}>
                  <Copy className="w-3 h-3 mx-auto" />
                </button>
                <button
                  onClick={() => handleDeleteSlide(selectedSlide.id)}
                  className="flex-1 px-2 py-1.5 rounded text-xs"
                  style={{ background: "#ef444420", color: "#ef4444" }}>
                  <Trash2 className="w-3 h-3 mx-auto" />
                </button>
              </div>
            </>
          ) : (
            <p className="text-xs text-center" style={{ color: isDark ? "rgba(255,255,255,0.40)" : "rgba(0,0,0,0.40)" }}>
              Select a slide to edit
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
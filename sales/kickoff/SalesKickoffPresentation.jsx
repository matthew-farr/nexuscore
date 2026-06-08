import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useTheme } from "../../ThemeProvider";
import { useAuth } from "../../../lib/AuthContext";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SalesKickoffSlideRenderer from "./SalesKickoffSlideRenderer";

const ACCENT = "#8b5cf6";

export default function SalesKickoffPresentation({ deck, onClose }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { user } = useAuth();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [acknowledged, setAcknowledged] = useState(false);

  const isManager = user?.role === "manager" || user?.role === "Manager" || user?.role === "admin" || user?.role === "Admin";

  const { data: slides = [] } = useQuery({
    queryKey: ["salesKickoffSlides", deck.id],
    queryFn: () => base44.entities.SalesKickoffSlide.filter({ deck_id: deck.id, is_active: true }, "slide_order", 100),
  });

  const { data: myAcknowledgement } = useQuery({
    queryKey: ["myKickoffAcknowledgement", deck.id, user?.id],
    queryFn: async () => {
      const res = await base44.entities.SalesKickoffAcknowledgement.filter({ 
        deck_id: deck.id, 
        user_id: user?.id 
      }, "-created_date", 1);
      return res.length > 0;
    },
  });

  useEffect(() => {
    if (myAcknowledgement) setAcknowledged(true);
  }, [myAcknowledgement]);

  const currentSlide = slides[currentSlideIndex];
  const totalSlides = slides.length;
  const isLastSlide = currentSlideIndex === totalSlides - 1;
  const isAcknowledgementSlide = currentSlide?.layout_type === "acknowledgement";

  const handleNext = () => {
    if (currentSlideIndex < totalSlides - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const handleAcknowledge = async () => {
    await base44.entities.SalesKickoffAcknowledgement.create({
      deck_id: deck.id,
      user_id: user?.id,
      user_name: user?.full_name,
      acknowledged_at: new Date().toISOString(),
      acknowledgement_text: "Acknowledged",
    });
    setAcknowledged(true);
  };

  if (!currentSlide) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: isDark ? "#050816" : "#ffffff" }}>
        <p style={{ color: isDark ? "#ffffff" : "#000000" }}>Loading presentation...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: isDark ? "#050816" : "#ffffff" }}>
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-10 p-2 rounded-lg transition-all hover:scale-110"
        style={{
          background: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.05)",
          border: isDark ? "1px solid rgba(255,255,255,0.20)" : "1px solid rgba(0,0,0,0.10)",
          color: isDark ? "#ffffff" : "#000000",
        }}>
        <X className="w-5 h-5" />
      </button>

      {/* Slide Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlideIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex items-center justify-center p-8 overflow-auto">
          <div className="w-full max-w-5xl">
            <SalesKickoffSlideRenderer
              slide={currentSlide}
              isDark={isDark}
              isManager={isManager}
              onAcknowledge={isAcknowledgementSlide && !acknowledged ? handleAcknowledge : null}
              isAcknowledged={acknowledged}
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <div className="flex items-center justify-between p-6 border-t"
        style={{ borderColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)" }}>
        
        <button
          onClick={handlePrevious}
          disabled={currentSlideIndex === 0}
          className="p-2 rounded-lg transition-all"
          style={{
            background: currentSlideIndex === 0 ? "rgba(139,92,246,0.10)" : `${ACCENT}20`,
            border: `1px solid ${ACCENT}30`,
            color: ACCENT,
            cursor: currentSlideIndex === 0 ? "not-allowed" : "pointer",
            opacity: currentSlideIndex === 0 ? 0.5 : 1,
          }}>
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold" style={{ color: isDark ? "#ffffff" : "#000000" }}>
            {currentSlideIndex + 1} / {totalSlides}
          </span>
          <div className="flex gap-1">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlideIndex(idx)}
                className="rounded-full transition-all"
                style={{
                  width: idx === currentSlideIndex ? "24px" : "8px",
                  height: "8px",
                  background: idx === currentSlideIndex ? ACCENT : `${ACCENT}40`,
                  cursor: "pointer",
                }}>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleNext}
          disabled={currentSlideIndex === totalSlides - 1}
          className="p-2 rounded-lg transition-all"
          style={{
            background: currentSlideIndex === totalSlides - 1 ? "rgba(139,92,246,0.10)" : `${ACCENT}20`,
            border: `1px solid ${ACCENT}30`,
            color: ACCENT,
            cursor: currentSlideIndex === totalSlides - 1 ? "not-allowed" : "pointer",
            opacity: currentSlideIndex === totalSlides - 1 ? 0.5 : 1,
          }}>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Presenter Notes */}
      {isManager && currentSlide?.presenter_notes && (
        <div className="px-6 py-3 border-t" style={{ borderColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)" }}>
          <p className="text-xs font-semibold mb-1" style={{ color: isDark ? "#ffffff" : "#000000" }}>Presenter Notes:</p>
          <p className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.70)" : "rgba(0,0,0,0.60)" }}>
            {currentSlide.presenter_notes}
          </p>
        </div>
      )}
    </div>
  );
}
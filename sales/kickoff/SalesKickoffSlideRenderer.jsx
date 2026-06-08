import { motion } from "framer-motion";
import { CheckCircle, ArrowRight } from "lucide-react";

const COLORS = {
  pink: { main: "#ec2ca3", light: "#ec2ca320" },
  purple: { main: "#8b5cf6", light: "#8b5cf620" },
  cyan: { main: "#06b6d4", light: "#06b6d420" },
};

export default function SalesKickoffSlideRenderer({ slide, isDark, isManager, onAcknowledge, isAcknowledged }) {
  const accentColor = COLORS[slide?.accent_colour || "pink"].main;
  const accentLight = COLORS[slide?.accent_colour || "pink"].light;

  const containerClasses = "w-full max-w-4xl mx-auto";
  const headingClasses = "text-4xl font-extrabold mb-4";
  const textClasses = isDark ? "#ffffff" : "#000000";
  const muteClasses = isDark ? "rgba(255,255,255,0.60)" : "rgba(0,0,0,0.60)";

  const renderLayout = () => {
    switch (slide?.layout_type) {
      case "hero":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={containerClasses}>
            <div className="text-center space-y-6">
              {slide.icon && (
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
                    style={{ background: accentLight, border: `2px solid ${accentColor}` }}>
                    <span className="text-4xl">{slide.icon}</span>
                  </div>
                </div>
              )}
              <h1 className={headingClasses} style={{ color: textClasses }}>{slide.title}</h1>
              {slide.subtitle && (
                <p className="text-xl" style={{ color: muteClasses }}>{slide.subtitle}</p>
              )}
            </div>
          </motion.div>
        );

      case "kpi_grid":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={containerClasses}>
            <h1 className={headingClasses} style={{ color: textClasses }}>{slide.title}</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-xl text-center"
                  style={{
                    background: isDark ? "rgba(15,23,42,0.50)" : "rgba(255,255,255,0.50)",
                    border: `1px solid ${accentColor}30`,
                  }}>
                  <p className="text-2xl font-bold" style={{ color: accentColor }}>KPI {i}</p>
                  <p className="text-xs mt-2" style={{ color: muteClasses }}>Metric</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      case "timeline":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={containerClasses}>
            <h1 className={headingClasses} style={{ color: textClasses }}>{slide.title}</h1>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className="flex gap-4 p-4 rounded-lg"
                  style={{
                    background: isDark ? "rgba(15,23,42,0.50)" : "rgba(255,255,255,0.50)",
                    border: `1px solid ${accentColor}30`,
                  }}>
                  <div className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center font-bold"
                    style={{ background: accentColor, color: "#ffffff" }}>
                    {i}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold" style={{ color: textClasses }}>Step {i}</p>
                    <p className="text-sm mt-1" style={{ color: muteClasses }}>Process details here</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      case "resource_cards":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={containerClasses}>
            <h1 className={headingClasses} style={{ color: textClasses }}>{slide.title}</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {slide.resource_links?.map((link, i) => (
                <motion.a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 rounded-lg flex items-center justify-between group cursor-pointer"
                  style={{
                    background: isDark ? "rgba(15,23,42,0.50)" : "rgba(255,255,255,0.50)",
                    border: `1px solid ${accentColor}30`,
                  }}>
                  <p className="font-semibold text-sm group-hover:underline" style={{ color: accentColor }}>
                    {link.label}
                  </p>
                  <ArrowRight className="w-4 h-4" style={{ color: accentColor }} />
                </motion.a>
              ))}
            </div>
          </motion.div>
        );

      case "acknowledgement":
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={containerClasses}>
            <div className="text-center space-y-8">
              <div className="flex justify-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-24 h-24 rounded-full flex items-center justify-center"
                  style={{ background: accentLight, border: `2px solid ${accentColor}` }}>
                  <CheckCircle className="w-12 h-12" style={{ color: accentColor }} />
                </motion.div>
              </div>
              <div>
                <h1 className={headingClasses} style={{ color: textClasses }}>Thank You</h1>
                <p className="text-lg" style={{ color: muteClasses }}>
                  Please acknowledge that you've completed this kickoff
                </p>
              </div>
              {!isAcknowledged && onAcknowledge && (
                <button
                  onClick={onAcknowledge}
                  className="px-8 py-3 rounded-lg font-semibold text-white transition-all hover:scale-105"
                  style={{
                    background: accentColor,
                    cursor: "pointer",
                  }}>
                  I Acknowledge
                </button>
              )}
              {isAcknowledged && (
                <div className="flex items-center justify-center gap-2 text-lg font-semibold" style={{ color: accentColor }}>
                  <CheckCircle className="w-6 h-6" />
                  Acknowledged
                </div>
              )}
            </div>
          </motion.div>
        );

      default:
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={containerClasses}>
            <h1 className={headingClasses} style={{ color: textClasses }}>{slide.title}</h1>
            {slide.subtitle && (
              <p className="text-lg mb-6" style={{ color: muteClasses }}>{slide.subtitle}</p>
            )}
            {slide.content_html && (
              <div
                dangerouslySetInnerHTML={{ __html: slide.content_html }}
                style={{ color: textClasses }}
              />
            )}
          </motion.div>
        );
    }
  };

  return <>{renderLayout()}</>;
}
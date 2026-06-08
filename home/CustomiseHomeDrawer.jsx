import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff, Lock, RotateCcw } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { useTheme } from "../ThemeProvider";

export default function CustomiseHomeDrawer({
  open,
  onClose,
  quickLinks = [],
  hubs = [],
  preferences = {},
  onSave,
  onReset,
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [hiddenQuickLinks, setHiddenQuickLinks] = useState(new Set());
  const [hiddenHubs, setHiddenHubs] = useState(new Set());

  // Sync with preferences when drawer opens
  useEffect(() => {
    if (open && preferences) {
      const hiddenQL = preferences.hidden_quick_link_ids || [];
      const hiddenH = preferences.hidden_hub_ids || [];
      setHiddenQuickLinks(new Set(hiddenQL));
      setHiddenHubs(new Set(hiddenH));
    }
  }, [open, preferences]);

  const toggleQuickLink = (id, isMandatory) => {
    if (isMandatory) return;
    const newSet = new Set(hiddenQuickLinks);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setHiddenQuickLinks(newSet);
  };

  const toggleHub = (id, isMandatory) => {
    if (isMandatory) return;
    const newSet = new Set(hiddenHubs);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setHiddenHubs(newSet);
  };

  const handleSave = () => {
    onSave({
      hidden_quick_link_ids: Array.from(hiddenQuickLinks),
      hidden_hub_ids: Array.from(hiddenHubs),
    });
    onClose();
  };

  const handleReset = () => {
    if (preferences) {
      setHiddenQuickLinks(new Set(preferences.hidden_quick_link_ids || []));
      setHiddenHubs(new Set(preferences.hidden_hub_ids || []));
    }
    onReset?.();
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:w-[420px] overflow-y-auto"
        style={{
          background: isDark
            ? "linear-gradient(135deg, #0d0418 0%, #060c20 100%)"
            : "linear-gradient(135deg, #fefeff 0%, #f8f6ff 100%)",
        }}
      >
        <SheetHeader className="space-y-3">
          <SheetTitle className="text-2xl font-bold">Customise Home</SheetTitle>
          <p
            className="text-sm"
            style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}
          >
            Show or hide sections on your homepage
          </p>
        </SheetHeader>

        <div className="mt-8 space-y-6">
          {/* Quick Links Section */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              Quick Links
              {quickLinks.some((q) => q.is_mandatory) && (
                <Lock className="w-3 h-3 opacity-50" />
              )}
            </h3>
            <div className="space-y-2">
              {quickLinks.length === 0 ? (
                <p
                  className="text-xs italic"
                  style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}
                >
                  No quick links available
                </p>
              ) : (
                quickLinks.map((link) => (
                  <motion.button
                    key={link.id}
                    onClick={() => toggleQuickLink(link.id, link.is_mandatory)}
                    disabled={link.is_mandatory}
                    whileHover={{ x: 4 }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: !hiddenQuickLinks.has(link.id)
                        ? isDark
                          ? "rgba(236,44,163,0.12)"
                          : "rgba(236,44,163,0.08)"
                        : isDark
                          ? "rgba(255,255,255,0.05)"
                          : "rgba(0,0,0,0.03)",
                      border: isDark
                        ? "1px solid rgba(255,255,255,0.10)"
                        : "1px solid rgba(0,0,0,0.08)",
                    }}
                  >
                    <div className="flex-1 text-left">
                      <p
                        className="font-medium text-sm"
                        style={{ color: isDark ? "#ffffff" : "#000000" }}
                      >
                        {link.title}
                      </p>
                    </div>
                    <AnimatePresence mode="wait">
                      {link.is_mandatory ? (
                        <Lock
                          key="lock"
                          className="w-4 h-4 opacity-50"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        />
                      ) : !hiddenQuickLinks.has(link.id) ? (
                       <Eye
                         key="eye"
                         className="w-4 h-4 text-primary"
                         initial={{ scale: 0 }}
                         animate={{ scale: 1 }}
                         exit={{ scale: 0 }}
                       />
                      ) : (
                       <EyeOff
                         key="eye-off"
                         className="w-4 h-4 opacity-40"
                         initial={{ scale: 0 }}
                         animate={{ scale: 1 }}
                         exit={{ scale: 0 }}
                       />
                      )}
                    </AnimatePresence>
                  </motion.button>
                ))
              )}
            </div>
          </div>

          <Separator />

          {/* Hubs Section */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              Hubs
              {hubs.some((h) => h.is_mandatory) && (
                <Lock className="w-3 h-3 opacity-50" />
              )}
            </h3>
            <div className="space-y-2">
              {hubs.length === 0 ? (
                <p
                  className="text-xs italic"
                  style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}
                >
                  No hubs available
                </p>
              ) : (
                hubs.map((hub) => (
                  <motion.button
                    key={hub.id}
                    onClick={() => toggleHub(hub.id, hub.is_mandatory)}
                    disabled={hub.is_mandatory}
                    whileHover={{ x: 4 }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: !hiddenHubs.has(hub.id)
                        ? isDark
                          ? "rgba(236,44,163,0.12)"
                          : "rgba(236,44,163,0.08)"
                        : isDark
                          ? "rgba(255,255,255,0.05)"
                          : "rgba(0,0,0,0.03)",
                      border: isDark
                        ? "1px solid rgba(255,255,255,0.10)"
                        : "1px solid rgba(0,0,0,0.08)",
                    }}
                  >
                    <div className="flex-1 text-left">
                      <p
                        className="font-medium text-sm"
                        style={{ color: isDark ? "#ffffff" : "#000000" }}
                      >
                        {hub.name}
                      </p>
                    </div>
                    <AnimatePresence mode="wait">
                      {hub.is_mandatory ? (
                        <Lock
                          key="lock"
                          className="w-4 h-4 opacity-50"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        />
                      ) : !hiddenHubs.has(hub.id) ? (
                       <Eye
                         key="eye"
                         className="w-4 h-4 text-primary"
                         initial={{ scale: 0 }}
                         animate={{ scale: 1 }}
                         exit={{ scale: 0 }}
                       />
                      ) : (
                       <EyeOff
                         key="eye-off"
                         className="w-4 h-4 opacity-40"
                         initial={{ scale: 0 }}
                         animate={{ scale: 1 }}
                         exit={{ scale: 0 }}
                       />
                      )}
                    </AnimatePresence>
                  </motion.button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 p-4 border-t" style={{
          borderColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)",
          background: isDark
            ? "rgba(13,4,24,0.95)"
            : "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
        }}>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex-1"
              size="sm"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-2" />
              Reset
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1"
              size="sm"
              style={{
                background: "linear-gradient(135deg, #ec2ca3, #7c3aed)",
              }}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";
import GreetingBanner from "../components/home/GreetingBanner";
import QuickLinksSection from "../components/home/QuickLinksSection";
import MyHubsSection from "../components/home/MyHubsSection";
import RecentAndBookmarks from "../components/home/RecentAndBookmarks";
import CalendarWidget from "../components/home/CalendarWidget";
import NewsWidget from "../components/home/NewsWidget";
import { getPublishedAnnouncements } from "../services/announcementService";
import AnnouncementDetailModal from "../components/announcements/AnnouncementDetailModal";
import CustomiseHomeDrawer from "../components/home/CustomiseHomeDrawer";
import PageContainer from "../components/ui-custom/PageContainer";
import { useTheme } from "../components/ThemeProvider";
import { useHomepageData } from "../hooks/useHomepageData";

export default function Home() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const [customiseOpen, setCustomiseOpen] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  const {
    profile, quickLinks, allQuickLinks, hubs, allHubs, loading,
    preferences, savePreferences, resetPreferences,
  } = useHomepageData();

  useEffect(() => {
    const loadAnnouncements = async () => {
      if (profile) {
        const published = await getPublishedAnnouncements(profile);
        setAnnouncements(published);
      }
    };
    loadAnnouncements();
  }, [profile]);

  return (
    <PageContainer>
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-4">
          <GreetingBanner profile={profile} />

          {/* Section header with Customise button */}
          <div className="flex items-center justify-between">
            <div /> {/* spacer */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setCustomiseOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.045)",
                border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.08)",
                color: isDark ? "rgba(255,255,255,0.65)" : "#475569",
              }}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Customise Home
            </motion.button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <QuickLinksSection quickLinks={quickLinks} loading={loading} />
            <MyHubsSection hubs={hubs} loading={loading} />
          </div>

          <RecentAndBookmarks />
        </div>

        {/* Right Utility Column */}
        <div className="w-full xl:w-[280px] flex-shrink-0 space-y-4">
          <CalendarWidget />
          <NewsWidget
            userProfile={profile}
            onSelectAnnouncement={setSelectedAnnouncement}
            onViewAll={() => navigate("/news")}
          />
        </div>
      </div>

      {/* Customise drawer */}
      {/* Pass the full accessible lists so hidden items can be re-enabled */}
      <CustomiseHomeDrawer
        open={customiseOpen}
        onClose={() => setCustomiseOpen(false)}
        quickLinks={allQuickLinks}
        hubs={allHubs}
        preferences={preferences}
        onSave={savePreferences}
        onReset={resetPreferences}
      />

      {/* Announcement detail modal */}
      {selectedAnnouncement && (
        <AnnouncementDetailModal
          announcement={selectedAnnouncement}
          onClose={() => setSelectedAnnouncement(null)}
          isAdmin={false}
          userProfile={profile}
        />
      )}
    </PageContainer>
  );
}
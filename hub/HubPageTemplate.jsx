import PageContainer from "../ui-custom/PageContainer";
import HubHero from "./HubHero";
import HubQuickActions from "./HubQuickActions";
import HubStatsRow from "./HubStatsRow";
import HubWidgetCard from "./HubWidgetCard";
import HubActivityFeed from "./HubActivityFeed";
import HubResourceList from "./HubResourceList";
import HubAnnouncementCard from "./HubAnnouncementCard";
import HubSidebarPanel from "./HubSidebarPanel";
import CalendarWidget from "../home/CalendarWidget";
import { useTheme } from "../ThemeProvider";
import { Bookmark, Bell, Clock, Star, Users } from "lucide-react";

export default function HubPageTemplate({
  icon,
  title,
  description,
  accentColor = "#0ea5e9",
  accentColor2,
  stats = [],
  quickActions = [],
  featuredItems = [],
  featuredContent = null,
  resources = [],
  activityItems = [],
  announcements = [],
  pinnedItems = [],
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const secondary = accentColor2 || accentColor;

  return (
    <PageContainer>
      {/* Hero */}
      <HubHero
        icon={icon}
        title={title}
        description={description}
        accentColor={accentColor}
        accentColor2={secondary}
        stats={stats}
      />

      {/* Quick Actions */}
      <HubQuickActions actions={quickActions} accentColor={accentColor} />

      {/* Stats Row */}
      {stats.length > 0 && <HubStatsRow stats={stats} accentColor={accentColor} delay={0.08} />}

      {/* Main layout: content + sidebar */}
      <div className="flex flex-col xl:flex-row gap-4">
        {/* Main Content Column */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Featured Content */}
          {featuredContent ? featuredContent : (
            <HubWidgetCard title="Featured Content" actionLabel="Browse all" action={() => {}} delay={0.12} accentColor={accentColor}>
              <div className="space-y-2">
                {featuredItems.length > 0 ? featuredItems.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-xl cursor-pointer group transition-all duration-150"
                      style={{
                        background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)",
                        border: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)",
                      }}
                    >
                      {Icon && (
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: `${accentColor}20`, border: `1px solid ${accentColor}30` }}
                        >
                          <Icon className="w-4 h-4" style={{ color: accentColor }} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: isDark ? "rgba(255,255,255,0.90)" : "hsl(230 25% 12%)" }}>
                          {item.title}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: isDark ? "rgba(180,195,220,0.55)" : "rgba(0,0,0,0.45)" }}>
                          {item.description}
                        </p>
                      </div>
                      {item.badge && (
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: `${accentColor}20`, color: accentColor, border: `1px solid ${accentColor}30` }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  );
                }) : (
                  <div className="py-6 text-center">
                    <Star className="w-8 h-8 mx-auto mb-2 opacity-20" style={{ color: accentColor }} />
                    <p className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)" }}>
                      No featured content yet
                    </p>
                  </div>
                )}
              </div>
            </HubWidgetCard>
          )}

          {/* Two-column widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <HubResourceList
              title="Quick Access"
              items={resources}
              accentColor={accentColor}
              delay={0.16}
            />
            <HubAnnouncementCard
              announcements={announcements}
              accentColor={accentColor}
              delay={0.18}
            />
          </div>

          {/* Activity Feed */}
          <HubActivityFeed
            items={activityItems}
            accentColor={accentColor}
            delay={0.20}
          />
        </div>

        {/* Right Sidebar */}
        <div className="w-full xl:w-[260px] flex-shrink-0 space-y-4">
          <CalendarWidget />

          <HubSidebarPanel title="Pinned" delay={0.22}>
            {pinnedItems.length > 0 ? (
              <div className="space-y-1">
                {pinnedItems.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 py-2 px-2 rounded-lg cursor-pointer group transition-all duration-150"
                    style={{ background: "transparent" }}
                    onMouseEnter={e => e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <Bookmark className="w-3 h-3 flex-shrink-0" style={{ color: accentColor }} />
                    <span className="text-xs truncate" style={{ color: isDark ? "rgba(255,255,255,0.75)" : "hsl(230 25% 20%)" }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.30)" }}>
                Pin items to find them quickly
              </p>
            )}
          </HubSidebarPanel>

          <HubSidebarPanel title="Notifications" delay={0.26}>
            <div className="flex items-center gap-2 py-2">
              <Bell className="w-4 h-4" style={{ color: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)" }} />
              <p className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.35)" }}>
                No new notifications
              </p>
            </div>
          </HubSidebarPanel>

          <HubSidebarPanel title="Team" delay={0.28}>
            <div className="flex items-center gap-2 py-1">
              <Users className="w-4 h-4" style={{ color: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)" }} />
              <p className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.35)" }}>
                Team activity coming soon
              </p>
            </div>
          </HubSidebarPanel>
        </div>
      </div>
    </PageContainer>
  );
}
import { useState, useEffect } from "react";
import { useAuth } from "../lib/AuthContext";
import { getPublishedAnnouncements, getAllAnnouncements, archiveAnnouncement } from "../services/announcementService";
import { useActivityTracking } from "../hooks/useActivityTracking";
import PageContainer from "../components/ui-custom/PageContainer";
import AnnouncementCard from "../components/announcements/AnnouncementCard";
import AnnouncementDetailModal from "../components/announcements/AnnouncementDetailModal";
import AnnouncementEditorModal from "../components/announcements/AnnouncementEditorModal";
import { useTheme } from "../components/ThemeProvider";
import { Search, Plus } from "lucide-react";
import { getCategoryConfig } from "../lib/announcementConfig";

export default function News() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isAdmin = user?.role === "Admin";

  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  useActivityTracking({
    entity_type: "hub",
    entity_id: "news",
    title: "News",
    route: "/news",
    icon: "Bell",
  });

  useEffect(() => {
    if (!user) return;
    const loadAnnouncements = async () => {
      setLoading(true);
      const data = isAdmin ? await getAllAnnouncements() : await getPublishedAnnouncements(user);
      // Sort: pinned first, then by publish date
      const sorted = data.sort((a, b) => {
        if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
        return new Date(b.publish_datetime || b.created_date) - new Date(a.publish_datetime || a.created_date);
      });
      setAnnouncements(sorted);
      setLoading(false);
    };
    loadAnnouncements();
  }, [user, isAdmin]);

  const refreshAnnouncements = async () => {
    if (!user) return;
    const data = isAdmin ? await getAllAnnouncements() : await getPublishedAnnouncements(user);
    const sorted = data.sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
      return new Date(b.publish_datetime || b.created_date) - new Date(a.publish_datetime || a.created_date);
    });
    setAnnouncements(sorted);
    setSelectedAnnouncement(null);
    setEditingAnnouncement(null);
    setShowEditor(false);
  };

  const filteredAnnouncements = announcements.filter((a) => {
    const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (a.excerpt && a.excerpt.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || a.category === categoryFilter;
    const matchesPriority = priorityFilter === "all" || a.priority === priorityFilter;
    return matchesSearch && matchesCategory && matchesPriority;
  });

  const pinnedAnnouncements = filteredAnnouncements.filter(a => a.is_pinned);
  const regularAnnouncements = filteredAnnouncements.filter(a => !a.is_pinned);

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: isDark ? "rgba(255,255,255,0.95)" : "hsl(230 25% 12%)" }}>
              News & Announcements
            </h1>
            <p style={{ color: isDark ? "rgba(255,255,255,0.50)" : "rgba(0,0,0,0.50)" }}>
              Stay informed with the latest company updates
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => {
                setEditingAnnouncement(null);
                setShowEditor(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: "hsl(320 85% 55%)",
                color: "white",
              }}
            >
              <Plus className="w-4 h-4" />
              New Announcement
            </button>
          )}
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: isDark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.30)" }} />
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg text-sm"
              style={{
                background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
                color: isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 15%)",
              }}
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm"
            style={{
              background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
              border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
              color: isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 15%)",
            }}
          >
            <option value="all">All Categories</option>
            <option value="company_update">Company Update</option>
            <option value="operations">Operations</option>
            <option value="sales">Sales</option>
            <option value="training">Training</option>
            <option value="compliance">Compliance</option>
            <option value="system">System</option>
            <option value="product">Product</option>
            <option value="people">People</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm"
            style={{
              background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
              border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
              color: isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 15%)",
            }}
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Pinned section */}
            {pinnedAnnouncements.length > 0 && (
              <div>
                <h2
                  className="text-sm font-semibold mb-3 px-1"
                  style={{ color: isDark ? "rgba(255,255,255,0.70)" : "rgba(0,0,0,0.70)" }}
                >
                  📌 Pinned
                </h2>
                <div className="space-y-2">
                  {pinnedAnnouncements.map((announcement) => (
                    <AnnouncementCard
                      key={announcement.id}
                      announcement={announcement}
                      onClick={() => setSelectedAnnouncement(announcement)}
                      isPriority
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Regular announcements */}
            {regularAnnouncements.length > 0 && (
              <div>
                {pinnedAnnouncements.length > 0 && (
                  <h2
                    className="text-sm font-semibold mb-3 px-1"
                    style={{ color: isDark ? "rgba(255,255,255,0.70)" : "rgba(0,0,0,0.70)" }}
                  >
                    All Updates
                  </h2>
                )}
                <div className="space-y-2">
                  {regularAnnouncements.map((announcement) => (
                    <AnnouncementCard
                      key={announcement.id}
                      announcement={announcement}
                      onClick={() => setSelectedAnnouncement(announcement)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {filteredAnnouncements.length === 0 && (
              <div className="text-center py-12">
                <p
                  className="text-sm"
                  style={{ color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)" }}
                >
                  No announcements found
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selectedAnnouncement && (
        <AnnouncementDetailModal
          announcement={selectedAnnouncement}
          onClose={() => setSelectedAnnouncement(null)}
          onEdit={(a) => setEditingAnnouncement(a)}
          onDelete={async () => {
            await archiveAnnouncement(selectedAnnouncement.id);
            await refreshAnnouncements();
          }}
          isAdmin={isAdmin}
          userProfile={user}
        />
      )}

      {/* Editor modal */}
      {showEditor && (
        <AnnouncementEditorModal
          announcement={editingAnnouncement}
          onClose={() => {
            setShowEditor(false);
            setEditingAnnouncement(null);
          }}
          onSave={refreshAnnouncements}
          userProfile={user}
        />
      )}
    </PageContainer>
  );
}
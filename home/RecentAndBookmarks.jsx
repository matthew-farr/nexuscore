import RecentlyViewedWidget from "./RecentlyViewedWidget";
import ActivityFeedWidget from "./ActivityFeedWidget";

export default function RecentAndBookmarks() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <RecentlyViewedWidget />
      <ActivityFeedWidget />
    </div>
  );
}
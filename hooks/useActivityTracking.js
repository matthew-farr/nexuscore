import { useEffect } from "react";
import { trackRecentlyViewed } from "@/services/activityService";

/**
 * Hook to automatically track recently viewed items
 * Call once per page/component that should be tracked
 */
export function useActivityTracking({
  entity_type,
  entity_id,
  title,
  route,
  icon = "Eye",
  enabled = true,
}) {
  useEffect(() => {
    if (!enabled || !entity_id) return;

    // Track with a small delay to ensure page is loaded
    const timer = setTimeout(() => {
      trackRecentlyViewed({
        entity_type,
        entity_id,
        title,
        route,
        icon,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [entity_id, entity_type, title, route, icon, enabled]);
}
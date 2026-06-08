import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const STORAGE_KEY = 'cd_viewed_releases';

function getViewedSet() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

function markViewed(releaseId) {
  const viewed = getViewedSet();
  viewed.add(releaseId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...viewed]));
}

export function useReleaseViewTracker() {
  const queryClient = useQueryClient();

  const trackView = useCallback(async (release) => {
    if (!release?.id || release.status !== 'published') return;

    const viewed = getViewedSet();
    if (viewed.has(release.id)) return; // already counted

    markViewed(release.id);

    try {
      await base44.functions.invoke('logReleaseView', {
        release_id: release.id,
      });
      // Refetch releases to get updated view count
      queryClient.invalidateQueries({ queryKey: ['featureReleases'] });
    } catch (err) {
      console.error('Failed to track view:', err);
    }
  }, [queryClient]);

  const hasViewed = useCallback((releaseId) => {
    return getViewedSet().has(releaseId);
  }, []);

  return { trackView, hasViewed };
}
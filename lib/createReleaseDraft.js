/**
 * createReleaseDraft
 *
 * Reusable helper to automatically create a FeatureRelease draft.
 * Call this from any feature, hub, admin page or tool when a new
 * feature or improvement is completed.
 *
 * Usage:
 *   import { createReleaseDraft } from '@/lib/createReleaseDraft';
 *
 *   await createReleaseDraft({
 *     title: 'Dark mode redesign',
 *     summary: 'Full dark mode support across all hubs',
 *     release_notes: '...',
 *     category: 'Improvement',           // New Feature | Improvement | Bug Fix | Security Update | Internal Update
 *     related_area: 'Design System',     // optional
 *     related_ticket: 'PROJ-123',        // optional — used for dedup
 *     source: 'auto',                    // manual | auto | jira | system
 *     created_by: user.full_name,        // optional
 *     is_major_release: false,           // optional
 *     visibility: 'all_staff',           // all_staff | admin_only
 *   });
 *
 * Dedup logic: skips creation if a non-archived release already exists with
 * the same title (case-insensitive). If related_ticket is provided it also
 * checks by ticket reference.
 *
 * Returns: the created record, or null if a duplicate was found.
 */

import { base44 } from '@/api/base44Client';

export async function createReleaseDraft({
  title,
  summary = '',
  release_notes = '',
  category = 'New Feature',
  related_area = '',
  related_ticket = '',
  source = 'auto',
  created_by = '',
  is_major_release = false,
  visibility = 'all_staff',
} = {}) {
  if (!title) {
    console.warn('[createReleaseDraft] title is required');
    return null;
  }

  // ── Dedup check ────────────────────────────────────────────────────────────
  try {
    const existing = await base44.entities.FeatureRelease.list('-created_date', 500);
    const lower = title.trim().toLowerCase();

    const duplicate = existing.find(r => {
      if (r.status === 'archived') return false;
      const titleMatch = (r.title || '').trim().toLowerCase() === lower;
      if (!titleMatch) return false;
      // If a ticket ref is provided, only consider it a dup if the ticket also matches
      if (related_ticket && r.related_ticket) {
        return r.related_ticket.trim().toLowerCase() === related_ticket.trim().toLowerCase();
      }
      return true;
    });

    if (duplicate) {
      console.info(`[createReleaseDraft] Duplicate found (id: ${duplicate.id}), skipping.`);
      return null;
    }
  } catch (err) {
    console.warn('[createReleaseDraft] Dedup check failed, proceeding with creation:', err.message);
  }

  // ── Create draft ───────────────────────────────────────────────────────────
  const today = new Date().toISOString().split('T')[0];

  const payload = {
    title: title.trim(),
    summary,
    release_notes,
    description: release_notes, // keep legacy field in sync
    category,
    status: 'draft',
    source,
    related_area,
    related_ticket,
    created_by,
    author_name: created_by,
    release_date: today,
    is_major_release,
    is_highlighted: is_major_release,
    visibility,
    published_date: null,
  };

  try {
    const record = await base44.entities.FeatureRelease.create(payload);
    console.info(`[createReleaseDraft] Draft created: "${title}" (id: ${record.id})`);
    return record;
  } catch (err) {
    console.error('[createReleaseDraft] Failed to create draft:', err.message);
    return null;
  }
}
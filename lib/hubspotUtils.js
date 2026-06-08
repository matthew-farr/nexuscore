import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

// ─── HTML Cleaner ─────────────────────────────────────────────────────────────

/**
 * Strips HTML from HubSpot body/description fields and decodes entities.
 * Preserves sensible line breaks from block-level tags.
 */
export function cleanHubSpotText(value) {
  if (!value) return "";
  if (typeof value !== "string") return String(value);

  let text = value;

  // Remove style/script blocks entirely
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");

  // Convert block-level closing tags to newlines to preserve spacing
  text = text.replace(/<\/p>/gi, "\n");
  text = text.replace(/<\/div>/gi, "\n");
  text = text.replace(/<\/li>/gi, "\n");
  text = text.replace(/<\/h[1-6]>/gi, "\n");
  text = text.replace(/<br\s*\/?>/gi, "\n");

  // Strip all remaining HTML tags
  text = text.replace(/<[^>]+>/g, "");

  // Decode HTML entities
  text = text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&#x2F;/gi, "/")
    .replace(/&apos;/gi, "'");

  // Collapse excessive blank lines (more than 2 consecutive newlines → 2)
  text = text.replace(/\n{3,}/g, "\n\n");

  return text.trim();
}

// ─── Owner Map Hook ───────────────────────────────────────────────────────────

let _ownersCache = null;
let _ownersFetching = false;
let _ownersCallbacks = [];

/**
 * Returns an owner map { [ownerId: string]: string } where the value is
 * the owner's display name (or email as fallback).
 * Fetches once and caches in module scope.
 */
export function useHubSpotOwners() {
  const [ownerMap, setOwnerMap] = useState(_ownersCache || {});

  useEffect(() => {
    if (_ownersCache) {
      setOwnerMap(_ownersCache);
      return;
    }
    if (_ownersFetching) {
      _ownersCallbacks.push(setOwnerMap);
      return;
    }
    _ownersFetching = true;
    _ownersCallbacks.push(setOwnerMap);

    base44.functions.invoke("getHubSpotOwners", {})
      .then(res => {
        const map = res?.data?.ownerMap || {};
        _ownersCache = map;
        _ownersCallbacks.forEach(cb => cb(map));
        _ownersCallbacks = [];
      })
      .catch(() => {
        _ownersCache = {};
        _ownersCallbacks.forEach(cb => cb({}));
        _ownersCallbacks = [];
      })
      .finally(() => {
        _ownersFetching = false;
      });
  }, []);

  return ownerMap;
}

/**
 * Resolves an owner ID to a display name using the owner map.
 * Returns "Unknown" if not found.
 */
export function resolveOwner(ownerId, ownerMap) {
  if (!ownerId) return null;
  const id = String(ownerId);
  return ownerMap[id] || "Unknown";
}
import type { Channel } from "@/types";
import { CACHE_KEY } from "./constants";
import { parseM3U } from "./m3u";

export interface CachedPlaylist { url: string; channels: Channel[]; fetchedAt: number }

export class PlaylistError extends Error {
  constructor(message: string, public hint?: string) { super(message); }
}

/**
 * Playlist API seam: tries the source directly, then falls back to the
 * same-origin /api/playlist route (plain server-side fetch of a public URL —
 * no auth/DRM/geo bypass). Swap this function to point at another backend later.
 */
export async function fetchPlaylistText(url: string, signal?: AbortSignal): Promise<string> {
  try {
    const res = await fetch(url, { signal, cache: "no-store" });
    if (!res.ok) throw new PlaylistError(`Server responded with HTTP ${res.status}.`);
    return await res.text();
  } catch (e) {
    if (e instanceof PlaylistError || (e as Error).name === "AbortError") throw e;
    console.warn("[playlist] direct fetch failed (likely CORS/network), trying /api/playlist", e);
    const res = await fetch(`/api/playlist?url=${encodeURIComponent(url)}`, { signal, cache: "no-store" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new PlaylistError(
        body.error || `Playlist could not be fetched (HTTP ${res.status}).`,
        "The playlist host may block browser requests (CORS) or be offline.",
      );
    }
    return await res.text();
  }
}

export async function loadPlaylist(url: string, signal?: AbortSignal) {
  const text = await fetchPlaylistText(url, signal);
  const { channels, skipped } = parseM3U(text);
  if (!channels.length) throw new PlaylistError("The playlist was loaded but contains no playable channels.");
  if (skipped) console.info(`[playlist] skipped ${skipped} malformed/duplicate entries`);
  return channels;
}

export function readCache(): CachedPlaylist | null {
  try { const r = localStorage.getItem(CACHE_KEY); return r ? (JSON.parse(r) as CachedPlaylist) : null; } catch { return null; }
}
export function writeCache(c: CachedPlaylist) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(c)); } catch (e) { console.warn("[playlist] cache write failed", e); }
}

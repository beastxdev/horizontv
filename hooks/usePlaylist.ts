"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Channel, LoadStatus } from "@/types";
import { CACHE_TTL_MS } from "@/lib/constants";
import { loadPlaylist, readCache, writeCache, PlaylistError } from "@/lib/playlist";

export function usePlaylist(url: string, enabled: boolean) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [status, setStatus] = useState<LoadStatus>("idle");
  const [error, setError] = useState<{ message: string; hint?: string } | null>(null);
  const [fetchedAt, setFetchedAt] = useState<number>();
  const [lastCount, setLastCount] = useState<number>();
  const [refreshed, setRefreshed] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async (force = false) => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    const cached = readCache();
    if (cached) setLastCount(cached.channels.length);
    if (!force && cached && cached.url === url && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      setChannels(cached.channels); setFetchedAt(cached.fetchedAt); setStatus("ready"); setError(null);
      return;
    }
    setStatus("loading"); setError(null);
    const timeout = setTimeout(() => ac.abort(), 30000);
    try {
      const list = await loadPlaylist(url, ac.signal);
      const now = Date.now();
      setChannels(list); setFetchedAt(now); setLastCount(list.length); setStatus("ready");
      writeCache({ url, channels: list, fetchedAt: now });
      if (force) setRefreshed((n) => n + 1);
    } catch (e) {
      if (ac.signal.aborted && abortRef.current !== ac) return; // superseded
      const err = e as Error;
      console.error("[playlist] load failed", e);
      setError({
        message: err.name === "AbortError" ? "Loading the playlist timed out." : err.message || "Unknown error",
        hint: e instanceof PlaylistError ? e.hint : "Check your connection and the playlist URL.",
      });
      // keep stale data usable if we have it
      if (cached && cached.url === url) { setChannels(cached.channels); setFetchedAt(cached.fetchedAt); setStatus("ready"); }
      else setStatus("error");
    } finally { clearTimeout(timeout); }
  }, [url]);

  useEffect(() => { if (enabled) load(false); return () => abortRef.current?.abort(); }, [enabled, load]);

  return { channels, status, error, fetchedAt, lastCount, refreshed, reload: () => load(true) };
}

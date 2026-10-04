"use client";
import { useCallback } from "react";
import { MAX_RECENT } from "@/lib/constants";
import { useLocalStorage } from "./useLocalStorage";

export function useRecentChannels() {
  const [ids, setIds] = useLocalStorage<string[]>("iptv:recent", []);
  const add = useCallback((id: string) => setIds((p) => [id, ...p.filter((x) => x !== id)].slice(0, MAX_RECENT)), [setIds]);
  const clear = useCallback(() => setIds([]), [setIds]);
  return { recentIds: Array.isArray(ids) ? ids : [], add, clear };
}

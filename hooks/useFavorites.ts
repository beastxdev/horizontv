"use client";
import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";

export function useFavorites() {
  const [ids, setIds] = useLocalStorage<string[]>("iptv:favorites", []);
  const set = useMemo(() => new Set(Array.isArray(ids) ? ids : []), [ids]);
  const toggle = useCallback((id: string) => setIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [id, ...p])), [setIds]);
  const clear = useCallback(() => setIds([]), [setIds]);
  return { favoriteIds: Array.isArray(ids) ? ids : [], favoriteSet: set, toggle, clear };
}

"use client";
import { useCallback, useEffect, useRef, useState } from "react";

/** Hydration-safe localStorage state. Renders `initial` first, then loads the stored value. */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);
  const ref = useRef(value);
  ref.current = value;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw != null) setValue({ ...(typeof initial === "object" && !Array.isArray(initial) ? initial : {}), ...JSON.parse(raw) } as T);
    } catch (e) { console.warn(`[storage] failed to read ${key}`, e); }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback((next: T | ((p: T) => T)) => {
    const v = typeof next === "function" ? (next as (p: T) => T)(ref.current) : next;
    ref.current = v;
    setValue(v);
    try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) { console.warn(`[storage] failed to write ${key}`, e); }
  }, [key]);

  return [value, update, hydrated] as const;
}

"use client";
import { useMemo } from "react";
import type { Channel, Filters } from "@/types";

export interface Facet { name: string; count: number }

function facet(list: Channel[], pick: (c: Channel) => string | undefined): Facet[] {
  const m = new Map<string, number>();
  for (const c of list) { const v = pick(c); if (v) m.set(v, (m.get(v) ?? 0) + 1); }
  return [...m].map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name));
}

export function useChannels(channels: Channel[], query: string, filters: Filters) {
  // Precomputed lowercase haystack: built once per playlist, reused on every keystroke.
  const index = useMemo(
    () => channels.map((c) => ({ c, h: [c.name, c.country, c.language, c.category, c.tvgId].filter(Boolean).join(" ").toLowerCase() })),
    [channels],
  );
  const countries = useMemo(() => facet(channels, (c) => c.country), [channels]);
  const categories = useMemo(() => facet(channels, (c) => c.category), [channels]);
  const languages = useMemo(() => facet(channels, (c) => c.language), [channels]);

  const filtered = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    return index
      .filter(({ c, h }) =>
        (!filters.country || c.country === filters.country) &&
        (!filters.category || c.category === filters.category) &&
        (!filters.language || c.language === filters.language) &&
        terms.every((t) => h.includes(t)))
      .map((x) => x.c);
  }, [index, query, filters]);

  return { filtered, countries, categories, languages };
}

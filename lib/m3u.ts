import type { Channel } from "@/types";
import { hashString, languageName, slugify } from "./utils";

const CATEGORY_RULES: [string, RegExp][] = [
  ["News", /news|info|noticias|nachrichten|actualit|24|cnn|bbc world|al jazeera|euronews|dw\b|france ?24|tg ?\d|sky tg/i],
  ["Sports", /sport|football|soccer|golf|racing|tennis|nba|nfl|espn|eurosport|dazn|f1|motorsport|fight|wrestl/i],
  ["Music", /music|mtv|hits|vh1|radio|mezzo|clubbing|trace|rock|jazz|deluxe|fm\b/i],
  ["Kids", /kids|kinder|junior|cartoon|nick|disney|baby|toon|boomerang|children|jim jam|pop\b/i],
  ["Movies", /movie|cinema|film|kino|hbo|cine|western|horror|thriller|series|drama|vod/i],
  ["Documentary", /docu|discovery|nat ?geo|history|science|nature|animal|planet|travel|explorer|wild|crime/i],
  ["Religious", /relig|church|god|islam|quran|christ|bible|catholic|jesus|gospel|sanatan|hindu|islamic|ewtn|peace/i],
];

export function inferCategory(name: string, group = ""): string {
  if (/^vod/i.test(group)) return "VOD";
  for (const [cat, re] of CATEGORY_RULES) if (re.test(name)) return cat;
  return "General";
}

const ATTR_RE = /([\w-]+)="([^"]*)"/g;

function parseExtinf(line: string) {
  const attrs: Record<string, string> = {};
  let m: RegExpExecArray | null;
  ATTR_RE.lastIndex = 0;
  while ((m = ATTR_RE.exec(line))) attrs[m[1].toLowerCase()] = m[2].trim();
  const rest = line.replace(ATTR_RE, "");
  const comma = rest.indexOf(",");
  const title = (comma >= 0 ? rest.slice(comma + 1) : "").trim();
  return { attrs, title };
}

/** Free-TV appends ⓈⓉⒼ style markers (geo/Twitch/etc.) to names – strip them from display. */
const cleanName = (s: string) => s.replace(/[\u24B6-\u24E9\u2460-\u2473]/g, "").replace(/\s+/g, " ").trim();

export interface ParseResult { channels: Channel[]; skipped: number }

export function parseM3U(text: string): ParseResult {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);
  if (!lines.some((l) => l.trim().startsWith("#EXTM3U") || l.trim().startsWith("#EXTINF"))) {
    throw new Error("The response is not a valid M3U playlist (missing #EXTM3U / #EXTINF).");
  }
  const channels: Channel[] = [];
  const seenUrl = new Set<string>();
  const seenId = new Set<string>();
  let pending: ReturnType<typeof parseExtinf> | null = null;
  let skipped = 0;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("#EXTINF")) {
      if (pending) skipped++;
      pending = parseExtinf(line);
      continue;
    }
    if (line.startsWith("#")) continue; // #EXTVLCOPT, #EXTGRP etc.
    if (!pending) continue;
    const { attrs, title } = pending;
    pending = null;
    if (!/^https?:\/\//i.test(line)) { skipped++; continue; }
    const name = cleanName(attrs["tvg-name"] || title);
    if (!name) { skipped++; continue; }
    if (seenUrl.has(line)) { skipped++; continue; }
    seenUrl.add(line);

    const group = attrs["group-title"] || "";
    const code = (attrs["tvg-country"] || "").split(/[;,|]/)[0].trim().toUpperCase() || undefined;
    const country = group.replace(/^VOD\s+/i, "").trim() || attrs["tvg-country"] || undefined;
    const tvgId = attrs["tvg-id"] || undefined;
    let id = `${slugify(tvgId || name)}-${hashString(line)}`;
    if (seenId.has(id)) id += "x";
    seenId.add(id);

    channels.push({
      id, name, url: line, tvgId, country, countryCode: code?.length === 2 ? code : undefined,
      logo: attrs["tvg-logo"] || undefined,
      language: languageName(attrs["tvg-language"]),
      category: inferCategory(name, group),
    });
  }
  return { channels, skipped };
}

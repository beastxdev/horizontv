import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const PRIVATE = /^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|0\.|\[?::1\]?$)/i;

/** Simple playlist fetch proxy (playlist text only, never streams). Public http(s) hosts only. */
export async function GET(req: NextRequest) {
  const target = req.nextUrl.searchParams.get("url");
  if (!target) return NextResponse.json({ error: "Missing url parameter." }, { status: 400 });
  let u: URL;
  try { u = new URL(target); } catch { return NextResponse.json({ error: "Invalid URL." }, { status: 400 }); }
  if (!/^https?:$/.test(u.protocol) || PRIVATE.test(u.hostname))
    return NextResponse.json({ error: "Only public http(s) playlist URLs are allowed." }, { status: 400 });
  try {
    const res = await fetch(u, { signal: AbortSignal.timeout(15000), cache: "no-store" });
    if (!res.ok) return NextResponse.json({ error: `Upstream responded with HTTP ${res.status}.` }, { status: 502 });
    const text = await res.text();
    if (text.length > 20_000_000) return NextResponse.json({ error: "Playlist too large." }, { status: 413 });
    return new NextResponse(text, { headers: { "content-type": "text/plain; charset=utf-8" } });
  } catch (e) {
    return NextResponse.json({ error: `Could not reach playlist host: ${(e as Error).message}` }, { status: 502 });
  }
}

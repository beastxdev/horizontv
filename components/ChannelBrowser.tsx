"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Channel, Filters, View } from "@/types";
import { useSettings } from "@/hooks/useSettings";
import { usePlaylist } from "@/hooks/usePlaylist";
import { useChannels } from "@/hooks/useChannels";
import { useFavorites } from "@/hooks/useFavorites";
import { useRecentChannels } from "@/hooks/useRecentChannels";
import { useDebounce } from "@/hooks/useDebounce";
import { usePlayer } from "@/hooks/usePlayer";
import Header from "./Header";
import FilterPanel from "./FilterPanel";
import StatsPanel from "./StatsPanel";
import PlaylistStatus from "./PlaylistStatus";
import VideoPlayer from "./VideoPlayer";
import CurrentChannel from "./CurrentChannel";
import ChannelGrid from "./ChannelGrid";
import RecentChannels from "./RecentChannels";
import SettingsModal from "./SettingsModal";
import MobileNav from "./MobileNav";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import ErrorBoundary from "./ErrorBoundary";
import { CardsSkeleton, PlayerSkeleton, SearchSkeleton } from "./LoadingSkeleton";

const NO_FILTERS: Filters = { country: "", category: "", language: "" };

export default function ChannelBrowser() {
  const { settings, patch, hydrated } = useSettings();
  const playlist = usePlaylist(settings.playlistUrl, hydrated);
  const { favoriteIds, favoriteSet, toggle, clear: clearFavs } = useFavorites();
  const recent = useRecentChannels();

  const [query, setQuery] = useState("");
  const debounced = useDebounce(query, 200);
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [view, setView] = useState<View>("all");
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toast, setToast] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const initialised = useRef(false);

  const { channels, status } = playlist;
  const { filtered, countries, categories, languages } = useChannels(channels, debounced, filters);
  const byId = useMemo(() => new Map(channels.map((c) => [c.id, c])), [channels]);

  const list = useMemo<Channel[]>(() => {
    if (view === "favorites") return filtered.filter((c) => favoriteSet.has(c.id));
    if (view === "recent") return recent.recentIds.map((id) => byId.get(id)).filter(Boolean) as Channel[];
    return filtered;
  }, [view, filtered, favoriteSet, recent.recentIds, byId]);

  const current = currentId ? byId.get(currentId) ?? null : null;

  const play = useCallback((c: Channel) => {
    setCurrentId(c.id);
    recent.add(c.id);
    patch({ lastChannelId: c.id });
    window.history.replaceState(null, "", `/watch?id=${encodeURIComponent(c.id)}`);
    if (window.innerWidth < 768) window.scrollTo({ top: 0, behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recent.add, patch]);

  const step = useCallback((dir: 1 | -1) => {
    if (!list.length) return;
    const i = list.findIndex((c) => c.id === currentId);
    const next = i === -1 ? (dir === 1 ? 0 : list.length - 1) : (i + dir + list.length) % list.length;
    play(list[next]);
  }, [list, currentId, play]);

  const player = usePlayer(current, { autoplay: settings.autoplay, onEnded: () => settings.autoplayNext && step(1) });

  // Initial channel: shared URL first, then last watched.
  useEffect(() => {
    if (initialised.current || status !== "ready" || !hydrated) return;
    initialised.current = true;
    const urlId = new URLSearchParams(window.location.search).get("id");
    const target = (urlId && byId.get(urlId)) || (settings.rememberLast && settings.lastChannelId ? byId.get(settings.lastChannelId) : undefined);
    if (target) { setCurrentId(target.id); if (urlId === target.id) recent.add(target.id); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, hydrated, byId]);

  // Toast on manual refresh
  useEffect(() => {
    if (!playlist.refreshed) return;
    setToast("Playlist updated successfully");
    const t = setTimeout(() => setToast(""), 3000); return () => clearTimeout(t);
  }, [playlist.refreshed]);

  // Keyboard shortcuts
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("input, select, textarea, [role=dialog], [contenteditable]") || e.metaKey || e.ctrlKey || e.altKey) return;
      if (t.tagName === "BUTTON" && e.key === " ") return; // let focused buttons activate
      switch (e.key) {
        case " ": e.preventDefault(); player.togglePlay(); break;
        case "f": case "F": player.toggleFullscreen(); break;
        case "m": case "M": player.toggleMute(); break;
        case "ArrowUp": e.preventDefault(); step(-1); break;
        case "ArrowDown": e.preventDefault(); step(1); break;
        case "/": e.preventDefault(); searchRef.current?.focus(); break;
      }
    };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [player, step]);

  const stats = useMemo(() => [
    { label: "Channels", value: channels.length }, { label: "Countries", value: countries.length },
    { label: "Categories", value: categories.length }, { label: "Languages", value: languages.length },
    { label: "Favorites", value: favoriteIds.filter((id) => byId.has(id)).length },
  ], [channels.length, countries.length, categories.length, languages.length, favoriteIds, byId]);

  const loading = status === "idle" || status === "loading";
  const scrollToGrid = () => gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const resetKey = `${view}|${debounced}|${filters.country}|${filters.category}|${filters.language}`;

  const sidebar = (
    <div className="space-y-5">
      <FilterPanel filters={filters} onChange={setFilters} countries={countries} categories={categories} languages={languages} />
      <StatsPanel stats={stats} loading={loading} />
      <PlaylistStatus count={channels.length} fetchedAt={playlist.fetchedAt} refreshing={status === "loading"} onRefresh={playlist.reload} />
      {playlist.error && status === "ready" && <p role="alert" className="text-xs text-amber-400">Refresh failed ({playlist.error.message}). Showing cached channels.</p>}
    </div>
  );

  return (
    <ErrorBoundary>
      <Header ref={searchRef} query={query} onQuery={setQuery} favCount={favoriteIds.length} favoritesActive={view === "favorites"}
        onFavorites={() => { setView((v) => (v === "favorites" ? "all" : "favorites")); scrollToGrid(); }} onSettings={() => setSettingsOpen(true)} />

      {status === "error" && playlist.error ? (
        <ErrorState message={playlist.error.message} hint={playlist.error.hint} lastCount={playlist.lastCount} onRetry={playlist.reload} />
      ) : (
        <main className="mx-auto grid max-w-[1600px] gap-5 px-4 py-5 pb-24 md:pb-8 lg:grid-cols-[18rem_1fr]">
          <aside className="order-2 lg:order-1 lg:sticky lg:top-20 lg:self-start">
            <details className="glass rounded-2xl p-4 lg:!block" open>
              <summary className="cursor-pointer text-sm font-semibold lg:hidden">Filters &amp; stats</summary>
              <div className="mt-3 lg:mt-0">{loading && !channels.length ? <div className="space-y-3"><SearchSkeleton /><SearchSkeleton /><SearchSkeleton /></div> : sidebar}</div>
            </details>
          </aside>

          <div className="order-1 min-w-0 space-y-4 lg:order-2">
            {loading && !current ? (<>{channels.length === 0 && <p className="text-sm text-muted" role="status">Loading channels...</p>}<PlayerSkeleton /></>) : (
              <>
                <VideoPlayer channel={current} player={player} onPrev={() => step(-1)} onNext={() => step(1)} onBack={scrollToGrid} />
                <CurrentChannel channel={current} player={player} favorite={!!current && favoriteSet.has(current.id)}
                  onToggleFavorite={() => current && toggle(current.id)} onPrev={() => step(-1)} onNext={() => step(1)} />
              </>
            )}

            <div ref={gridRef} className="scroll-mt-20">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div role="tablist" aria-label="Channel views" className="flex gap-1 rounded-xl bg-line/5 p-1">
                  {([["all", "All Channels"], ["favorites", "My Favorites"], ["recent", "Recently Watched"]] as const).map(([k, label]) => (
                    <button key={k} role="tab" aria-selected={view === k} onClick={() => setView(k)}
                      className={`rounded-lg px-3 py-1.5 text-sm transition ${view === k ? "bg-gradient-to-r from-accent to-accent-blue text-white" : "text-muted hover:text-fg"}`}>{label}</button>
                  ))}
                </div>
                {!loading && <p className="text-sm text-muted" role="status" aria-live="polite">{list.length.toLocaleString()} channel{list.length === 1 ? "" : "s"} found</p>}
              </div>

              {loading && !channels.length ? <CardsSkeleton n={12} /> :
                view === "recent" ? (
                  <RecentChannels channels={list} activeId={currentId ?? undefined} favoriteSet={favoriteSet} onPlay={play} onToggleFavorite={toggle} />
                ) : !list.length ? (
                  view === "favorites" && !favoriteIds.length ? <EmptyState icon="♡" title="No favorites yet" text="Tap ♡ on a channel to save it here." />
                  : <EmptyState icon="🔎" title="No channels found" text="Try another search term." />
                ) : (
                  <ChannelGrid channels={list} activeId={currentId ?? undefined} favoriteSet={favoriteSet} onPlay={play} onToggleFavorite={toggle} resetKey={resetKey} />
                )}
            </div>
          </div>
        </main>
      )}

      {toast && <div role="status" className="glass fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-xl px-4 py-2 text-sm animate-fadeIn md:bottom-6">{toast}</div>}

      <MobileNav view={view}
        onHome={() => { setView("all"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
        onSearch={() => { window.scrollTo({ top: 0 }); searchRef.current?.focus(); }}
        onFavorites={() => { setView("favorites"); scrollToGrid(); }} onSettings={() => setSettingsOpen(true)} />

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} settings={settings} onChange={patch}
        onClearFavorites={clearFavs} onClearRecent={recent.clear} onRefresh={playlist.reload} />
    </ErrorBoundary>
  );
}

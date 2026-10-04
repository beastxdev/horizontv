"use client";
import { forwardRef } from "react";
import SearchBar from "./SearchBar";

interface Props { query: string; onQuery: (v: string) => void; onFavorites: () => void; onSettings: () => void; favoritesActive: boolean; favCount: number }

const Header = forwardRef<HTMLInputElement, Props>(function Header({ query, onQuery, onFavorites, onSettings, favoritesActive, favCount }, ref) {
  return (
    <header className="sticky top-0 z-30 glass border-x-0 border-t-0">
      <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 py-3">
        <a href="/" className="flex shrink-0 items-center gap-2 font-bold" aria-label="Horizon IPTV home">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-accent to-accent-blue text-white">▶</span>
          <span className="hidden sm:inline">Horizon<span className="text-accent">IPTV</span></span>
        </a>
        <div className="max-w-xl flex-1"><SearchBar ref={ref} value={query} onChange={onQuery} /></div>
        <button className="btn hidden border border-line/10 md:inline-flex" onClick={onFavorites} aria-pressed={favoritesActive}>♥ Favorites{favCount ? ` (${favCount})` : ""}</button>
        <button className="btn hidden border border-line/10 md:inline-flex" onClick={onSettings}>⚙ Settings</button>
      </div>
    </header>
  );
});
export default Header;

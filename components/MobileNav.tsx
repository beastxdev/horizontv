"use client";
import type { View } from "@/types";
interface Props { view: View; onHome: () => void; onSearch: () => void; onFavorites: () => void; onSettings: () => void }
export default function MobileNav({ view, onHome, onSearch, onFavorites, onSettings }: Props) {
  const items = [
    { k: "home", label: "Home", icon: "🏠", fn: onHome, on: view === "all" },
    { k: "search", label: "Search", icon: "🔍", fn: onSearch, on: false },
    { k: "fav", label: "Favorites", icon: "♥", fn: onFavorites, on: view === "favorites" },
    { k: "set", label: "Settings", icon: "⚙", fn: onSettings, on: false },
  ];
  return (
    <nav aria-label="Primary" className="glass fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-x-0 border-b-0 pb-[env(safe-area-inset-bottom)] md:hidden">
      {items.map((i) => (
        <button key={i.k} onClick={i.fn} aria-current={i.on ? "page" : undefined} className={`flex flex-col items-center gap-0.5 py-2 text-[11px] ${i.on ? "text-accent" : "text-muted"}`}>
          <span className="text-lg" aria-hidden>{i.icon}</span>{i.label}
        </button>
      ))}
    </nav>
  );
}

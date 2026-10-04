"use client";
import { memo } from "react";
function FavoriteButton({ active, onToggle, name }: { active: boolean; onToggle: () => void; name: string }) {
  return (
    <button type="button" className="btn !px-2 text-lg" aria-pressed={active}
      aria-label={active ? `Remove ${name} from favorites` : `Add ${name} to favorites`}
      onClick={(e) => { e.stopPropagation(); onToggle(); }}>
      <span className={active ? "text-pink-500" : ""}>{active ? "♥" : "♡"}</span>
    </button>
  );
}
export default memo(FavoriteButton);

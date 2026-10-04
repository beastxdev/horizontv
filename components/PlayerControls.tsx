"use client";
import type { PlayerApi } from "@/hooks/usePlayer";
import { formatTime } from "@/lib/utils";

export default function PlayerControls({ p, onPrev, onNext }: { p: PlayerApi; onPrev: () => void; onNext: () => void }) {
  const playing = p.status === "playing";
  return (
    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-white opacity-100 transition md:opacity-0 md:group-hover/player:opacity-100 md:focus-within:opacity-100">
      {!p.isLive && p.time.duration > 0 && (
        <div className="mb-2 flex items-center gap-2 text-xs">
          <span>{formatTime(p.time.current)}</span>
          <input type="range" aria-label="Seek" min={0} max={p.time.duration} step={1} value={p.time.current} onChange={(e) => p.seek(+e.target.value)} className="h-1 flex-1 accent-violet-500" />
          <span>{formatTime(p.time.duration)}</span>
        </div>
      )}
      <div className="flex items-center gap-1.5">
        <button className="btn !px-2" onClick={onPrev} aria-label="Previous channel">⏮</button>
        <button className="btn !px-3 text-lg" onClick={p.togglePlay} aria-label={playing ? "Pause" : "Play"}>{playing ? "⏸" : "▶"}</button>
        <button className="btn !px-2" onClick={onNext} aria-label="Next channel">⏭</button>
        <button className="btn !px-2" onClick={p.toggleMute} aria-label={p.muted ? "Unmute" : "Mute"}>{p.muted || p.volume === 0 ? "🔇" : "🔊"}</button>
        <input type="range" aria-label="Volume" min={0} max={1} step={0.05} value={p.muted ? 0 : p.volume} onChange={(e) => p.setVolume(+e.target.value)} className="hidden h-1 w-20 accent-violet-500 sm:block" />
        {p.isLive ? <span className="ml-2 text-xs font-semibold" aria-label="Live stream">🔴 LIVE</span> : null}
        <span className="flex-1" />
        {p.pipSupported && <button className="btn !px-2" onClick={p.togglePip} aria-pressed={p.pipActive} aria-label="Picture in picture">⧉</button>}
        <button className="btn !px-2" onClick={p.toggleFullscreen} aria-label={p.fullscreen ? "Exit fullscreen" : "Fullscreen"}>{p.fullscreen ? "🗗" : "⛶"}</button>
      </div>
    </div>
  );
}

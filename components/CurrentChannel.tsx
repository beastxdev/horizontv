"use client";
import type { Channel } from "@/types";
import type { PlayerApi } from "@/hooks/usePlayer";
import { flagEmoji } from "@/lib/utils";
import ChannelLogo from "./ChannelLogo";
import FavoriteButton from "./FavoriteButton";

interface Props { channel: Channel | null; player: PlayerApi; favorite: boolean; onToggleFavorite: () => void; onPrev: () => void; onNext: () => void }

export default function CurrentChannel({ channel, player, favorite, onToggleFavorite, onPrev, onNext }: Props) {
  if (!channel) return null;
  const shown = player.status === "error" ? "Offline" : player.isLive ? "🔴 LIVE" : "▶ VOD";
  return (
    <section aria-label="Now playing" className="glass flex flex-wrap items-center gap-4 rounded-2xl p-4 animate-fadeIn">
      <ChannelLogo name={channel.name} logo={channel.logo} className="h-14 w-14" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-accent">Now playing</p>
        <h2 className="truncate text-lg font-semibold">{channel.name}</h2>
        <p className="truncate text-sm text-muted">{flagEmoji(channel.countryCode)} {channel.country ?? "Unknown"}{channel.language ? ` · ${channel.language}` : ""} · {channel.category}</p>
        <p className="mt-0.5 text-xs font-semibold">{shown}</p>
      </div>
      <div className="flex flex-wrap items-center gap-1">
        <button className="btn border border-line/10" onClick={onPrev}>← Previous</button>
        <button className="btn border border-line/10" onClick={onNext}>Next →</button>
        <FavoriteButton active={favorite} name={channel.name} onToggle={onToggleFavorite} />
        <button className="btn border border-line/10" onClick={player.retry} aria-label="Reload stream">↻ Reload</button>
      </div>
    </section>
  );
}

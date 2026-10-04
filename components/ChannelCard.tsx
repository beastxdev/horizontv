"use client";
import { memo } from "react";
import type { Channel } from "@/types";
import { flagEmoji } from "@/lib/utils";
import ChannelLogo from "./ChannelLogo";
import FavoriteButton from "./FavoriteButton";

interface Props { channel: Channel; active: boolean; favorite: boolean; onPlay: (c: Channel) => void; onToggleFavorite: (id: string) => void }

function ChannelCard({ channel, active, favorite, onPlay, onToggleFavorite }: Props) {
  return (
    <article
      role="button" tabIndex={0} aria-label={`Watch ${channel.name}`}
      onClick={() => onPlay(channel)}
      onKeyDown={(e) => { if (e.key === "Enter") onPlay(channel); }}
      className={`group glass cursor-pointer rounded-2xl p-3 transition duration-200 hover:-translate-y-1 hover:border-accent/60 hover:shadow-lg hover:shadow-accent/20 ${active ? "ring-2 ring-accent" : ""}`}
    >
      <div className="flex h-24 items-center justify-center rounded-xl bg-line/5 p-2"><ChannelLogo name={channel.name} logo={channel.logo} /></div>
      <h3 className="mt-3 truncate text-sm font-semibold" title={channel.name}>{channel.name}</h3>
      <p className="truncate text-xs text-muted">{flagEmoji(channel.countryCode)} {channel.country ?? "Unknown"}</p>
      <p className="truncate text-xs text-muted">{channel.category}</p>
      <div className="mt-2 flex items-center justify-between">
        <FavoriteButton active={favorite} name={channel.name} onToggle={() => onToggleFavorite(channel.id)} />
        <span className="rounded-lg bg-gradient-to-r from-accent to-accent-blue px-2.5 py-1 text-xs font-medium text-white opacity-90 transition group-hover:opacity-100">▶ Watch</span>
      </div>
    </article>
  );
}
export default memo(ChannelCard);

"use client";
import type { Channel } from "@/types";
import ChannelGrid from "./ChannelGrid";
import EmptyState from "./EmptyState";
export default function RecentChannels(p: { channels: Channel[]; activeId?: string; favoriteSet: Set<string>; onPlay: (c: Channel) => void; onToggleFavorite: (id: string) => void }) {
  if (!p.channels.length) return <EmptyState icon="🕘" title="Nothing watched yet" text="Start watching a channel." />;
  return <ChannelGrid {...p} resetKey="recent" />;
}

"use client";
import { useEffect, useRef, useState } from "react";
import type { Channel } from "@/types";
import { PAGE_SIZE } from "@/lib/constants";
import ChannelCard from "./ChannelCard";

interface Props { channels: Channel[]; activeId?: string; favoriteSet: Set<string>; onPlay: (c: Channel) => void; onToggleFavorite: (id: string) => void; resetKey: string }

/** Windowed rendering: shows PAGE_SIZE cards and grows as the sentinel scrolls into view. */
export default function ChannelGrid({ channels, activeId, favoriteSet, onPlay, onToggleFavorite, resetKey }: Props) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => setVisible(PAGE_SIZE), [resetKey]);
  useEffect(() => {
    const el = sentinel.current; if (!el) return;
    const io = new IntersectionObserver((e) => { if (e[0].isIntersecting) setVisible((v) => v + PAGE_SIZE); }, { rootMargin: "600px" });
    io.observe(el);
    return () => io.disconnect();
  }, [channels.length, visible]);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-5 xl:grid-cols-4">
        {channels.slice(0, visible).map((c) => (
          <ChannelCard key={c.id} channel={c} active={c.id === activeId} favorite={favoriteSet.has(c.id)} onPlay={onPlay} onToggleFavorite={onToggleFavorite} />
        ))}
      </div>
      {visible < channels.length && <div ref={sentinel} className="py-6 text-center text-xs text-muted">Showing {visible} of {channels.length.toLocaleString()} — scroll for more</div>}
    </>
  );
}

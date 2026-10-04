"use client";
import type { Channel } from "@/types";
import type { PlayerApi } from "@/hooks/usePlayer";
import PlayerControls from "./PlayerControls";

interface Props { channel: Channel | null; player: PlayerApi; onPrev: () => void; onNext: () => void; onBack: () => void }

export default function VideoPlayer({ channel, player: p, onPrev, onNext, onBack }: Props) {
  return (
    <div className="group/player relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl shadow-accent/10 ring-1 ring-white/10">
      <video ref={p.videoRef} className="h-full w-full" playsInline controls={false} onClick={p.togglePlay} aria-label={channel ? `Video player: ${channel.name}` : "Video player"} />
      {!channel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white/70">
          <div className="text-5xl" aria-hidden>📺</div>
          <p className="mt-2 font-medium">Select a channel to start watching</p>
        </div>
      )}
      {channel && p.status === "loading" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40" role="status" aria-label="Loading stream">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-violet-500" />
        </div>
      )}
      {channel && p.status === "error" && (
        <div role="alert" className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/85 p-4 text-center text-white">
          <div className="text-3xl" aria-hidden>⚠️</div>
          <p className="font-semibold">Unable to play this stream</p>
          <p className="max-w-md text-xs text-white/70">{p.error ?? "The channel may be offline or unavailable in your region."}</p>
          <div className="mt-2 flex gap-2">
            <button className="btn btn-primary" onClick={p.retry}>Retry</button>
            <button className="btn border border-white/20" onClick={onBack}>Back to Channels</button>
          </div>
        </div>
      )}
      {channel && p.status !== "error" && <PlayerControls p={p} onPrev={onPrev} onNext={onNext} />}
    </div>
  );
}

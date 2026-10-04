"use client";
import { useEffect, useState } from "react";
import { timeAgo } from "@/lib/utils";
export default function PlaylistStatus({ count, fetchedAt, refreshing, onRefresh }: { count: number; fetchedAt?: number; refreshing: boolean; onRefresh: () => void }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(t); }, []);
  return (
    <div className="flex items-center justify-between gap-2 text-xs text-muted">
      <span>{count.toLocaleString()} channels · Last updated: {timeAgo(fetchedAt, now)}</span>
      <button className="btn !px-2 !py-1 text-xs" onClick={onRefresh} disabled={refreshing} aria-label="Refresh playlist">
        <span className={refreshing ? "animate-spin" : ""}>↻</span> Refresh
      </button>
    </div>
  );
}

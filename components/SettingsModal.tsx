"use client";
import { useEffect, useState } from "react";
import type { Settings } from "@/types";
import { DEFAULT_PLAYLIST_URL } from "@/lib/constants";
import { isValidHttpUrl } from "@/lib/utils";

interface Props {
  open: boolean; onClose: () => void; settings: Settings; onChange: (p: Partial<Settings>) => void;
  onClearFavorites: () => void; onClearRecent: () => void; onRefresh: () => void;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between py-2 text-sm">
      {label}
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-5 w-9 cursor-pointer accent-violet-500" />
    </label>
  );
}

export default function SettingsModal({ open, onClose, settings, onChange, onClearFavorites, onClearRecent, onRefresh }: Props) {
  const [url, setUrl] = useState(settings.playlistUrl);
  const [err, setErr] = useState("");
  useEffect(() => { if (open) { setUrl(settings.playlistUrl); setErr(""); } }, [open, settings.playlistUrl]);
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;

  const load = () => {
    const u = url.trim() || DEFAULT_PLAYLIST_URL;
    if (!isValidHttpUrl(u)) return setErr("Enter a valid http(s) URL.");
    setErr(""); onChange({ playlistUrl: u }); onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Settings" onClick={(e) => e.stopPropagation()} className="glass max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl p-5 animate-fadeIn sm:rounded-3xl">
        <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-semibold">Settings</h2><button className="btn !px-2" onClick={onClose} aria-label="Close settings">✕</button></div>
        <label className="flex items-center justify-between py-2 text-sm">Theme
          <select className="field !w-32" value={settings.theme} onChange={(e) => onChange({ theme: e.target.value as Settings["theme"] })}><option value="dark">Dark</option><option value="light">Light</option></select>
        </label>
        <Toggle label="Autoplay" checked={settings.autoplay} onChange={(autoplay) => onChange({ autoplay })} />
        <Toggle label="Autoplay next channel (when a stream ends)" checked={settings.autoplayNext} onChange={(autoplayNext) => onChange({ autoplayNext })} />
        <Toggle label="Remember last channel" checked={settings.rememberLast} onChange={(rememberLast) => onChange({ rememberLast })} />
        <div className="mt-3 border-t border-line/10 pt-3">
          <label className="block text-xs text-muted">Playlist URL
            <input className="field mt-1 text-fg" value={url} onChange={(e) => setUrl(e.target.value)} placeholder={DEFAULT_PLAYLIST_URL} inputMode="url" />
          </label>
          {err && <p role="alert" className="mt-1 text-xs text-red-400">{err}</p>}
          <p className="mt-1 text-[11px] text-muted">Some hosts block browser requests (CORS). The app retries through its own server route, but a host that blocks it will show an error.</p>
          <div className="mt-2 flex gap-2">
            <button className="btn btn-primary flex-1" onClick={load}>Load Playlist</button>
            <button className="btn border border-line/10" onClick={() => { setUrl(DEFAULT_PLAYLIST_URL); onChange({ playlistUrl: DEFAULT_PLAYLIST_URL }); }}>Default</button>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-2 border-t border-line/10 pt-3">
          <button className="btn border border-line/10" onClick={() => { onRefresh(); onClose(); }}>↻ Refresh Playlist</button>
          <button className="btn border border-line/10" onClick={onClearFavorites}>Clear favorites</button>
          <button className="btn border border-line/10" onClick={onClearRecent}>Clear recently watched</button>
        </div>
      </div>
    </div>
  );
}

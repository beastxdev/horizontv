"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type Hls from "hls.js";
import type { Channel, PlayerStatus } from "@/types";

const LOAD_TIMEOUT_MS = 20000;
const MAX_NET_RETRIES = 3;

function explain(channel: Channel, detail: string): string {
  if (typeof location !== "undefined" && location.protocol === "https:" && channel.url.startsWith("http:"))
    return "This stream uses insecure HTTP and is blocked by the browser on an HTTPS page (mixed content).";
  if (/twitch\.tv|youtube\.com|youtu\.be|dailymotion|facebook\.com/i.test(channel.url))
    return "This channel is a web page (Twitch/YouTube/etc.), not a direct video stream, so it can't be played here.";
  if (/cors|manifestLoadError|fetch|network|Failed/i.test(detail))
    return "The stream could not be loaded. It may be offline, geo-blocked, or the host does not allow browser (CORS) playback — this is a limit of the stream, not the app.";
  return "The channel may be offline or unavailable in your region.";
}

export function usePlayer(channel: Channel | null, opts: { autoplay: boolean; onEnded?: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const optsRef = useRef(opts); optsRef.current = opts;
  const [status, setStatus] = useState<PlayerStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [time, setTime] = useState({ current: 0, duration: 0 });
  const [volume, setVolumeState] = useState(1);
  const [muted, setMuted] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [pipActive, setPipActive] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !channel) { setStatus("idle"); return; }
    let disposed = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let netRetries = 0;
    setStatus("loading"); setError(null); setIsLive(true); setTime({ current: 0, duration: 0 });

    const fail = (detail: string, raw?: unknown) => {
      if (disposed) return;
      console.error(`[player] ${channel.name} failed:`, detail, raw ?? "", channel.url);
      clearTimeout(timer);
      hlsRef.current?.destroy(); hlsRef.current = null;
      setError(explain(channel, detail)); setStatus("error");
    };
    const armTimeout = () => { clearTimeout(timer); timer = setTimeout(() => fail("timeout: stream did not start in time"), LOAD_TIMEOUT_MS); };
    const onPlaying = () => { clearTimeout(timer); setStatus("playing"); setError(null); };
    const tryPlay = () => { if (optsRef.current.autoplay) v.play().catch((e) => { if (e?.name === "NotAllowedError") setStatus("paused"); }); else setStatus("paused"); };

    v.addEventListener("playing", onPlaying);
    const onNativeError = () => fail(`media error code ${v.error?.code} ${v.error?.message ?? ""}`, v.error);
    v.addEventListener("error", onNativeError);

    const isHls = /\.m3u8(\?|#|$)/i.test(channel.url) || /m3u8/i.test(channel.url);
    const isFile = /\.(mp4|webm|ogv)(\?|#|$)/i.test(channel.url);

    if (/twitch\.tv|youtube\.com|youtu\.be/i.test(channel.url) && !isHls) {
      fail("unsupported web-page URL");
    } else if (isHls) {
      armTimeout();
      import("hls.js").then(({ default: HlsLib }) => {
        if (disposed) return;
        if (HlsLib.isSupported()) {
          const hls = new HlsLib({ enableWorker: true, lowLatencyMode: true, manifestLoadingTimeOut: 15000, manifestLoadingMaxRetry: 1 });
          hlsRef.current = hls;
          hls.on(HlsLib.Events.MANIFEST_PARSED, () => tryPlay());
          hls.on(HlsLib.Events.LEVEL_LOADED, (_e, d) => setIsLive(d.details.live));
          hls.on(HlsLib.Events.ERROR, (_e, d) => {
            if (!d.fatal) return;
            console.warn("[player] fatal HLS error", d.type, d.details, d);
            if (d.type === HlsLib.ErrorTypes.NETWORK_ERROR && netRetries < MAX_NET_RETRIES) {
              netRetries++; setTimeout(() => hls.startLoad(), 800 * netRetries); return;
            }
            if (d.type === HlsLib.ErrorTypes.MEDIA_ERROR && netRetries < MAX_NET_RETRIES) {
              netRetries++; hls.recoverMediaError(); return;
            }
            fail(`${d.type}/${d.details}${d.response ? ` HTTP ${d.response.code}` : ""}`, d);
          });
          hls.loadSource(channel.url);
          hls.attachMedia(v);
        } else if (v.canPlayType("application/vnd.apple.mpegurl")) {
          v.src = channel.url; v.load(); tryPlay();
        } else fail("HLS is not supported by this browser");
      }).catch((e) => fail("failed to load HLS library", e));
    } else if (isFile || v.canPlayType("video/mp4")) {
      armTimeout(); v.src = channel.url; v.load(); tryPlay();
    } else fail("unsupported format");

    return () => {
      disposed = true; clearTimeout(timer);
      v.removeEventListener("playing", onPlaying); v.removeEventListener("error", onNativeError);
      hlsRef.current?.destroy(); hlsRef.current = null;
      v.removeAttribute("src"); v.load();
    };
  }, [channel, reloadKey]);

  // Element state sync
  useEffect(() => {
    const v = videoRef.current; if (!v) return;
    const h: Record<string, () => void> = {
      timeupdate: () => { setTime({ current: v.currentTime, duration: v.duration }); if (!isFinite(v.duration)) setIsLive(true); else if (v.duration > 0 && !hlsRef.current) setIsLive(false); },
      pause: () => setStatus((s) => (s === "playing" ? "paused" : s)),
      waiting: () => setStatus((s) => (s === "playing" ? "loading" : s)),
      volumechange: () => { setVolumeState(v.volume); setMuted(v.muted); },
      ended: () => optsRef.current.onEnded?.(),
      enterpictureinpicture: () => setPipActive(true), leavepictureinpicture: () => setPipActive(false),
    };
    Object.entries(h).forEach(([k, f]) => v.addEventListener(k, f));
    const fs = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", fs);
    return () => { Object.entries(h).forEach(([k, f]) => v.removeEventListener(k, f)); document.removeEventListener("fullscreenchange", fs); };
  }, []);

  const togglePlay = useCallback(() => { const v = videoRef.current; if (!v) return; v.paused ? v.play().catch(() => {}) : v.pause(); }, []);
  const toggleMute = useCallback(() => { const v = videoRef.current; if (v) v.muted = !v.muted; }, []);
  const setVolume = useCallback((x: number) => { const v = videoRef.current; if (v) { v.volume = x; v.muted = x === 0; } }, []);
  const seek = useCallback((t: number) => { const v = videoRef.current; if (v) v.currentTime = t; }, []);
  const retry = useCallback(() => setReloadKey((k) => k + 1), []);
  const toggleFullscreen = useCallback(() => {
    const el = videoRef.current?.parentElement; if (!el) return;
    document.fullscreenElement ? document.exitFullscreen() : el.requestFullscreen?.().catch(() => {});
  }, []);
  const pipSupported = typeof document !== "undefined" && "pictureInPictureEnabled" in document && document.pictureInPictureEnabled;
  const togglePip = useCallback(() => {
    const v = videoRef.current; if (!v) return;
    document.pictureInPictureElement ? document.exitPictureInPicture() : v.requestPictureInPicture?.().catch(() => {});
  }, []);

  return { videoRef, status, error, isLive, time, volume, muted, pipActive, pipSupported, fullscreen,
    togglePlay, toggleMute, setVolume, seek, retry, toggleFullscreen, togglePip };
}
export type PlayerApi = ReturnType<typeof usePlayer>;

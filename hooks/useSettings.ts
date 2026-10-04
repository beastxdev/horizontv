"use client";
import { useEffect } from "react";
import type { Settings } from "@/types";
import { DEFAULT_PLAYLIST_URL } from "@/lib/constants";
import { useLocalStorage } from "./useLocalStorage";

export const DEFAULT_SETTINGS: Settings = {
  theme: "dark", autoplay: true, autoplayNext: false, rememberLast: true, playlistUrl: DEFAULT_PLAYLIST_URL,
};

export function useSettings() {
  const [settings, setSettings, hydrated] = useLocalStorage<Settings>("iptv:settings", DEFAULT_SETTINGS);
  useEffect(() => { document.documentElement.dataset.theme = settings.theme; }, [settings.theme]);
  const patch = (p: Partial<Settings>) => setSettings((s) => ({ ...s, ...p }));
  return { settings, patch, hydrated };
}

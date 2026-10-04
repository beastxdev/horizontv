export interface Channel {
  id: string;
  name: string;
  url: string;
  logo?: string;
  country?: string;
  countryCode?: string;
  language?: string;
  category?: string;
  tvgId?: string;
}

export interface Settings {
  theme: "dark" | "light";
  autoplay: boolean;
  autoplayNext: boolean;
  rememberLast: boolean;
  lastChannelId?: string;
  playlistUrl: string;
}

export interface Filters {
  country: string;
  category: string;
  language: string;
}

export type LoadStatus = "idle" | "loading" | "ready" | "error";
export type PlayerStatus = "idle" | "loading" | "playing" | "paused" | "error";
export type View = "all" | "favorites" | "recent";

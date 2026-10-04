# 📺 Horizon IPTV

### A modern, searchable web player for live Free-TV channels.

Horizon IPTV is a lightweight IPTV web application built with **Next.js, React, TypeScript, Tailwind CSS, and hls.js**.

It loads a live Free-TV M3U playlist, parses the available channels, and turns them into a searchable and filterable channel library with an integrated HLS video player.

> 🎬 Browse channels. 🔎 Find what you want. ⭐ Save favorites. ▶️ Start watching.

---

## ✨ Features

- 📡 **Live IPTV playlist loading**
- 📋 **M3U/M3U8 playlist parsing**
- 🔎 **Instant channel search**
- 🗂️ **Category filtering**
- 🌍 **Country filtering**
- 🗣️ **Language filtering** when provided by the playlist
- ⭐ **Favorite channels**
- 🕘 **Recently watched channels**
- ▶️ **HLS video playback**
- 📺 Dedicated channel watch page
- 🔄 **Player retry controls**
- ⚡ Client-side playlist state management
- 🌐 Direct playlist fetching with API fallback
- ⌨️ Keyboard shortcuts
- 📱 Responsive interface
- 🛡️ Public HTTP(S) playlist fetching only
- 🚫 No stream proxying
- 🚫 No authentication bypass
- 🚫 No DRM bypass
- 🚫 No geo-block bypass

---

## 🧰 Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 15** | Full-stack React framework |
| **React 19** | UI |
| **TypeScript** | Type safety |
| **Tailwind CSS 3** | Styling |
| **hls.js** | Browser HLS playback |
| **M3U/M3U8** | Playlist format |

The project uses the Next.js App Router. :chatgpt-content-reference{index="0"}

HLS.js provides browser-side HLS playback through Media Source Extensions where supported, while browsers with native HLS support can use the video element directly. :chatgpt-content-reference{index="1"}

---

# 🚀 Getting Started

## 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/horizon-iptv.git
cd horizon-iptv

2. Install dependencies
npm install

3. Start the development server
npm run dev

Open:
http://localhost:3000

4. Production build
npm run build
npm start

5. Type checking
npm run typecheck

📁 Project Structure
horizon-iptv/
│
├── app/
│   ├── page.tsx
│   ├── watch/
│   │   └── page.tsx
│   │
│   └── api/
│       └── playlist/
│           └── route.ts
│
├── components/
│   ├── ...
│   └── ...
│
├── hooks/
│   ├── usePlaylist.ts
│   ├── useChannels.ts
│   ├── useFavorites.ts
│   ├── useRecentChannels.ts
│   ├── usePlayer.ts
│   └── useSettings.ts
│
├── lib/
│   ├── m3u.ts
│   └── playlist.ts
│
├── types/
│   └── ...
│
├── public/
│   └── ...
│
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md

🖥️ Application Routes
/
Main channel browser.
Includes:
- Channel search
- Filters
- Category navigation
- Country filtering
- Language filtering
- Favorites
- Recently watched channels
- Channel cards
/watch?id=...
Dedicated player page for a selected channel.
The page handles:
- Channel information
- HLS playback
- Player errors
- Retry functionality
- Playback controls
/api/playlist
Server-side playlist fallback endpoint.
Used when the browser cannot directly fetch the configured playlist because of network or CORS restrictions.
📡 Playlist System
Horizon IPTV loads a live Free-TV playlist and parses its M3U metadata.
Channel information can include:
#EXTINF
tvg-name
tvg-logo
tvg-country
tvg-language
group-title
stream URL

The parser converts the playlist into structured channel data used throughout the application.
🗂️ Categories
The source playlist does not always provide reliable category information.
When category metadata is unavailable, Horizon IPTV infers categories from channel names using keyword rules defined in:
lib/m3u.ts

For example, channel names may be used to infer categories such as:
News
Sports
Movies
Music
Kids
Entertainment
Documentary
General

The exact category rules are maintained inside the parser.
🌍 Countries & Languages
Country information can be obtained from:
group-title
tvg-country

Language filtering is available only when the playlist provides tvg-language metadata.
If the playlist does not contain language information, the language filter is automatically unavailable.
▶️ HLS Player
Horizon IPTV uses hls.js for browser-based HLS playback.
When supported, the application loads the .m3u8 stream into the player.
Browsers with native HLS support can use the browser's native video implementation instead. GitHub
Playback flow
Channel
   │
   ▼
Stream URL
   │
   ▼
HLS Detection
   │
   ├── Native HLS
   │
   └── hls.js
          │
          ▼
       Video Player

🔄 Playlist Fetching
The application first attempts to fetch the playlist directly.
If the browser cannot access it because of CORS or network restrictions, it retries through:
/api/playlist

The API fallback is intentionally limited to:
- Public http:// and https:// hosts
- Playlist text retrieval
- No stream proxying
- No authentication bypass
- No DRM bypass
- No geo-block bypass
The backend implementation can be changed in:
lib/playlist.ts

Specifically:
fetchPlaylistText

⭐ User Features
Favorites
Users can save channels to their favorites for quick access.
Favorites are managed through:
hooks/useFavorites

Recently Watched
Recently played channels are tracked through:
hooks/useRecentChannels

Search
The channel library supports searching by available channel information.
Search → Filter → Select → Watch

⌨️ Keyboard Shortcuts
Key	Action
Space	Play / Pause
F	Fullscreen
M	Mute / Unmute
↑	Previous channel
↓	Next channel
/	Focus search


Previous/next navigation operates on the currently filtered channel list.
⚠️ Stream Limitations
Horizon IPTV does not guarantee that every channel in the playlist will work.
Some streams may be:
- 🔴 Offline
- 🌍 Geo-restricted
- 🔒 HTTPS-incompatible
- 🚫 Missing CORS headers
- 📺 Temporarily unavailable
- 🐌 Unstable or slow
- ❌ Not actually compatible with browser playback
The player provides a specific error state and retry option when playback fails.
YouTube & Twitch
Some playlist entries may contain URLs pointing to:
- YouTube pages
- Twitch pages
- Other webpage URLs
These are not necessarily direct video streams.
A webpage URL cannot automatically be treated as an HLS stream, so those entries may not play in the Horizon IPTV player.
🛡️ Scope & Responsible Use
Horizon IPTV is a playlist browser and playback interface.
It does not:
- Bypass DRM
- Circumvent authentication
- Bypass geographic restrictions
- Crack protected streams
- Proxy protected video content
- Provide unauthorized access to private streams
The application only attempts to load publicly accessible playlist and stream URLs.
Users are responsible for ensuring that the playlists and streams they use are legally accessible to them.
🧪 Development
Run the development server:
npm run dev

Run type checking:
npm run typecheck

Create a production build:
npm run build

Start the production server:
npm start

🏗️ Architecture
                 ┌──────────────────────┐
                 │     Free-TV M3U      │
                 │       Playlist       │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │   Playlist Fetcher   │
                 │   lib/playlist.ts    │
                 └──────────┬───────────┘
                            │
                  ┌─────────┴─────────┐
                  │                   │
               Direct              API Fallback
               Fetch                /api/playlist
                  │                   │
                  └─────────┬─────────┘
                            ▼
                 ┌──────────────────────┐
                 │      M3U Parser      │
                 │      lib/m3u.ts      │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │   Channel Library    │
                 │ Search + Filters     │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │      HLS Player      │
                 │      hls.js          │
                 └──────────────────────┘

🔧 Configuration
The main playlist fetching logic is located at:
lib/playlist.ts

Category inference rules are located at:
lib/m3u.ts

Player behavior is managed through:
hooks/usePlayer.ts

Channel state:
hooks/useChannels.ts

Playlist state:
hooks/usePlaylist.ts

📦 Production Deployment
Horizon IPTV can be deployed as a standard Next.js application.
Typical production flow:
npm install
npm run build
npm start

For a hosted deployment, configure the project using your chosen Node.js-compatible platform.
Next.js 15 is currently in the Maintenance LTS phase, while Next.js 16 is the current Active LTS major, so production deployments should keep dependencies patched within the chosen release line. Next.js
🔐 Security Notes
Do not commit secrets or private credentials to the repository.
Avoid placing sensitive values inside:
.env
.env.local
.env.production

unless they are properly excluded from Git.
Recommended:
.env*
!.env.example

in .gitignore.
🗺️ Roadmap
Possible future improvements:
- [ ] Better channel metadata normalization
- [ ] More advanced category detection
- [ ] Channel sorting
- [ ] Favorite-only mode
- [ ] Improved player diagnostics
- [ ] Stream health indicators
- [ ] EPG support
- [ ] Multi-playlist support
- [ ] Custom playlist import
- [ ] PWA support
- [ ] Better mobile player controls
- [ ] TV / large-screen interface
- [ ] Accessibility improvements
🤝 Contributing
Contributions, fixes, and improvements are welcome.
Basic workflow
git clone <repository>
cd horizon-iptv

npm install

git checkout -b feature/my-feature

npm run typecheck
npm run build

git add .
git commit -m "feat: add my feature"
git push origin feature/my-feature

Then open a pull request.

📺 Horizon IPTV
A simple way to discover and watch publicly accessible live TV streams.
🔎 Discover · ⭐ Save · ▶️ Watch

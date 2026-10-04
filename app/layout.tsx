import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Horizon IPTV — Live TV Browser", description: "Browse, search and watch free public IPTV channels." };
export const viewport: Viewport = { themeColor: "#09090f", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}

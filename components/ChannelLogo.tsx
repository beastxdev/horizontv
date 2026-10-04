"use client";
import { memo, useState } from "react";
import { initials } from "@/lib/utils";

function ChannelLogo({ name, logo, className = "h-16 w-16" }: { name: string; logo?: string; className?: string }) {
  const [broken, setBroken] = useState(false);
  if (!logo || broken) {
    return (
      <div className={`${className} flex items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-blue text-lg font-bold text-white`} role="img" aria-label={`${name} logo placeholder`}>
        {initials(name)}
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={logo} alt={`${name} logo`} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setBroken(true)} className={`${className} object-contain`} />;
}
export default memo(ChannelLogo);

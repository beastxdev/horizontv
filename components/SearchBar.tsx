"use client";
import { forwardRef } from "react";
const SearchBar = forwardRef<HTMLInputElement, { value: string; onChange: (v: string) => void }>(function SearchBar({ value, onChange }, ref) {
  return (
    <div className="relative w-full">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden>🔍</span>
      <input ref={ref} type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Search channels..." aria-label="Search channels" className="field !pl-9" />
    </div>
  );
});
export default SearchBar;

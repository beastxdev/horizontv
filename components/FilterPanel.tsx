"use client";
import type { Filters } from "@/types";
import type { Facet } from "@/hooks/useChannels";

function Select({ label, all, value, options, onChange }: { label: string; all: string; value: string; options: Facet[]; onChange: (v: string) => void }) {
  return (
    <label className="block text-xs text-muted">
      {label}
      <select className="field mt-1 text-fg" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{all}</option>
        {options.map((o) => <option key={o.name} value={o.name}>{o.name} ({o.count})</option>)}
      </select>
    </label>
  );
}

interface Props { filters: Filters; onChange: (f: Filters) => void; countries: Facet[]; categories: Facet[]; languages: Facet[] }

export default function FilterPanel({ filters, onChange, countries, categories, languages }: Props) {
  const active = filters.country || filters.category || filters.language;
  return (
    <section aria-label="Filters" className="space-y-3">
      <Select label="Country" all="All Countries" value={filters.country} options={countries} onChange={(country) => onChange({ ...filters, country })} />
      <Select label="Category" all="All Categories" value={filters.category} options={categories} onChange={(category) => onChange({ ...filters, category })} />
      {languages.length > 0 && <Select label="Language" all="All Languages" value={filters.language} options={languages} onChange={(language) => onChange({ ...filters, language })} />}
      {active ? <button className="btn w-full border border-line/10" onClick={() => onChange({ country: "", category: "", language: "" })}>Clear filters</button> : null}
    </section>
  );
}

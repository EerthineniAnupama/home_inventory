import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = 'Search items…' }) {
  return (
    <div className="relative flex-1 max-w-sm">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-surface pl-9 pr-3 py-2 text-sm text-zinc-900 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
      />
    </div>
  );
}
export default function Loader({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-zinc-400">
      <div className="h-6 w-6 rounded-full border-2 border-zinc-200 border-t-accent animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
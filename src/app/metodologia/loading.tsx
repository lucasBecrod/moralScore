export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
      <div className="h-9 w-72 animate-pulse rounded-lg bg-zinc-800" />
      <div className="mt-3 h-4 w-96 animate-pulse rounded bg-zinc-800/50" />

      {/* Pilares skeleton */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg border border-zinc-800 bg-zinc-900" />
        ))}
      </div>

      {/* Steps skeleton */}
      <div className="mt-10 grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg border border-zinc-800 bg-zinc-900" />
        ))}
      </div>

      {/* Tabs skeleton */}
      <div className="mt-12 h-12 animate-pulse rounded-lg border border-zinc-800 bg-zinc-900" />
      <div className="mt-6 space-y-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg border border-zinc-800 bg-zinc-900" />
        ))}
      </div>
    </div>
  );
}

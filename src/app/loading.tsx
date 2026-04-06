export default function Loading() {
  return (
    <div>
      {/* Hero skeleton */}
      <section className="border-b border-zinc-800 bg-zinc-950 px-4 py-20 text-center">
        <div className="mx-auto h-12 w-80 animate-pulse rounded-lg bg-zinc-800" />
        <div className="mx-auto mt-5 h-6 w-96 animate-pulse rounded bg-zinc-800" />
        <div className="mx-auto mt-2 h-4 w-60 animate-pulse rounded bg-zinc-800/50" />
        <div className="mx-auto mt-8 flex items-center justify-center gap-3">
          <div className="flex -space-x-2">
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} className="h-14 w-10 animate-pulse rounded-lg border-2 border-zinc-950 bg-zinc-800" />
            ))}
          </div>
        </div>
      </section>

      {/* Cards skeleton */}
      <section className="mx-auto max-w-3xl px-4 py-12">
        <div className="mx-auto mb-6 h-6 w-64 animate-pulse rounded bg-zinc-800" />
        <div className="grid gap-5 sm:grid-cols-2">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="flex gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-3">
              <div className="h-[5.5rem] w-16 animate-pulse rounded-lg bg-zinc-800" />
              <div className="flex flex-1 flex-col justify-center gap-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-800" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-800/50" />
                <div className="flex gap-0.5">
                  {Array.from({ length: 6 }, (_, j) => (
                    <div key={j} className="h-2 flex-1 animate-pulse rounded-sm bg-zinc-800" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

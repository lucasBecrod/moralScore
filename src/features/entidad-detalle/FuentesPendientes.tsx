import type { Fuente } from "@/schemas/fuente.schema";

function displayDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export default function FuentesPendientes({ fuentes }: { fuentes: Fuente[] }) {
  if (fuentes.length === 0) return null;
  return (
    <div className="mb-8 space-y-3">
      {fuentes.map((f) => {
        const titulo = f.titulo !== f.url ? f.titulo : null;
        const domain = f.medio || displayDomain(f.url);

        return (
          <a
            key={f.id}
            href={f.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg border border-dashed border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs text-zinc-500">
                ?
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-zinc-300 truncate">
                  {titulo || domain}
                </p>
                <p className="text-xs text-zinc-500">
                  {domain}
                  {f.fechaEvento && <> &middot; {f.fechaEvento}</>}
                  <> &middot; {f.tipo}</>
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2.5 py-0.5 text-[11px] font-medium text-yellow-400">
                Pendiente
              </span>
            </div>
          </a>
        );
      })}
    </div>
  );
}

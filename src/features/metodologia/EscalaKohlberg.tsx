import { KOHLBERG_STAGES, type KohlbergStage } from "@/shared/config/kohlberg-stages";
import { KohlbergBadge } from "@/shared/ui/KohlbergBadge";

const LEVELS: Record<string, string> = {
  "Pre-convencional": "Estadios 1–2",
  "Convencional": "Estadios 3–4",
  "Post-convencional": "Estadios 5–6",
};

export function EscalaKohlberg() {
  const stages = Object.entries(KOHLBERG_STAGES) as [string, (typeof KOHLBERG_STAGES)[KohlbergStage]][];

  return (
    <div className="space-y-4">
      {stages.map(([key, stage]) => {
        const num = Number(key);
        return (
          <div
            key={num}
            className="flex gap-4 rounded-lg border border-zinc-700 bg-zinc-900 p-4"
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
              style={{ backgroundColor: stage.color }}
            >
              {num}
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <KohlbergBadge stage={num} />
                <span className="text-xs text-zinc-400">
                  {stage.nivel} ({LEVELS[stage.nivel]})
                </span>
              </div>
              <p className="text-sm text-zinc-300">
                {stage.descripcion}
              </p>
              <blockquote className="border-l-2 pl-3 text-sm italic text-zinc-400" style={{ borderColor: stage.color }}>
                {stage.ejemplo}
              </blockquote>
            </div>
          </div>
        );
      })}
    </div>
  );
}

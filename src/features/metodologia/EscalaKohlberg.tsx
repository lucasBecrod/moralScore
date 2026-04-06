import { KOHLBERG_STAGES, type KohlbergStage } from "@/shared/config/kohlberg-stages";

const STAGE_ICONS: Record<number, string> = {
  1: "\u{1F512}",  // candado
  2: "\u{1F91D}",  // apretón de manos
  3: "\u{1F465}",  // grupo
  4: "\u{2696}\uFE0F",   // balanza
  5: "\u{1F4DC}",  // pergamino
  6: "\u{1F9ED}",  // brújula
};

const GROUPS = [
  {
    label: "Post-convencional",
    desc: "Principios propios por encima de la ley",
    stages: [6, 5],
    border: "border-violet-500/30",
    bg: "bg-violet-500/5",
    labelColor: "text-violet-400",
    bar: "bg-violet-500",
    text: "text-violet-300",
  },
  {
    label: "Convencional",
    desc: "Normas sociales y sistema legal",
    stages: [4, 3],
    border: "border-blue-500/30",
    bg: "bg-blue-500/5",
    labelColor: "text-blue-400",
    bar: "bg-blue-500",
    text: "text-blue-300",
  },
  {
    label: "Pre-convencional",
    desc: "Inter\u00e9s propio y castigo/recompensa",
    stages: [2, 1],
    border: "border-red-500/30",
    bg: "bg-red-500/5",
    labelColor: "text-red-400",
    bar: "bg-red-500",
    text: "text-red-300",
  },
];

export function EscalaKohlberg() {
  return (
    <div className="space-y-6">
      {GROUPS.map((group) => (
        <div key={group.label}>
          {/* Group header */}
          <div className="mb-2 flex items-baseline gap-2">
            <h4 className={`text-sm font-semibold ${group.labelColor}`}>
              {group.label}
            </h4>
            <span className="text-[11px] text-zinc-600">{group.desc}</span>
          </div>

          {/* Stages in this group */}
          <div className="space-y-2">
            {group.stages.map((num) => {
              const stage = KOHLBERG_STAGES[num as KohlbergStage];
              return (
                <div
                  key={num}
                  className={`rounded-xl border p-4 backdrop-blur-sm ${group.bg} ${group.border}`}
                >
                  <div className="flex items-center gap-4">
                    <span className="shrink-0 text-4xl">{STAGE_ICONS[num]}</span>

                    <div className="min-w-0 flex-1">
                      <h5 className="text-sm font-semibold text-zinc-100">
                        {stage.nombre}
                      </h5>
                      <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                        {stage.descripcion}
                      </p>

                      {/* Barra segmentada inline */}
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`text-xs font-bold tabular-nums ${group.text}`}>
                          {num}.0
                        </span>
                        <div className="flex max-w-32 flex-1 gap-0.5">
                          {Array.from({ length: 6 }, (_, i) => (
                            <div
                              key={i}
                              className={`h-1.5 flex-1 rounded-sm ${i < num ? group.bar : "bg-zinc-800"}`}
                            />
                          ))}
                        </div>
                      </div>

                      <p
                        className="mt-2 border-l-2 pl-3 text-xs italic text-zinc-500"
                        style={{ borderColor: stage.color }}
                      >
                        {stage.ejemplo}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

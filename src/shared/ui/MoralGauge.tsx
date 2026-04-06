"use client";

/**
 * MoralGauge — Barra vertical de 3 zonas que muestra el nivel de razonamiento moral.
 *
 * Zonas:
 *   1-2  Pre-convencional (rojo/naranja) — Interés propio
 *   3-4  Convencional (ámbar/azul) — Normas y sistema
 *   5-6  Post-convencional (violeta/verde) — Principios propios
 */

interface MoralGaugeProps {
  score: number | null;
  size?: "sm" | "md" | "lg";
}

const ZONES = [
  { min: 5, max: 6, label: "Post-convencional", color: "#7C3AED", bg: "bg-violet-500/20" },
  { min: 3, max: 4, label: "Convencional", color: "#2563EB", bg: "bg-blue-500/20" },
  { min: 1, max: 2, label: "Pre-convencional", color: "#DC2626", bg: "bg-red-500/20" },
];

function getZone(score: number) {
  if (score >= 4.5) return ZONES[0]; // post-convencional
  if (score >= 2.5) return ZONES[1]; // convencional
  return ZONES[2]; // pre-convencional
}

// Posición del marcador: 0% (score=1) a 100% (score=6)
function getPosition(score: number): number {
  return ((score - 1) / 5) * 100;
}

const SIZES = {
  sm: { height: "h-16", width: "w-6", text: "text-xs", score: "text-sm" },
  md: { height: "h-24", width: "w-8", text: "text-xs", score: "text-base" },
  lg: { height: "h-32", width: "w-10", text: "text-sm", score: "text-lg" },
};

export function MoralGauge({ score, size = "md" }: MoralGaugeProps) {
  const s = SIZES[size];

  if (score === null) {
    return (
      <div className={`flex items-center gap-2`}>
        <div className={`${s.height} ${s.width} rounded-full bg-zinc-800 flex items-center justify-center`}>
          <span className="text-zinc-600 text-xs">?</span>
        </div>
        <span className="text-xs text-zinc-600">Sin evaluar</span>
      </div>
    );
  }

  const zone = getZone(score);
  const pos = getPosition(score);

  return (
    <div className="flex items-center gap-3">
      {/* Barra vertical */}
      <div className={`relative ${s.height} ${s.width} rounded-full overflow-hidden bg-zinc-800 flex-shrink-0`}>
        {/* 3 zonas de fondo */}
        <div className="absolute inset-0 flex flex-col">
          <div className="flex-1 bg-violet-500/15 border-b border-zinc-700/50" />
          <div className="flex-1 bg-blue-500/15 border-b border-zinc-700/50" />
          <div className="flex-1 bg-red-500/15" />
        </div>

        {/* Marcador */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-[70%] h-1.5 rounded-full transition-all duration-500"
          style={{
            backgroundColor: zone.color,
            bottom: `${pos}%`,
            boxShadow: `0 0 8px ${zone.color}80`,
          }}
        />
      </div>

      {/* Score + label */}
      <div className="flex flex-col">
        <span className={`${s.score} font-bold`} style={{ color: zone.color }}>
          {score.toFixed(1)}
        </span>
        <span className={`${s.text} text-zinc-500`}>
          {zone.label}
        </span>
      </div>
    </div>
  );
}

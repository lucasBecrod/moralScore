"use client";

import { useState } from "react";
import { KOHLBERG_STAGES, type KohlbergStage } from "@/shared/config/kohlberg-stages";

interface Cita {
  texto: string;
  ubicacion: string;
  indicador: string;
}

interface FuenteCardProps {
  estadio: number;
  titulo: string;
  medio?: string;
  fechaFuente?: string;
  confianza: "alta" | "media" | "baja";
  justificacion: string;
  citas: Cita[];
}

export default function FuenteCard({
  estadio,
  titulo,
  medio,
  fechaFuente,
  confianza,
  justificacion,
  citas,
}: FuenteCardProps) {
  const [expanded, setExpanded] = useState(false);
  const stage = KOHLBERG_STAGES[estadio as KohlbergStage];
  const color = stage?.color ?? "#6B7280";

  return (
    <div
      className="rounded-lg border bg-zinc-900 overflow-hidden cursor-pointer transition-shadow hover:shadow-md"
      style={{ borderLeftWidth: "4px", borderLeftColor: color }}
      onClick={() => setExpanded(!expanded)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") setExpanded(!expanded);
      }}
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <span
            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: color }}
          >
            {estadio}
          </span>
          <div>
            <p className="font-medium text-zinc-100">{titulo}</p>
            <p className="text-sm text-zinc-400">
              {medio && <span>{medio}</span>}
              {medio && fechaFuente && <span> &middot; </span>}
              {fechaFuente && <span>{fechaFuente}</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 uppercase">{confianza}</span>
          <svg
            className={`w-4 h-4 text-zinc-500 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-zinc-800 pt-3 space-y-4">
          <p className="text-sm text-zinc-300">{justificacion}</p>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
              Citas textuales
            </h4>
            {citas.map((cita, i) => (
              <div key={i} className="pl-3 border-l-2 border-zinc-700 space-y-1">
                <p className="text-sm italic text-zinc-200">
                  &ldquo;{cita.texto}&rdquo;
                </p>
                <p className="text-xs font-mono text-zinc-500">{cita.ubicacion}</p>
                <p className="text-xs text-zinc-500" style={{ color }}>
                  {cita.indicador}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
